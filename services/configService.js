const db = require('../db');

class ConfigService {
    async getLatestConfig(tenantId) {
        if (!tenantId || isNaN(tenantId)) return null;
        const res = await db.query(`
            SELECT tc.* FROM tenant_configs tc
            JOIN tenants t ON t.current_version_id = tc.id
            WHERE t.id = $1::int
        `, [Number(tenantId)]);
        return res.rows[0];
    }

    async createNewVersion(tenantId, newConfigData, note = 'Manual update') {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Get latest version number
            const versionRes = await client.query(
                'SELECT COALESCE(MAX(version_number), 0) as max_v FROM tenant_configs WHERE tenant_id = $1::int',
                [Number(tenantId)]
            );
            const nextVersion = Number(versionRes.rows[0].max_v) + 1;

            // Insert new config with note
            const insertRes = await client.query(
                'INSERT INTO tenant_configs (tenant_id, version_number, config_data, note) VALUES ($1::int, $2::int, $3::jsonb, $4::text) RETURNING id',
                [Number(tenantId), nextVersion, JSON.stringify(newConfigData), note]
            );
            const newConfigId = insertRes.rows[0].id;

            // Update current version in tenant table
            await client.query(
                'UPDATE tenants SET current_version_id = $1::int, updated_at = CURRENT_TIMESTAMP WHERE id = $2::int',
                [Number(newConfigId), Number(tenantId)]
            );

            await client.query('COMMIT');
            return newConfigId;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async rollback(tenantId, targetVersionId) {
        // GitHub-style: Fetch the old config and create a NEW version record from it
        const targetRes = await db.query(
            'SELECT config_data, version_number FROM tenant_configs WHERE id = $1::int AND tenant_id = $2::int',
            [Number(targetVersionId), Number(tenantId)]
        );
        
        if (targetRes.rows.length === 0) throw new Error('Target version not found');
        
        const oldConfig = targetRes.rows[0].config_data;
        const oldVersionNum = targetRes.rows[0].version_number;
        
        const note = `Rollback from version v${oldVersionNum}`;
        return await this.createNewVersion(tenantId, oldConfig, note);
    }
}

module.exports = new ConfigService();
