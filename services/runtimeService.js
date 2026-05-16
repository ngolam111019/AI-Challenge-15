const configService = require('./configService');
const { DateTime } = require('luxon');

class RuntimeService {
    async processClaim(tenantId, claimData) {
        const configRow = await configService.getLatestConfig(tenantId);
        if (!configRow) throw new Error('Tenant config not found');
        
        const config = configRow.config_data;
        const { claimType, amount, customFields = {} } = claimData;

        // 1. Required documents
        const typeConfig = config.claimTypes.find(t => t.id === claimType);
        if (!typeConfig || !typeConfig.enabled) {
            throw new Error(`Claim type '${claimType}' is not supported or disabled for this tenant`);
        }

        const requiredDocuments = typeConfig.requiredDocs || [];

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
        const events = config.notifications.events ? config.notifications.events.filter(e => e.event === 'claim_submitted') : [];
        const notifications = events.map(e => ({
            event: e.event,
            channels: e.channels,
            template: e.template
        }));

        // 4. SLA Deadline
        const slaDays = (config.sla.claimTypeSla && config.sla.claimTypeSla[claimType] !== undefined && config.sla.claimTypeSla[claimType] !== null && config.sla.claimTypeSla[claimType] !== "") 
            ? config.sla.claimTypeSla[claimType] 
            : (config.sla.defaultTargetDays ?? 5);
        
        const submissionDate = DateTime.now();
        const deadline = submissionDate.plus({ days: Number(slaDays) }).toFormat('MMMM dd, yyyy');

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
            customFieldValidation,
            hasCustomFieldErrors,
            status: hasCustomFieldErrors ? 'validation_failed' : 'processed'
        };
    }
}

module.exports = new RuntimeService();
