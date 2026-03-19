import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, filterEntities } from '../data/db';

export class DocumentAgent extends BaseAgent {
    constructor() {
        super('DOCUMENT');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Document Intelligence Agent for the Supply Chain Orchestrator.
Your role is to analyze contracts, legal documents, supply agreements, and compliance reports.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide precise summaries of clauses, terms, and similarity matches. Be objective and legally precise. If specific clauses are found, quote them directly and explain their supply chain implications.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const docName = entities['doc_id'] || entities['entity_id'];

        if (docName) {
            const matches = filterEntities('mockCitations', (c) => c.filename.toLowerCase().includes(docName.toLowerCase()));
            if (matches.length > 0) {
                result.documentCitations = matches;
            } else {
                result.message = `No documents found matching '${docName}'.`;
            }
        } else {
            const docs = getCollection('mockCitations') || [];

            result.overview = {
                totalDocumentsIndexed: docs.length,
                recentCitations: docs
            };
        }

        return result;
    }
}
