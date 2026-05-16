const configService = require('./configService');
const { DateTime } = require('luxon');

class RuntimeService {
    async processClaim(tenantId, claimData) {
        const configRow = await configService.getLatestConfig(tenantId);
        if (!configRow) throw new Error('Tenant config not found');
        
        const config = configRow.config_data;
        const { claimType, amount } = claimData;

        // 1. Required documents
        const typeConfig = config.claimTypes.find(t => t.id === claimType);
        if (!typeConfig || !typeConfig.enabled) {
            throw new Error(`Claim type ${claimType} is not supported or disabled for this tenant`);
        }

        const requiredDocuments = typeConfig.requiredDocs || [];

        // 2. Approval routing
        let approvalTier = 'auto-approve';
        let approverRole = null;

        if (amount > (config.approvalRules.autoApproveThreshold || 0)) {
            const tier = config.approvalRules.tiers.find(t => amount > t.min && amount <= t.max);
            if (tier) {
                approvalTier = `Tiered Approval: ${tier.role}`;
                approverRole = tier.role;
            } else {
                approvalTier = 'Needs Manual Review (Out of bounds)';
            }
        }

        // 3. Notifications
        const events = config.notifications.events.filter(e => e.event === 'claim_submitted');
        const notifications = events.map(e => ({
            event: e.event,
            channels: e.channels,
            template: e.template
        }));

        // 4. SLA Deadline
        const slaDays = config.sla.claimTypeSla[claimType] || config.sla.defaultTargetDays || 5;
        // Calculation: Simple date + days (excluding weekends logic could be added here)
        const deadline = DateTime.now().plus({ days: slaDays }).toISODate();

        // 5. Custom Fields
        const requiredCustomFields = [
            ...config.customFields.text.filter(f => f.enabled && f.required),
            ...config.customFields.number.filter(f => f.enabled && f.required)
        ];

        return {
            tenantName: config.branding.companyName,
            claimType,
            requiredDocuments,
            approvalRouting: {
                tier: approvalTier,
                role: approverRole
            },
            notifications,
            slaDeadline: deadline,
            requiredCustomFields,
            status: 'processed'
        };
    }
}

module.exports = new RuntimeService();
