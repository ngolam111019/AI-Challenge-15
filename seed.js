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

async function seed() {
    try {
        console.log('Cleaning existing data...');
        await db.query('TRUNCATE tenants, tenant_configs, claims RESTART IDENTITY CASCADE');

        console.log('Seeding 3 Specific Sample Tenants...');

        // 1. Tenant A — "SafeGuard Insurance" (Corporate)
        const tenantAConfig = {
            branding: { companyName: 'SafeGuard Insurance', primaryColor: '#1e40af' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: ['ID', 'Bill'] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: ['ID', 'Hospital Report'] },
                { id: 'DENTAL', name: 'Dental', enabled: true, requiredDocs: ['ID', 'Dental Receipt'] }
            ],
            approvalRules: { 
                autoApproveThreshold: 20000, 
                tiers: [
                    { min: 20000, max: 100000, role: 'assessor' },
                    { min: 100000, max: 500000, role: 'team_lead' },
                    { min: 500000, max: 1000000000, role: 'director' }
                ] 
            },
            notifications: { events: [{ event: 'claim_submitted', channels: ['email'], template: 'corporate_tpl' }] },
            sla: { 
                defaultTargetDays: 5, 
                claimTypeSla: { OUTPATIENT: 5, INPATIENT: 10, DENTAL: 5 }, 
                escalation: [] 
            },
            customFields: { 
                text: [{ id: 'employee_id', label: 'Employee ID', enabled: true, required: true }], 
                number: [] 
            }
        };
        await createTenant('safeguard', 'SafeGuard Insurance', tenantAConfig);

        // 2. Tenant B — "HealthFirst" (Retail)
        const tenantBConfig = {
            branding: { companyName: 'HealthFirst', primaryColor: '#16a34a' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: ['ID'] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: ['ID'] },
                { id: 'DENTAL', name: 'Dental', enabled: true, requiredDocs: ['ID'] },
                { id: 'MATERNITY', name: 'Maternity', enabled: true, requiredDocs: ['ID'] },
                { id: 'OPTICAL', name: 'Optical', enabled: true, requiredDocs: ['ID'] }
            ],
            approvalRules: { 
                autoApproveThreshold: 5000, 
                tiers: [
                    { min: 5000, max: 50000, role: 'assessor' },
                    { min: 50000, max: 1000000000, role: 'manager' }
                ] 
            },
            notifications: { events: [{ event: 'claim_submitted', channels: ['email', 'sms'], template: 'retail_tpl' }] },
            sla: { 
                defaultTargetDays: 7, 
                claimTypeSla: {}, 
                escalation: [] 
            },
            customFields: { text: [], number: [] }
        };
        await createTenant('healthfirst', 'HealthFirst', tenantBConfig);

        // 3. Tenant C — "GovHealth" (Government)
        const tenantCConfig = {
            branding: { companyName: 'GovHealth', primaryColor: '#dc2626' },
            claimTypes: [
                { id: 'OUTPATIENT', name: 'Outpatient', enabled: true, requiredDocs: ['Gov ID', 'Standard Bill'] },
                { id: 'INPATIENT', name: 'Inpatient', enabled: true, requiredDocs: ['Gov ID', 'Hospital Statement'] }
            ],
            approvalRules: { 
                autoApproveThreshold: 0, 
                tiers: [
                    { min: 0, max: 1000000000, role: 'committee' }
                ] 
            },
            notifications: { events: [{ event: 'claim_submitted', channels: ['email', 'webhook'], template: 'gov_tpl' }] },
            sla: { 
                defaultTargetDays: 15, 
                claimTypeSla: {}, 
                escalation: [] 
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
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
