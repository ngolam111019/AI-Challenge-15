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

// GET /api/tenants/diff-data
router.get('/tenants/diff-data', async (req, res) => {
    const { id1, id2 } = req.query;
    if (!id1 || !id2) {
        return res.send(`<tr><td colspan="3" class="p-12 text-center text-slate-400">Please select both Tenant A and Tenant B above to compare configurations.</td></tr>`);
    }

    try {
        const t1Res = await db.query('SELECT name, slug FROM tenants WHERE id = $1::int', [Number(id1)]);
        const t2Res = await db.query('SELECT name, slug FROM tenants WHERE id = $1::int', [Number(id2)]);
        if (t1Res.rows.length === 0 || t2Res.rows.length === 0) return res.send('<tr><td colspan="3" class="p-8 text-center text-rose-500">Tenant not found</td></tr>');

        const t1 = t1Res.rows[0];
        const t2 = t2Res.rows[0];

        const cfg1Res = await configService.getLatestConfig(id1);
        const cfg2Res = await configService.getLatestConfig(id2);

        const c1 = cfg1Res ? cfg1Res.config_data : {};
        const c2 = cfg2Res ? cfg2Res.config_data : {};

        // Section Header Generator
        const makeSection = (title) => `
            <tr class="bg-slate-100/90 border-t-2 border-b border-slate-200 is-section-header shadow-2xs">
                <td colspan="3" class="px-6 py-3 font-extrabold text-xs uppercase tracking-wider text-slate-800">
                    ${title}
                </td>
            </tr>
        `;

        // Row Generator
        const makeRow = (label, v1Html, v2Html, raw1, raw2) => {
            const r1Str = typeof raw1 === 'object' ? JSON.stringify(raw1) : String(raw1 ?? '');
            const r2Str = typeof raw2 === 'object' ? JSON.stringify(raw2) : String(raw2 ?? '');
            const isDiff = r1Str !== r2Str;
            const diffClass = isDiff ? 'bg-amber-50/90 font-semibold border-l-4 border-amber-500 text-amber-900 is-diff-row' : 'hover:bg-slate-50 text-slate-700';
            const badge = isDiff ? '<span class="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-200 text-amber-800 shadow-2xs">[≠] Diff</span>' : '';

            return `
            <tr class="transition ${diffClass}">
                <td class="px-6 py-4.5 whitespace-nowrap text-sm font-bold text-slate-900 flex items-center justify-between">
                    <span>${label}</span>
                    ${badge}
                </td>
                <td class="px-6 py-4.5 text-sm align-top">${v1Html}</td>
                <td class="px-6 py-4.5 text-sm align-top">${v2Html}</td>
            </tr>`;
        };

        // Formatting Helpers
        const fmtText = (val, isCode = false) => `<span class="${isCode ? 'font-mono text-xs bg-white px-2.5 py-1 rounded border border-slate-200 font-bold text-slate-800 shadow-2xs inline-block' : 'text-slate-800 font-semibold'}">${val || '(None)'}</span>`;
        const fmtColor = (hex) => `<div class="flex items-center space-x-2"><span class="w-5 h-5 inline-block rounded-lg border border-slate-300 shadow-2xs" style="background: ${hex || '#000'}"></span> <code class="font-mono text-xs font-bold bg-white px-2 py-0.5 rounded border border-slate-200">${hex || '(None)'}</code></div>`;
        
        const getClaimObj = (cfg, cid) => (cfg.claimTypes || []).find(c => c.id === cid) || { id: cid, enabled: false, requiredDocs: [] };
        const fmtClaim = (claim) => {
            const statusHtml = claim.enabled 
                ? `<span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs inline-block mb-2.5 shadow-2xs">Enabled ✅</span>` 
                : `<span class="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-bold text-xs inline-block mb-2.5">Disabled ❌</span>`;
            
            if (!claim.enabled) return statusHtml;

            const docs = claim.requiredDocs || [];
            const docsHtml = docs.length === 0 
                ? '<div class="text-slate-400 italic text-xs">No verification documents required</div>' 
                : `<div class="space-y-1.5"><div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Required Documents:</div><div class="flex flex-wrap gap-1.5">` + docs.map(d => `<div class="bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs font-semibold text-xs inline-flex items-center space-x-1.5"><span>📄 ${d.name}</span> <span class="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold ${d.required ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}">${d.required ? 'Mandatory' : 'Optional'}</span></div>`).join('') + `</div></div>`;
                
            return `<div class="space-y-2">${statusHtml}${docsHtml}</div>`;
        };

        const fmtAuto = (rule) => `<div class="font-mono font-extrabold bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs inline-block text-emerald-800 text-base">$ ${(rule?.autoApproveThreshold ?? 0).toLocaleString()}</div>`;
        const fmtTiers = (rule) => {
            const tiers = rule?.tiers || [];
            if (tiers.length === 0) return '<div class="text-slate-400 italic text-xs">No tiers configured</div>';
            return `<div class="space-y-2.5">` + tiers.map((t, i) => `<div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-xs space-y-1.5"><div class="flex items-center justify-between font-bold text-purple-900 uppercase"><span>Tier ${i+1}: Role</span> <span class="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-lg font-mono font-extrabold">${t.role}</span></div><div class="text-slate-600 font-medium">Approval Limit: <span class="font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">$${Number(t.min).toLocaleString()}</span> → <span class="font-mono font-bold bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">${t.max >= 1000000000 ? 'Unlimited ∞' : '$' + Number(t.max).toLocaleString()}</span></div></div>`).join('') + `</div>`;
        };

        const getEvt = (cfg, evtName) => (cfg.notifications?.events || []).find(e => e.event === evtName);
        const fmtEvt = (evtObj) => {
            if (!evtObj || !evtObj.channels || evtObj.channels.length === 0) return '<div class="text-slate-400 italic text-xs font-semibold">Inactive / Disabled</div>';
            const channels = evtObj.channels || [];
            let html = `<div class="space-y-2.5"><div class="flex flex-wrap gap-1.5">` + channels.map(ch => `<span class="px-2.5 py-1 bg-blue-100 text-blue-800 font-extrabold text-xs uppercase rounded-lg shadow-2xs">🏷️ ${ch}</span>`).join('') + `</div>`;
            
            const cfg = evtObj.channelConfigs || {};
            channels.forEach(ch => {
                const chCfg = cfg[ch] || {};
                const isCustom = chCfg.templateType === 'custom';
                html += `<div class="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs text-xs space-y-1"><div class="font-bold uppercase text-slate-700">${ch} Channel Config:</div><div class="font-mono bg-slate-50 p-2 rounded-lg text-slate-700 border border-slate-100 font-medium truncate">${isCustom ? `Custom Endpoint/ID: ${chCfg.customTemplateId || '(Not set)'}` : 'Default System Standard Template'}</div></div>`;
            });
            html += `</div>`;
            return html;
        };

        const fmtWorkingDays = (sla) => {
            const days = sla?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            return `<div class="flex flex-wrap gap-1.5">` + days.map(d => `<span class="bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold px-2.5 py-1 rounded-xl text-xs shadow-2xs">${d}</span>`).join('') + `</div>`;
        };
        const fmtSlaRule = (sla, cid) => {
            const rule = sla?.claimTypeSla?.[cid];
            if (!rule) return '<div class="text-slate-400 italic text-xs">Using default SLA resolution target</div>';
            let html = `<div class="space-y-2.5"><div class="font-extrabold text-xs text-blue-900">Target Resolution: <span class="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg font-mono ml-1 shadow-2xs">${rule.targetDays ?? 5} working days</span></div>`;
            const esc = rule.escalations || [];
            if (esc.length > 0) {
                html += `<div class="text-[11px] font-bold uppercase tracking-wider text-rose-800 pt-1">🚨 Auto-Escalation Pathways:</div><div class="space-y-1.5">` + esc.map(e => `<div class="bg-rose-50 border border-rose-200 p-2.5 rounded-xl text-xs font-bold text-rose-900 flex items-center justify-between shadow-2xs"><span>If delayed by +${e.delayDays}d:</span> <span class="uppercase bg-white px-2.5 py-1 rounded-lg border border-rose-200 text-rose-700 font-mono font-extrabold">Notify ${e.notifyRole}</span></div>`).join('') + `</div>`;
            } else {
                html += `<div class="text-[11px] text-slate-400 italic">No escalations configured</div>`;
            }
            html += `</div>`;
            return html;
        };

        const fmtFields = (fields) => {
            if (!fields || fields.length === 0) return '<div class="text-slate-400 italic text-xs">No custom fields configured</div>';
            return `<div class="space-y-2.5">` + fields.map(f => `<div class="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5"><div class="flex items-center justify-between"><span class="font-extrabold text-sm text-slate-900">${f.label}</span> <span class="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-extrabold ${f.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">${f.required ? 'Required' : 'Optional'}</span></div><div class="text-xs text-slate-500 font-mono space-y-1 pt-1 border-t border-slate-100"><div>Key: <span class="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-bold">${f.key}</span></div>${f.regex ? `<div>Regex: <span class="bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 text-slate-800 font-bold">${f.regex}</span></div>` : ''}</div></div>`).join('') + `</div>`;
        };

        const claimTypesList = ['OUTPATIENT', 'INPATIENT', 'DENTAL', 'MATERNITY', 'OPTICAL'];
        const eventsList = ['claim_submitted', 'approved', 'rejected', 'payment_sent'];

        let html = `
            ${makeSection('🏢 1. General Information & Identity')}
            ${makeRow('Company Registered Name', fmtText(t1.name), fmtText(t2.name), t1.name, t2.name)}
            ${makeRow('Unique Slug Identifier', fmtText(t1.slug, true), fmtText(t2.slug, true), t1.slug, t2.slug)}

            ${makeSection('🎨 2. Branding & Visual Aesthetics')}
            ${makeRow('Primary Brand Color', fmtColor(c1.branding?.primaryColor), fmtColor(c2.branding?.primaryColor), c1.branding?.primaryColor, c2.branding?.primaryColor)}
            ${makeRow('Secondary Brand Color', fmtColor(c1.branding?.secondaryColor), fmtColor(c2.branding?.secondaryColor), c1.branding?.secondaryColor, c2.branding?.secondaryColor)}

            ${makeSection('📑 3. Claim Types & Required Documentation')}
            ${claimTypesList.map(cid => {
                const cl1 = getClaimObj(c1, cid);
                const cl2 = getClaimObj(c2, cid);
                return makeRow(`Claim Type: ${cid}`, fmtClaim(cl1), fmtClaim(cl2), cl1, cl2);
            }).join('')}

            ${makeSection('🛡️ 4. Approval Rules & Hierarchy Matrix')}
            ${makeRow('Instant Auto-Approval Threshold', fmtAuto(c1.approvalRules), fmtAuto(c2.approvalRules), c1.approvalRules?.autoApproveThreshold, c2.approvalRules?.autoApproveThreshold)}
            ${makeRow('Approval Hierarchy Tiers', fmtTiers(c1.approvalRules), fmtTiers(c2.approvalRules), c1.approvalRules?.tiers, c2.approvalRules?.tiers)}

            ${makeSection('📢 5. Lifecycle Notification Hooks')}
            ${eventsList.map(evt => {
                const ev1 = getEvt(c1, evt);
                const ev2 = getEvt(c2, evt);
                return makeRow(`Event Hook: <code class="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-700 ml-1 font-bold uppercase">${evt}</code>`, fmtEvt(ev1), fmtEvt(ev2), ev1, ev2);
            }).join('')}

            ${makeSection('⏳ 6. SLA Resolution & Escalations')}
            ${makeRow('Active Working Days in Week', fmtWorkingDays(c1.sla), fmtWorkingDays(c2.sla), c1.sla?.workingDays, c2.sla?.workingDays)}
            ${claimTypesList.map(cid => {
                const s1 = c1.sla?.claimTypeSla?.[cid];
                const s2 = c2.sla?.claimTypeSla?.[cid];
                return makeRow(`SLA Target: ${cid}`, fmtSlaRule(c1.sla, cid), fmtSlaRule(c2.sla, cid), s1, s2);
            }).join('')}

            ${makeSection('🧩 7. Custom Metadata Schema Verification')}
            ${makeRow('Text Custom Metadata Fields', fmtFields(c1.customFields?.text), fmtFields(c2.customFields?.text), c1.customFields?.text, c2.customFields?.text)}
        `;

        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('<tr><td colspan="3" class="p-8 text-center text-rose-500 font-bold">Error loading diff data</td></tr>');
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
        const slugCheck = await db.query('SELECT id FROM tenants WHERE slug = $1::text', [slug]);
        if (slugCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Tenant Slug already exists. Please choose another.' });
        }

        // Insert tenant
        const tenantRes = await db.query(
            'INSERT INTO tenants (slug, name) VALUES ($1::text, $2::text) RETURNING id',
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
        await db.query('UPDATE tenants SET name = $1::text WHERE id = $2::int', [name, Number(id)]);

        // Create new version
        const newConfigId = await configService.createNewVersion(id, config || {}, changeNote);
        
        // Get new version number
        const vRes = await db.query('SELECT version_number FROM tenant_configs WHERE id = $1::int', [Number(newConfigId)]);
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
                await client.query('DELETE FROM tenants WHERE id = $1::int', [Number(id)]);
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

// DELETE /api/tenants/:id - Delete single tenant
router.delete('/tenants/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM tenants WHERE id = $1::int', [Number(id)]);
        res.setHeader('HX-Trigger', JSON.stringify({ showToast: { message: 'Tenant deleted successfully!', type: 'success' } }));
        res.send(''); 
    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).send('<span class="text-rose-500">Error deleting tenant</span>');
    }
});

