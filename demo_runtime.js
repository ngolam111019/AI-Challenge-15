const runtimeService = require('./services/runtimeService');
const db = require('./db');

async function demo() {
    try {
        const tenantsRes = await db.query('SELECT id, slug, name FROM tenants ORDER BY id ASC');
        const claimData = {
            claimType: 'OUTPATIENT',
            amount: 10000 // Same amount for all
        };

        console.log('--- RUNTIME DEMONSTRATION ---');
        console.log(`Processing same claim (Amount: ${claimData.amount}, Type: ${claimData.claimType}) across different tenants:\n`);

        for (const tenant of tenantsRes.rows) {
            console.log(`>>> TENANT: ${tenant.name} (${tenant.slug})`);
            try {
                const result = await runtimeService.processClaim(tenant.id, claimData);
                console.log(JSON.stringify(result, null, 2));
            } catch (e) {
                console.error(`Error processing for ${tenant.slug}: ${e.message}`);
            }
            console.log('\n-----------------------------------\n');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

demo();
