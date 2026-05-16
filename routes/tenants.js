const express = require('express');
const router = express.Router();
const db = require('../db');
const configService = require('../services/configService');

// GET /tenants - List all tenants
router.get('/', (req, res) => {
    res.render('tenants/list', { title: 'Tenants Management' });
});

// GET /tenants/new - Create new tenant form
router.get('/new', (req, res) => {
    res.render('tenants/edit', { title: 'Create New Tenant', mode: 'create' });
});

// GET /tenants/diff - Config diff screen
router.get('/diff', async (req, res) => {
    const { id1, id2 } = req.query;
    res.render('tenants/diff', { title: 'Config Diff Comparison', id1, id2 });
});

// GET /tenants/preview - Preview / Simulation sandbox screen
router.get('/preview', async (req, res) => {
    const { tenantId } = req.query;
    res.render('tenants/preview', { title: 'Simulation Sandbox', selectedTenantId: tenantId });
});

// GET /tenants/:id/history - Config history screen
router.get('/:id/history', async (req, res) => {
    const { id } = req.params;
    try {
        const tenantRes = await db.query('SELECT name FROM tenants WHERE id = $1', [id]);
        if (tenantRes.rows.length === 0) return res.status(404).send('Tenant not found');
        res.render('tenants/history', { title: `History: ${tenantRes.rows[0].name}`, tenantId: id, tenantName: tenantRes.rows[0].name });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading history');
    }
});

// GET /tenants/:id/edit - Edit existing tenant form
router.get('/:id/edit', async (req, res) => {
    const { id } = req.params;
    try {
        const tenantRes = await db.query('SELECT * FROM tenants WHERE id = $1', [id]);
        if (tenantRes.rows.length === 0) return res.status(404).send('Tenant not found');
        
        const tenant = tenantRes.rows[0];
        const latestConfig = await configService.getLatestConfig(id);
        
        res.render('tenants/edit', { 
            title: `Configure: ${tenant.name}`, 
            mode: 'edit', 
            tenant, 
            config: latestConfig ? latestConfig.config_data : null,
            versionNumber: latestConfig ? latestConfig.version_number : 1
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error loading tenant configuration');
    }
});

module.exports = router;
