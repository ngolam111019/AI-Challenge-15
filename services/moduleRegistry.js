// Registry pattern for UI modules
const moduleRegistry = [
    { id: 'general', name: 'General Information', icon: 'building', template: 'modules/general.njk' },
    { id: 'branding', name: 'Branding & Identity', icon: 'palette', template: 'modules/branding.njk' },
    { id: 'claimTypes', name: 'Claim Types & Docs', icon: 'file-text', template: 'modules/claimTypes.njk' },
    { id: 'approvalRules', name: 'Approval Rules', icon: 'check-circle', template: 'modules/approvalRules.njk' },
    { id: 'notifications', name: 'Notifications', icon: 'bell', template: 'modules/notifications.njk' },
    { id: 'sla', name: 'SLA & Escalation', icon: 'clock', template: 'modules/sla.njk' },
    { id: 'customFields', name: 'Custom Fields', icon: 'sliders', template: 'modules/customFields.njk' }
];

module.exports = moduleRegistry;
