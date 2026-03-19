import { generateCompletion, streamCompletion, parseJSONResponse } from '../llm/wrapper';
import { PlanningAgent } from '../agents/PlanningAgent';
import { LogisticsAgent } from '../agents/LogisticsAgent';
import { ProcurementAgent } from '../agents/ProcurementAgent';
import { ManufacturingAgent } from '../agents/ManufacturingAgent';
import { ComplianceAgent } from '../agents/ComplianceAgent';
import { ReturnAgent } from '../agents/ReturnAgent';
import { DocumentAgent } from '../agents/DocumentAgent';
import { AgentContext } from '../agents/BaseAgent';
import { Response } from 'express';

const agents = {
    'PLANNING': new PlanningAgent(),
    'LOGISTICS': new LogisticsAgent(),
    'PROCUREMENT': new ProcurementAgent(),
    'MANUFACTURING': new ManufacturingAgent(),
    'COMPLIANCE': new ComplianceAgent(),
    'RETURN': new ReturnAgent(),
    'DOCUMENT': new DocumentAgent()
};

export interface RouteDecision {
    intent: 'CONVERSATION' | 'QUERY' | 'ACTION';
    agent: string;
    entities: Record<string, string>;
    reasoning: string;
    confidence: number;
}

export class Orchestrator {

    private static async classifyIntent(query: string, context: AgentContext): Promise<RouteDecision> {
        const prompt = `You are the core Orchestrator AI for an enterprise Supply Chain system.
Your task is to analyze the user's query and output a structured JSON response to route the request.

User Role: ${context.userRole}
Query: "${query}"

Available Agents:
- PLANNING (Inventory, LPO, Stockouts, Forecasts, SKU)
- LOGISTICS (Shipments, Transport, Routes, Delays, SHP-)
- PROCUREMENT (Vendors, Suppliers, Spend Categories)
- MANUFACTURING (Factory, Machine, Plant, OEE)
- COMPLIANCE (ESG, Carbon, ISO Standards, Audits)
- RETURN (RMA, Reverse Logistics, Disposition)
- DOCUMENT (Contracts, Legal texts)
- ORCHESTRATOR (General conversation, full system scans, generic greetings)

Consider the user's previous conversation history provided in the system context.
If the query refers to "it" or "that", use the history to determine the entity.

Output strictly in JSON format (do not use markdown wrapping or additional text):
{
  "intent": "CONVERSATION" | "QUERY" | "ACTION",
  "agent": "Name of the agent from the list above",
  "entities": {
     "key": "Extracted entity (e.g. sku: 'SKU-001', shipment_id: 'SHP-123', vendor_name: 'Acme')"
  },
  "reasoning": "A short, 1 sentence internal reasoning for this choice.",
  "confidence": <integer between 0 and 100 representing how confident you are in this classification>
}
`;

        try {
            const resultText = await generateCompletion("You are an expert system router outputting raw JSON.", prompt, context.history, {
                jsonMode: true,
                temperature: 0.1
            });
            const parsed = parseJSONResponse(resultText);

            if (parsed && parsed.intent && parsed.agent) {
                if (!parsed.confidence) parsed.confidence = 90;
                return parsed as RouteDecision;
            }
            throw new Error("Invalid format from LLM");
        } catch (error) {
            console.error("Classification error:", error);
            return {
                intent: 'CONVERSATION',
                agent: 'ORCHESTRATOR',
                entities: {},
                reasoning: 'Fallback classification due to error.',
                confidence: 50
            };
        }
    }

    public static async handleStream(query: string, context: AgentContext, res: Response) {
        try {
            res.write(`data: ${JSON.stringify({
                steps: [
                    { id: '1', label: 'Orchestrator: Parsing user intent (with context)...', status: 'processing' },
                    { id: '2', label: 'Orchestrator: Identifying entities...', status: 'pending' },
                    { id: '3', label: 'Delegating to domain agent...', status: 'pending' }
                ]
            })}\n\n`);

            const decision = await this.classifyIntent(query, context);
            context.entities = decision.entities || {};

            res.write(`data: ${JSON.stringify({
                steps: [
                    { id: '1', label: `Orchestrator: Intent classified as ${decision.intent}.`, status: 'completed' },
                    { id: '2', label: `Orchestrator: Entities parsed: ${JSON.stringify(decision.entities)}`, status: 'completed' },
                    { id: '3', label: `Delegating to ${decision.agent} Agent...`, status: 'processing' },
                    { id: '4', label: 'Agent: Analyzing domain data...', status: 'pending' }
                ],
                targetAgent: decision.agent,
                confidence: decision.confidence
            })}\n\n`);

            if (decision.intent === 'CONVERSATION' || decision.agent === 'ORCHESTRATOR') {
                 let prompt = `User Query: ${query}\n\nProvide a conversational response. You are the high-level Orchestrator. Help the user navigate domains. Keep it professional.`;

                 if (decision.intent === 'ACTION' && query.toLowerCase().includes('scan')) {
                     prompt = `User Request: Full system anomaly scan.\n\nData: LPO Agent reports SKU-004 stockout risk. Compliance Agent reports Scope 3 emissions spike. Logistics Agent reports Port Strike on West Coast.\n\nSummarize these system-wide anomalies professionally.`;
                     res.write(`data: ${JSON.stringify({
                         anomalies: [
                            { id: 'A1', severity: 'critical', title: 'Inventory Risk', description: 'SKU-004 stockout imminent', confidence: 98, metric: 'Inventory' },
                            { id: 'A2', severity: 'warning', title: 'Emission Spike', description: 'Scope 3 above threshold', confidence: 85, metric: 'Carbon' }
                         ]
                     })}\n\n`);
                 }

                 res.write(`data: ${JSON.stringify({ steps: [ { id: '4', label: 'Orchestrator: Formulating response...', status: 'completed' } ] })}\n\n`);

                 await streamCompletion("You are the overarching Supply Chain Orchestrator Agent.", prompt, context.history, res, { temperature: 0.5 });
                 return;
            }

            const agent = agents[decision.agent as keyof typeof agents];
            if (agent) {
                res.write(`data: ${JSON.stringify({
                    steps: [
                        { id: '3', label: `Delegated to ${decision.agent} Agent successfully.`, status: 'completed' },
                        { id: '4', label: 'Agent: Retrieving and analyzing data...', status: 'processing' }
                    ]
                })}\n\n`);
                await agent.streamResponse(query, context, res);
            } else {
                 throw new Error(`Agent ${decision.agent} not recognized.`);
            }

        } catch (error: any) {
             console.error("Orchestrator execution failed:", error);
             res.write(`data: ${JSON.stringify({ error: error.message || 'Orchestration failed' })}\n\n`);
             res.end();
        }
    }
}
