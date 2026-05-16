const configService = require('./configService');
const { DateTime } = require('luxon');

class RuntimeService {
    async processClaim(tenantId, claimData) {
        const configRow = await configService.getLatestConfig(tenantId);
        if (!configRow) throw new Error('Tenant config not found');
        
        const config = configRow.config_data;
        const { claimType, amount, customFields = {} } = claimData;

        // 1. Required documents
        const typeConfig = config.claimTypes?.find(t => t.id === claimType);
        if (!typeConfig || !typeConfig.enabled) {
            throw new Error(`Claim type '${claimType}' is not supported or disabled for this tenant`);
        }

        const requiredDocuments = (typeConfig.requiredDocs || []).map(doc => {
            if (typeof doc === 'string') return { name: doc, required: true };
            return doc;
        });

        // 2. Approval routing
        let approvalTier = 'auto-approve';
        let approverRole = 'Auto-Approve ⚡';

        if (amount > (config.approvalRules.autoApproveThreshold || 0)) {
            const tier = config.approvalRules.tiers.find(t => amount >= t.min && amount <= t.max);
            if (tier) {
                approvalTier = `Tiered Approval: ${tier.role}`;
                approverRole = tier.role;
            } else {
                approvalTier = 'Needs Manual Review (Out of bounds)';
                approverRole = 'Manual Escalation';
            }
        }

        // 3. Notifications
        const events = config.notifications?.events || [];
        const notifications = events.map(e => {
            let configs = e.channelConfigs || {};
            let activeChannels = e.channels || [];
            return {
                event: e.event,
                channels: activeChannels,
                configs: activeChannels.map(ch => {
                    let cfg = configs[ch] || { templateType: 'default', customTemplateId: '' };
                    let tplStr = cfg.templateType === 'custom' ? `Custom Endpoint/ID: ${cfg.customTemplateId}` : 'Default System Template';
                    return { channel: ch, detail: tplStr };
                })
            };
        });

        // 4. SLA Deadline & Escalations
        const slaObj = config.sla?.claimTypeSla?.[claimType] || {};
        const slaDays = (typeof slaObj === 'object' && slaObj.targetDays !== undefined) ? slaObj.targetDays : (config.sla?.defaultTargetDays ?? 5);
        const escalations = slaObj.escalations || [];
        const workingDays = config.sla?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        
        let currentDate = DateTime.now();
        let daysAdded = 0;
        const targetCount = Number(slaDays);
        if (workingDays.length > 0 && targetCount > 0) {
            while (daysAdded < targetCount) {
                currentDate = currentDate.plus({ days: 1 });
                if (workingDays.includes(currentDate.weekdayLong)) {
                    daysAdded++;
                }
            }
        }
        const deadline = currentDate.toFormat('MMMM dd, yyyy');

        // 5. Custom Fields Validation
        const allCustomFields = config.customFields?.text ? config.customFields.text.filter(f => f.enabled) : [];
        const customFieldValidation = allCustomFields.map(f => {
            const val = customFields[f.id] || '';
            const isValid = !f.required || (val && val.trim() !== '');
            return {
                id: f.id,
                label: f.label,
                required: f.required,
                submittedValue: val,
                isValid
            };
        });

        const hasCustomFieldErrors = customFieldValidation.some(f => !f.isValid);

        return {
            tenantName: config.branding?.companyName || 'Corporate Client',
            primaryColor: config.branding?.primaryColor || '#2563eb',
            secondaryColor: config.branding?.secondaryColor || '#1e293b',
            claimType,
            amount,
            requiredDocuments,
            approvalRouting: {
                tier: approvalTier,
                role: approverRole,
                isAutoApprove: approvalTier === 'auto-approve'
            },
            notifications,
            slaDeadline: deadline,
            slaTargetDays: slaDays,
            escalations,
            workingDays,
            customFieldValidation,
            hasCustomFieldErrors,
            status: hasCustomFieldErrors ? 'validation_failed' : 'processed'
        };
    }
}

module.exports = new RuntimeService();
