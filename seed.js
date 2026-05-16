const db = require('./db');

async function createTenant(slug, name, config, note = 'Initial configuration') {
    const tenantRes = await db.query(
        'INSERT INTO tenants (slug, name) VALUES ($1, $2) RETURNING id',
        [slug, name]
    );
    const tenantId = tenantRes.rows[0].id;

    const configRes = await db.query(
        'INSERT INTO tenant_configs (tenant_id, version_number, config_data, note) VALUES ($1, $2, $3, $4) RETURNING id',
        [tenantId, 1, JSON.stringify(config), note]
    );
    const configId = configRes.rows[0].id;

    await db.query('UPDATE tenants SET current_version_id = $1 WHERE id = $2', [configId, tenantId]);
    return tenantId;
}

async function seed(isCLI = true) {
    try {
        console.log('Cleaning existing data...');
        await db.query('TRUNCATE tenants, tenant_configs, claims RESTART IDENTITY CASCADE');

        console.log('Seeding 3 Specific Sample Tenants...');

        // 1. Tenant A — "SafeGuard Insurance" (Corporate)
        const tenantAConfig = {
            branding: { companyName: 'SafeGuard Insurance', primaryColor: '#1e40af', secondaryColor: '#3b82f6', logoUrl: '' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Medical Bill', required: true }] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Hospital Discharge Report', required: true }] },
                { id: 'DENTAL', name: 'Dental', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }, { name: 'Dental Receipt', required: true }] },
                { id: 'MATERNITY', name: 'Maternity', enabled: false, requiredDocs: [] },
                { id: 'OPTICAL', name: 'Optical', enabled: false, requiredDocs: [] }
            ],
            approvalRules: { 
                autoApproveThreshold: 20000, 
                tiers: [
                    { min: 20000, max: 100000, role: 'assessor' },
                    { min: 100000, max: 500000, role: 'team_lead' },
                    { min: 500000, max: 1000000000, role: 'director' }
                ] 
            },
            notifications: { 
                events: [{ 
                    event: 'claim_submitted', 
                    channels: ['email'], 
                    channelConfigs: {
                        email: { templateType: 'custom', customTemplateId: 'sg_safeguard_welcome' },
                        sms: { templateType: 'default', customTemplateId: '' },
                        webhook: { templateType: 'default', customTemplateId: '' }
                    }
                }] 
            },
            sla: { 
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                claimTypeSla: { 
                    OUTPATIENT: { targetDays: 5, escalations: [{ delayDays: 1, notifyRole: 'assessor' }] },
                    INPATIENT: { targetDays: 10, escalations: [{ delayDays: 2, notifyRole: 'team_lead' }] },
                    DENTAL: { targetDays: 5, escalations: [] }
                }
            },
            customFields: { 
                text: [{ id: 'employee_id', label: 'Employee ID', enabled: true, required: true }], 
                number: [] 
            }
        };
        await createTenant('safeguard', 'SafeGuard Insurance', tenantAConfig);

        // 2. Tenant B — "HealthFirst" (Retail)
        const tenantBConfig = {
            branding: { companyName: 'HealthFirst', primaryColor: '#16a34a', secondaryColor: '#22c55e', logoUrl: '' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }] },
                { id: 'DENTAL', name: 'Dental', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }] },
                { id: 'MATERNITY', name: 'Maternity', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }] },
                { id: 'OPTICAL', name: 'Optical', enabled: true, requiredDocs: [{ name: 'ID Card', required: true }] }
            ],
            approvalRules: { 
                autoApproveThreshold: 5000, 
                tiers: [
                    { min: 5000, max: 50000, role: 'assessor' },
                    { min: 50000, max: 1000000000, role: 'team_lead' }
                ] 
            },
            notifications: { 
                events: [{ 
                    event: 'claim_submitted', 
                    channels: ['email', 'sms'], 
                    channelConfigs: {
                        email: { templateType: 'default', customTemplateId: '' },
                        sms: { templateType: 'custom', customTemplateId: 'hf_sms_retail_01' },
                        webhook: { templateType: 'default', customTemplateId: '' }
                    }
                }] 
            },
            sla: { 
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                claimTypeSla: {
                    OUTPATIENT: { targetDays: 7, escalations: [] },
                    INPATIENT: { targetDays: 7, escalations: [] },
                    DENTAL: { targetDays: 7, escalations: [] },
                    MATERNITY: { targetDays: 7, escalations: [] },
                    OPTICAL: { targetDays: 7, escalations: [] }
                }
            },
            customFields: { text: [], number: [] }
        };
        await createTenant('healthfirst', 'HealthFirst', tenantBConfig);

        // 3. Tenant C — "GovHealth" (Government)
        const tenantCConfig = {
            branding: { companyName: 'GovHealth', primaryColor: '#dc2626', secondaryColor: '#ef4444', logoUrl: '' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: [{ name: 'Gov ID Card', required: true }, { name: 'Standard Bill', required: true }] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: [{ name: 'Gov ID Card', required: true }, { name: 'Hospital Statement', required: true }] },
                { id: 'DENTAL', name: 'Dental', enabled: false, requiredDocs: [] },
                { id: 'MATERNITY', name: 'Maternity', enabled: false, requiredDocs: [] },
                { id: 'OPTICAL', name: 'Optical', enabled: false, requiredDocs: [] }
            ],
            approvalRules: { 
                autoApproveThreshold: 0, 
                tiers: [
                    { min: 0, max: 1000000000, role: 'director' }
                ] 
            },
            notifications: { 
                events: [{ 
                    event: 'claim_submitted', 
                    channels: ['email', 'webhook'], 
                    channelConfigs: {
                        email: { templateType: 'default', customTemplateId: '' },
                        sms: { templateType: 'default', customTemplateId: '' },
                        webhook: { templateType: 'custom', customTemplateId: 'https://api.govhealth.gov/v1/erp/sync' }
                    }
                }] 
            },
            sla: { 
                workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
                claimTypeSla: {
                    OUTPATIENT: { targetDays: 15, escalations: [{ delayDays: 3, notifyRole: 'director' }] },
                    INPATIENT: { targetDays: 15, escalations: [{ delayDays: 5, notifyRole: 'director' }] }
                }
            },
            customFields: { 
                text: [
                    { id: 'dept', label: 'Department', enabled: true, required: true },
                    { id: 'budget_code', label: 'Budget Code', enabled: true, required: true }
                ], 
                number: [] 
            }
        };
        await createTenant('govhealth', 'GovHealth', tenantCConfig);

        console.log('Seeding completed successfully.');
        if (isCLI) process.exit(0);
    } catch (err) {
        console.error(err);
        if (isCLI) process.exit(1);
    }
}

if (require.main === module) {
    seed(true);
}

module.exports = { seed, createTenant };
