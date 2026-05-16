const express = require('express');
const router = express.Router();
const db = require('../db');
const configService = require('../services/configService');

// GET /api/tenants - HTML table rows for HTMX
router.get('/tenants', async (req, res) => {
    try {
        const result = await db.query(`
            SELECT t.id, t.name, t.slug, tc.version_number, t.created_at 
            FROM tenants t 
            LEFT JOIN tenant_configs tc ON t.current_version_id = tc.id 
            ORDER BY t.created_at DESC
        `);
        
        if (result.rows.length === 0) {
            return res.send(`
                <tr>
                    <td colspan="6" class="p-8 text-center text-slate-500 italic">No tenants found. Create your first one!</td>
                </tr>
            `);
        }

        let html = '';
        result.rows.forEach((row, index) => {
            const dateStr = new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            html += `
            <tr id="tenant-row-${row.id}" class="hover:bg-slate-50/80 transition group">
                <td class="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" value="${row.id}" x-model="selected" class="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500">
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${index + 1}</td>
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded inline-block mt-3 ml-6">${row.slug}</td>
                <td class="px-6 py-4 whitespace-nowrap font-bold text-slate-900">${row.name}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">${dateStr}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <a href="/tenants/${row.id}/edit" class="inline-flex items-center px-2.5 py-1.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition">
                        ✏️ Edit
                    </a>
                    <a href="/tenants/preview?tenantId=${row.id}" class="inline-flex items-center px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition">
                        👁️ Preview
                    </a>
                    <a href="/tenants/${row.id}/history" class="inline-flex items-center px-2.5 py-1.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition">
                        🕒 History
                    </a>
                    <button hx-delete="/api/tenants/${row.id}" 
                            hx-confirm="Are you sure you want to delete ${row.name}?" 
                            hx-target="#tenant-row-${row.id}" 
                            hx-swap="outerHTML swap:500ms"
                            class="inline-flex items-center px-2.5 py-1.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition">
                        🗑️ Delete
                    </button>
                </td>
            </tr>`;
        });
        
        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('<tr><td colspan="6" class="p-8 text-center text-rose-500 font-bold">Error loading tenants</td></tr>');
    }
});

// POST /api/tenants - Create new tenant
router.post('/tenants', async (req, res) => {
    try {
        const { slug, name, config, changeNote } = req.body;
        
        if (!slug || !name) {
            return res.status(400).json({ error: 'Slug and Tenant Name are required' });
        }

        // Validate SLA
        if (config && config.sla) {
            if (config.sla.defaultTargetDays < 0) {
                return res.status(400).json({ error: 'SLA phải lớn hơn 0 (SLA target days must be >= 0)' });
            }
            for (const key in config.sla.claimTypeSla) {
                if (config.sla.claimTypeSla[key] < 0) {
                    return res.status(400).json({ error: `SLA cho ${key} phải lớn hơn 0` });
                }
            }
        }

        // Check unique slug
        const slugCheck = await db.query('SELECT id FROM tenants WHERE slug = $1', [slug]);
        if (slugCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Tenant Slug already exists. Please choose another.' });
        }

        // Insert tenant
        const tenantRes = await db.query(
            'INSERT INTO tenants (slug, name) VALUES ($1, $2) RETURNING id',
            [slug, name]
        );
        const tenantId = tenantRes.rows[0].id;

        // Insert initial config version
        const note = changeNote || 'Initial configuration setup';
        await configService.createNewVersion(tenantId, config || {}, note);

        res.json({ success: true, tenantId, message: 'Tenant created successfully!' });
    } catch (err) {
        console.error('Create tenant error:', err);
        res.status(500).json({ error: 'Server error while creating tenant' });
    }
});

// PUT /api/tenants/:id - Update tenant & create new version
router.put('/tenants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, config, changeNote } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Tenant Name is required' });
        }

        // Mandatory Change Note validation (TC2.3)
        if (!changeNote || changeNote.trim() === '') {
            return res.status(400).json({ error: 'Vui lòng nhập lý do thay đổi (Change Note is required)' });
        }

        // SLA validation (TC2.4)
        if (config && config.sla) {
            if (config.sla.defaultTargetDays < 0) {
                return res.status(400).json({ error: 'SLA phải lớn hơn 0 (SLA target days must be >= 0)' });
            }
            for (const key in config.sla.claimTypeSla) {
                if (config.sla.claimTypeSla[key] < 0) {
                    return res.status(400).json({ error: `SLA cho ${key} phải lớn hơn 0` });
                }
            }
        }

        // Update tenant name
        await db.query('UPDATE tenants SET name = $1 WHERE id = $2', [name, id]);

        // Create new version
        const newConfigId = await configService.createNewVersion(id, config || {}, changeNote);
        
        // Get new version number
        const vRes = await db.query('SELECT version_number FROM tenant_configs WHERE id = $1', [newConfigId]);
        const newVersionNumber = vRes.rows[0].version_number;

        res.json({ 
            success: true, 
            versionNumber: newVersionNumber, 
            message: `Successfully saved version v${newVersionNumber}!` 
        });
    } catch (err) {
        console.error('Update tenant error:', err);
        res.status(500).json({ error: 'Server error while updating tenant' });
    }
});

// DELETE /api/tenants/:id - Delete single tenant
router.delete('/tenants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tenants WHERE id = $1', [id]);
        res.setHeader('HX-Trigger', JSON.stringify({ showToast: { message: 'Tenant deleted successfully!', type: 'success' } }));
        res.send(''); 
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).send('<span class="text-rose-500">Error deleting tenant</span>');
    }
});

// DELETE /api/tenants/batch - Delete multiple tenants
router.delete('/tenants/batch', async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send('No tenant IDs specified');
        }
        
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');
            for (const id of ids) {
                await client.query('DELETE FROM tenants WHERE id = $1', [id]);
            }
            await client.query('COMMIT');
            res.setHeader('HX-Trigger', JSON.stringify({ 
                showToast: { message: `Successfully deleted ${ids.length} tenants!`, type: 'success' },
                refreshTenants: true 
            }));
            res.send('');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Batch delete error:', err);
        res.status(500).send('Error deleting tenants');
    }
});

module.exports = router;
