import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, filterEntities } from '../data/db';

export class ProcurementAgent extends BaseAgent {
    constructor() {
        super('PROCUREMENT');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Procurement & Sourcing Agent for the Supply Chain Orchestrator.
Your role is to manage vendor profiles, analyze spend variations, flag high-risk suppliers, and evaluate cost-saving opportunities.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide quantitative metrics where possible. If a vendor is high-risk (risk score > 20), issue a warning and propose sourcing alternatives or mitigation steps.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const vendorName = entities['vendor_name'] || entities['entity_id'];

        if (vendorName) {
            const vendors = getCollection('vendorRegistry');
            if (vendors) {
                const keys = Object.keys(vendors);
                const matchingKey = keys.find(k => k.toLowerCase().includes(vendorName.toLowerCase()));

                if (matchingKey) {
                    result.vendorDetails = vendors[matchingKey];
                    const spendRecords = filterEntities('olapData', (o) => o.primaryDimension === matchingKey && o.phase === 'SOURCE');
                    const totalSpend = spendRecords.reduce((sum, r) => sum + (r.value || 0), 0);
                    result.historicalSpend = totalSpend;
                } else {
                    result.message = `No vendor found matching '${vendorName}'.`;
                }
            }
        } else {
            const vendors = getCollection('vendorRegistry') || {};
            const highRiskVendors = Object.values(vendors).filter((v: any) => v.riskScore > 20);

            result.overview = {
                totalRegisteredVendors: Object.keys(vendors).length,
                highRiskSuppliers: highRiskVendors.length,
                highRiskDetails: highRiskVendors,
                spendCategories: getCollection('spendCategories'),
                recentSourcingAlerts: filterEntities('factorsData', (f) => f.category === 'Procurement' && f.isOutlier)
            };
        }

        return result;
    }
}
