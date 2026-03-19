import { Request, Response } from 'express';
import { Orchestrator } from '../services/orchestrator';
import { AgentContext } from '../agents/BaseAgent';

export const streamChat = async (req: Request, res: Response) => {
    try {
        const { query, context, history } = req.body;

        if (!query) {
             return res.status(400).json({ error: "Missing query" });
        }

        const agentContext: AgentContext = {
            userName: context?.userName || 'User',
            userRole: context?.userRole || 'EXECUTIVE',
            entities: {},
            history: history || []
        };

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        await Orchestrator.handleStream(query, agentContext, res);

    } catch (error: any) {
        console.error("Chat controller error:", error);
        if (!res.headersSent) {
            res.status(500).json({ error: error.message });
        } else {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        }
    }
};