// GET /api/tenants/:id/history-list - Table rows of version history
router.get('/tenants/:id/history-list', async (req, res) => {
    try {
        const { id } = req.params;
        const tenantRes = await db.query('SELECT current_version_id FROM tenants WHERE id = $1::int', [Number(id)]);
        if (tenantRes.rows.length === 0) return res.send('<tr><td colspan="5">Tenant not found</td></tr>');
        
        const currentVersionId = tenantRes.rows[0].current_version_id;

        const histRes = await db.query(`
            SELECT id, version_number, created_at, note 
            FROM tenant_configs 
            WHERE tenant_id = $1::int 
            ORDER BY version_number DESC
        `, [Number(id)]);

        if (histRes.rows.length === 0) {
            return res.send('<tr><td colspan="5" class="p-8 text-center text-slate-400">No version history found.</td></tr>');
        }

        let html = '';
        histRes.rows.forEach(r => {
            const isActive = r.id === currentVersionId;
            const dateStr = new Date(r.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            
            html += `
            <tr class="hover:bg-slate-50 transition ${isActive ? 'bg-emerald-50/40 font-semibold' : ''}">
                <td class="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-slate-900">
                    v${r.version_number}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    ${dateStr}
                </td>
                <td class="px-6 py-4 text-sm text-slate-800 font-medium">
                    ${r.note || '<span class="text-slate-400 italic">No commit message</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    ${isActive ? '<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Current ⭐</span>' : '<span class="text-xs text-slate-400">Archived</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    ${!isActive ? `
                    <button @click="confirmRollback(${r.id}, ${r.version_number})" class="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-bold transition">
                        🔄 Rollback
                    </button>
                    ` : '<span class="inline-block px-3 py-1.5 text-xs text-slate-300 font-mono">Active</span>'}
                </td>
            </tr>`;
        });

        res.send(html);
    } catch (err) {
        console.error(err);
        res.status(500).send('<tr><td colspan="5" class="text-rose-500">Error loading history</td></tr>');
    }
});

// GET /api/tenants/:id/versions/:versionId - Get specific version snapshot
router.get('/tenants/:id/versions/:versionId', async (req, res) => {
    try {
        const { id, versionId } = req.params;
        const vRes = await db.query('SELECT config_data, version_number, created_at, note FROM tenant_configs WHERE id = $1::int AND tenant_id = $2::int', [Number(versionId), Number(id)]);
        if (vRes.rows.length === 0) return res.status(404).json({ error: 'Version not found' });
        res.json(vRes.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/tenants/:id/rollback - Rollback to version
router.post('/tenants/:id/rollback', async (req, res) => {
    try {
        const { id } = req.params;
        const { targetVersionId } = req.body;
        
        const newVersionId = await configService.rollback(id, targetVersionId);
        const vRes = await db.query('SELECT version_number FROM tenant_configs WHERE id = $1::int', [Number(newVersionId)]);
        
        res.setHeader('HX-Trigger', JSON.stringify({ 
            showToast: { message: `Successfully rolled back to version v${vRes.rows[0].version_number}!`, type: 'success' },
            refreshHistory: true 
        }));
        res.json({ success: true, newVersionNumber: vRes.rows[0].version_number });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Rollback failed' });
    }
});

// GET /api/tenants/:id/preview-context - Load dynamic schema for simulation form
router.get('/tenants/:id/preview-context', async (req, res) => {
    try {
        const { id } = req.params;
        const configRow = await configService.getLatestConfig(id);
        if (!configRow) return res.status(404).json({ error: 'Config not found' });
        
        const config = configRow.config_data;
        const claimTypes = config.claimTypes ? config.claimTypes.filter(c => c.enabled) : [];
        const customFields = config.customFields?.text ? config.customFields.text.filter(f => f.enabled) : [];
        const branding = config.branding || { companyName: '', primaryColor: '#2563eb' };
        
        res.json({ claimTypes, customFields, branding });
    } catch (e) {
        console.error('Context error:', e);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/preview/simulate - Execute runtime engine and return visual pipeline HTML
router.post('/preview/simulate', async (req, res) => {
    try {
        const { tenantId, claimType, amount, customFields } = req.body;
        if (!tenantId || !claimType) {
            return res.send('<div class="p-12 text-center text-slate-400 font-medium">Please select a tenant and claim type on the left to begin real-time pipeline execution.</div>');
        }

        const runtimeService = require('../services/runtimeService');
        const result = await runtimeService.processClaim(tenantId, { 
            claimType, 
            amount: Number(amount) || 0, 
            customFields 
        });

        const color = result.primaryColor;
        const secColor = result.secondaryColor;
        const amtStr = `$${Number(result.amount).toLocaleString()}`;
        
        let docsHtml = result.requiredDocuments.map(d => `
            <span class="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold ${d.required ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 border border-slate-200'}">
                📄 ${d.name} <span class="ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase ${d.required ? 'bg-blue-700 text-blue-100' : 'bg-slate-200 text-slate-600'}">${d.required ? 'Mandatory' : 'Optional'}</span>
            </span>`).join(' ') || '<span class="text-xs text-slate-400 italic">No verification documents required</span>';
        
        let notifHtml = result.notifications.map(n => `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5 text-xs">
                <div class="flex items-center justify-between font-bold text-slate-900 border-b border-slate-200/60 pb-2.5">
                    <span class="flex items-center space-x-2.5"><span>📢 Lifecycle Event Hook:</span> <span class="font-mono bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded text-xs uppercase font-extrabold">${n.event}</span></span>
                    <span class="bg-white px-3 py-1 rounded-xl border border-slate-200 font-extrabold text-slate-700 shadow-2xs">Active Channels: ${(n.channels||[]).join(', ')}</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    ${n.configs.map(c => `
                        <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs font-medium space-y-1">
                            <span class="font-extrabold uppercase text-slate-800 block text-xs flex items-center space-x-1">${c.channel === 'email' ? '<span>📧 Email Gateway</span>' : c.channel === 'sms' ? '<span>📱 SMS Dispatch</span>' : '<span>🌐 HTTP Webhook</span>'}</span>
                            <span class="text-[11px] font-mono text-slate-600 block truncate">${c.detail}</span>
                        </div>
                    `).join('')}
                </div>
            </div>`).join('') || '<span class="text-xs text-slate-400 italic">No notifications configured</span>';

        let fieldsHtml = result.customFieldValidation.map(f => `
            <div class="flex items-center justify-between p-3.5 rounded-2xl ${f.isValid ? 'bg-emerald-50/50 border border-emerald-200/80 text-emerald-900' : 'bg-rose-50 border-2 border-rose-400 text-rose-900 font-bold'} text-xs">
                <div>
                    <span class="font-bold text-sm text-slate-900">${f.label}</span>
                    <span class="text-[10px] uppercase font-mono font-extrabold ml-2 px-2 py-0.5 rounded ${f.required ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}">${f.required ? 'Required' : 'Optional'}</span>
                </div>
                <div>
                    ${f.isValid ? `<span class="font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-slate-800 font-bold">${f.submittedValue || '(Empty)'}</span> ✅` : '<span class="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-extrabold">⚠️ Missing Required Field</span>'}
                </div>
            </div>`).join('') || '<span class="text-xs text-slate-400 italic">No custom fields configured for this tenant</span>';

        let html = `
        <div class="space-y-6">
            <!-- Execution Banner -->
            <div class="p-8 rounded-3xl text-white shadow-xl flex items-center justify-between border border-white/10" style="background: linear-gradient(135deg, ${color}, ${secColor})">
                <div class="space-y-1">
                    <span class="text-xs font-mono font-extrabold tracking-wider uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">Execution Pipeline Target</span>
                    <h2 class="text-3xl font-extrabold">${result.tenantName}</h2>
                </div>
                <div class="text-right">
                    <span class="text-xs font-bold opacity-90 block tracking-wide uppercase">Simulated Claim Amount</span>
                    <span class="text-2xl font-extrabold font-mono">${amtStr} (${result.claimType})</span>
                </div>
            </div>

            <!-- Custom Field Errors Alert (if any) -->
            ${result.hasCustomFieldErrors ? `
            <div class="p-5 rounded-2xl bg-rose-500 text-white font-bold text-sm shadow-lg flex items-center space-x-3 animate-pulse">
                <span class="text-3xl">⚠️</span>
                <div>
                    <div class="text-base uppercase tracking-wider font-extrabold">Validation Error: Required Metadata Missing</div>
                    <div class="text-xs font-normal opacity-90">The claim cannot proceed to approval routing until all mandatory custom fields are populated.</div>
                </div>
            </div>
            ` : ''}

            <!-- Pipeline Cards Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Approval Matrix Routing -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                    <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>🛡️ Approval Routing Tier</span>
                    </div>
                    <div class="p-5 rounded-2xl ${result.approvalRouting.isAutoApprove ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-extrabold' : 'bg-purple-50 text-purple-800 border border-purple-200 font-bold'} flex items-center justify-between text-lg shadow-2xs">
                        <span>${result.approvalRouting.tier}</span>
                        <span class="text-3xl">${result.approvalRouting.isAutoApprove ? '⚡' : '👥'}</span>
                    </div>
                </div>

                <!-- SLA Tracker & Escalations -->
                <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                    <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <span>⏳ Expected SLA Resolution & Escalations</span>
                    </div>
                    <div class="p-4 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 flex flex-col justify-center space-y-1 shadow-2xs">
                        <span class="text-xs font-semibold">Target Processing Time: ${result.slaTargetDays} working days</span>
                        <span class="text-xl font-extrabold font-mono text-blue-900">${result.slaDeadline}</span>
                        <span class="text-[11px] font-medium text-blue-900/80 pt-1 border-t border-blue-200/60 block truncate">
                            Active Days in Week: ${(result.workingDays||[]).join(', ')}
                        </span>
                    </div>
                    ${result.escalations && result.escalations.length > 0 ? `
                        <div class="pt-2 space-y-1.5">
                            <span class="text-[11px] font-extrabold uppercase tracking-wider text-rose-800 block">🚨 Auto-Escalation Pathways</span>
                            ${result.escalations.map(esc => `
                                <div class="p-2.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs font-bold text-rose-900 flex items-center justify-between shadow-2xs">
                                    <span>If delayed by ${esc.delayDays}d past target:</span>
                                    <span class="uppercase font-mono font-extrabold bg-white px-2.5 py-1 rounded shadow-2xs text-rose-700 border border-rose-200">Notify ${esc.notifyRole}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="text-[11px] text-slate-400 italic pt-1">No automatic escalations configured for this claim type</div>'}
                </div>
            </div>

            <!-- Required Documentation -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>📑 Verification Documents Required for Submission</span>
                </div>
                <div class="flex flex-wrap gap-3 pt-1">
                    ${docsHtml}
                </div>
            </div>

            <!-- Notifications Workflow -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>🔔 Outbound Notification Channels & Templates</span>
                </div>
                <div class="space-y-3 pt-1">
                    ${notifHtml}
                </div>
            </div>

            <!-- Custom Metadata Fields Verification -->
            <div class="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
                <div class="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>🏷️ Tenant-Specific Custom Metadata Validation</span>
                </div>
                <div class="space-y-2.5 pt-1">
                    ${fieldsHtml}
                </div>
            </div>
        </div>
        `;

        res.send(html);
    } catch (err) {
        console.error('Simulate error:', err);
        res.status(500).send('<div class="p-8 bg-rose-50 text-rose-600 rounded-2xl font-bold border border-rose-200">Error executing simulation: ' + err.message + '</div>');
    }
});

// POST /api/admin/reset-seed - Reset database to pristine sample tenants
router.post('/admin/reset-seed', async (req, res) => {
    try {
        const seedScript = require('../seed');
        await seedScript.seed(false);
        res.json({ success: true, message: 'Database successfully reset to 3 pristine Sample Tenants!' });
    } catch (err) {
        console.error('Reset seed error:', err);
        res.status(500).json({ error: 'Failed to reset sample tenants' });
    }
});

module.exports = router;
