import { filterEntities, findEntity } from '../data/db';
import { generateCompletion, streamCompletion } from '../llm/wrapper';
import { Response } from 'express';

export interface AgentContext {
    userRole: string;
    userName: string;
    entities: Record<string, string>;
}

export abstract class BaseAgent {
    public agentName: string;

    constructor(agentName: string) {
        this.agentName = agentName;
    }

    protected abstract getSystemPrompt(context: AgentContext): string;

    protected abstract queryData(entities: Record<string, string>): any;

    public async processQuery(query: string, context: AgentContext): Promise<{ response: string, data?: any }> {
        const data = this.queryData(context.entities);
        const dataStr = JSON.stringify(data, null, 2);

        const prompt = `User Query: ${query}\n\nRelevant Data: ${dataStr}\n\nProvide an intelligent, analytical response explaining this data and giving actionable insights. Ensure it sounds natural and professional. Do NOT output markdown JSON, just the text.`;

        const response = await generateCompletion(
            this.getSystemPrompt(context),
            prompt,
            { temperature: 0.2 }
        );

        return { response, data };
    }

    public async streamResponse(query: string, context: AgentContext, res: Response): Promise<void> {
        const data = this.queryData(context.entities);
        const dataStr = JSON.stringify(data, null, 2);

        const prompt = `User Query: ${query}\n\nRelevant Internal Data retrieved: ${dataStr}\n\nAnalyze this data, summarize the findings, highlight any anomalies or risks, and propose next steps. If no data is found, state that gracefully and provide general advice based on the query. Do NOT output markdown JSON block. Be concise and professional.`;

        res.write(`data: ${JSON.stringify({ agentData: data })}\n\n`);

        await streamCompletion(
            this.getSystemPrompt(context),
            prompt,
            res,
            { temperature: 0.3 }
        );
    }
}
