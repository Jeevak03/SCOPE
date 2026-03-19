import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, findEntity, filterEntities } from '../data/db';

export class ComplianceAgent extends BaseAgent {
    constructor() {
        super('COMPLIANCE');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Compliance (ESG & Regulatory) Agent for the Supply Chain Orchestrator.
Your role is to monitor ISO standards, carbon emissions, audit findings, and corporate sustainability metrics.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide clear compliance scores and carbon footprints. If Scope 3 targets are missed, suggest mitigation strategies. Address open audit findings clearly.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const standard = entities['standard'] || entities['entity_id'];

        if (standard) {
            const metric = findEntity('complianceMetrics', (c) => c.standard.includes(standard.toUpperCase()));
            if (metric) {
                result.isoStandardDetails = metric;

                const openAudits = filterEntities('auditLogs', (a) => a.standard.includes(standard.toUpperCase()) && a.status === 'Open');
                if (openAudits.length > 0) result.openAuditFindings = openAudits;
            } else {
                result.message = `No compliance standard matching '${standard}' found.`;
            }
        } else {
            const openLogs = filterEntities('auditLogs', (a) => a.status === 'Open');
            const atRiskStandards = filterEntities('complianceMetrics', (c) => c.status === 'At Risk');
            const carbonLatest = getCollection('carbonData')?.slice(-1)[0];

            result.overview = {
                activeAuditFindings: openLogs.length,
                standardsAtRisk: atRiskStandards.length,
                standardsAtRiskDetails: atRiskStandards,
                latestCarbonSnapshot: carbonLatest,
                recentAuditLogs: openLogs
            };
        }

        return result;
    }
}
