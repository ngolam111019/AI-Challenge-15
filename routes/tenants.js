const express = require('express');
const router = express.Router();
const db = require('../db');
const configService = require('../services/configService');
const moduleRegistry = require('../services/moduleRegistry');

const defaultConfig = {
    branding: { companyName: '', primaryColor: '#2563eb', secondaryColor: '#1e293b', logoUrl: '' },
    claimTypes: [
        { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Medical Bill', required: true }] },
        { id: 'INPATIENT', name: 'Inpatient', enabled: false, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Hospital Discharge Summary', required: true }] },
        { id: 'DENTAL', name: 'Dental', enabled: false, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Dental Receipt', required: false }] },
        { id: 'MATERNITY', name: 'Maternity', enabled: false, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Birth Certificate', required: true }] },
        { id: 'OPTICAL', name: 'Optical', enabled: false, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Optometrist Prescription', required: false }] }
    ],
    approvalRules: {
        autoApproveThreshold: 5000,
        tiers: [
            { min: 5000, max: 50000, role: 'assessor' },
            { min: 50000, max: 1000000000, role: 'team_lead' }
        ]
    },
    notifications: { 
        events: [
            { 
                event: 'claim_submitted', 
                channels: ['email'], 
                channelConfigs: {
                    email: { templateType: 'default', customTemplateId: '' },
                    sms: { templateType: 'default', customTemplateId: '' },
                    webhook: { templateType: 'custom', customTemplateId: 'https://api.erp.local/v1/claims/notify' }
                }
            },
            { 
                event: 'approved', 
                channels: ['email', 'sms'], 
                channelConfigs: {
                    email: { templateType: 'default', customTemplateId: '' },
                    sms: { templateType: 'default', customTemplateId: '' },
                    webhook: { templateType: 'default', customTemplateId: '' }
                }
            },
            { 
                event: 'rejected', 
                channels: ['email'], 
                channelConfigs: {
                    email: { templateType: 'default', customTemplateId: '' },
                    sms: { templateType: 'default', customTemplateId: '' },
                    webhook: { templateType: 'default', customTemplateId: '' }
                }
            },
            { 
                event: 'payment_sent', 
                channels: ['email', 'webhook'], 
                channelConfigs: {
                    email: { templateType: 'default', customTemplateId: '' },
                    sms: { templateType: 'default', customTemplateId: '' },
                    webhook: { templateType: 'default', customTemplateId: '' }
                }
            }
        ] 
    },
    sla: { 
        workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        claimTypeSla: { 
            OUTPATIENT: { targetDays: 5, escalations: [{ delayDays: 1, notifyRole: 'assessor' }] }
        }
    },
    customFields: { text: [], number: [] }
};

// GET /tenants - List all tenants
router.get('/', (req, res) => {
    res.render('tenants/list', { title: 'Tenants Management' });
});

// GET /tenants/new - Create new tenant form
router.get('/new', (req, res) => {
    res.render('tenants/edit', { 
        title: 'Create New Tenant', 
        mode: 'create',
        modules: moduleRegistry,
        config: defaultConfig,
        versionNumber: 1
    });
});

// GET /tenants/diff - Config diff screen
router.get('/diff', async (req, res) => {
    const { id1, id2 } = req.query;
    try {
        const tenantsRes = await db.query('SELECT id, name, slug FROM tenants ORDER BY name');
        res.render('tenants/diff', { title: 'Config Diff Comparison', id1, id2, tenants: tenantsRes.rows });
    } catch (e) {
        res.status(500).send('Error loading tenants');
    }
});

// GET /tenants/preview - Preview / Simulation sandbox screen
router.get('/preview', async (req, res) => {
    const { tenantId } = req.query;
    try {
        const tenantsRes = await db.query('SELECT id, name, slug FROM tenants ORDER BY name');
        res.render('tenants/preview', { title: 'Simulation Sandbox', selectedTenantId: tenantId, tenants: tenantsRes.rows });
    } catch (e) {
        res.status(500).send('Error loading preview');
    }
});

// GET /tenants/:id/history - Config history screen
router.get('/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const tenantRes = await db.query('SELECT * FROM tenants WHERE id = $1::int', [Number(id)]);
        if (tenantRes.rows.length === 0) return res.status(404).send('Tenant not found');
        res.render('tenants/history', { 
            title: `History: ${tenantRes.rows[0].name}`, 
            tenantId: id, 
            tenant: tenantRes.rows[0] 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading history');
    }
});

// GET /tenants/:id/edit - Edit existing tenant form
router.get('/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
        const tenantRes = await db.query('SELECT * FROM tenants WHERE id = $1::int', [Number(id)]);
        if (tenantRes.rows.length === 0) return res.status(404).send('Tenant not found');
        
        const tenant = tenantRes.rows[0];
        const latestConfig = await configService.getLatestConfig(id);
        
        res.render('tenants/edit', { 
            title: `Configure: ${tenant.name}`, 
            mode: 'edit', 
            tenant, 
            config: latestConfig ? latestConfig.config_data : defaultConfig,
            versionNumber: latestConfig ? latestConfig.version_number : 1,
            modules: moduleRegistry
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading tenant configuration');
    }
});

module.exports = router;
