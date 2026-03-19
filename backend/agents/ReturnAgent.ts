import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, findEntity } from '../data/db';

export class ReturnAgent extends BaseAgent {
    constructor() {
        super('RETURN');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Returns (Reverse Logistics) Agent for the Supply Chain Orchestrator.
Your role is to manage return requests (RMA), track disposition statuses (Refurbish, Scrap, Restock), and evaluate reverse supply chain financial impact.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide quantitative insight into cost recovery, eligibility decisions, and the root causes of return requests. Be professional and decisive.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const rmaId = entities['rma_id'] || entities['entity_id'];

        if (rmaId) {
            const rma = findEntity('recentReturns', (r) => r.id === rmaId.toUpperCase());
            if (rma) {
                result.returnRequest = rma;
                if (rma.status === 'Pending') {
                    result.recommendedAction = 'Needs review based on eligibility criteria.';
                }
            } else {
                result.message = `No Return Request found for ${rmaId}.`;
            }
        } else {
            const returns = getCollection('recentReturns') || [];
            const pending = returns.filter((r: any) => r.status === 'Pending');
            const totalFinancialImpact = returns.reduce((sum: number, r: any) => sum + r.financialImpact, 0);

            result.overview = {
                activeReturnRequests: returns.length,
                pendingApprovals: pending.length,
                pendingDetails: pending,
                totalFinancialImpact: totalFinancialImpact,
                dispositionBreakdown: getCollection('dispositionData')
            };
        }

        return result;
    }
}
