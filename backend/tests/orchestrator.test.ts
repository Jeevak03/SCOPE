import { describe, it, expect, vi } from 'vitest';
import { Orchestrator } from '../services/orchestrator';
import * as llmWrapper from '../llm/wrapper';
import { AgentContext } from '../agents/BaseAgent';

vi.mock('../llm/wrapper', () => ({
  generateCompletion: vi.fn(),
  parseJSONResponse: vi.fn(),
  streamCompletion: vi.fn(),
}));

describe('Orchestrator Core', () => {
    it('classifies intents and routes to the correct agent', async () => {
        const mockedClassifyResult = {
             intent: 'QUERY',
             agent: 'LOGISTICS',
             entities: { shipment_id: 'SHP-1092' },
             reasoning: 'User is asking about a specific shipment.',
             confidence: 95
        };

        vi.spyOn(llmWrapper, 'generateCompletion').mockResolvedValue(JSON.stringify(mockedClassifyResult));
        vi.spyOn(llmWrapper, 'parseJSONResponse').mockReturnValue(mockedClassifyResult);

        const context: AgentContext = {
             userRole: 'LOGISTICS',
             userName: 'James Foster',
             entities: {},
             history: []
        };

        const mockRes = {
             write: vi.fn(),
             end: vi.fn()
        } as any;

        vi.spyOn(llmWrapper, 'streamCompletion').mockResolvedValue(undefined as any);

        await Orchestrator.handleStream("Where is shipment SHP-1092?", context, mockRes);

        expect(llmWrapper.generateCompletion).toHaveBeenCalled();
        expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('Delegating to LOGISTICS Agent'));
        expect(context.entities).toHaveProperty('shipment_id', 'SHP-1092');
    });

    it('handles fallback correctly if LLM fails', async () => {
         vi.spyOn(llmWrapper, 'generateCompletion').mockRejectedValue(new Error("LLM Error"));

         const context: AgentContext = {
             userRole: 'EXECUTIVE',
             userName: 'Sarah',
             entities: {},
             history: []
         };

         const mockRes = {
             write: vi.fn(),
             end: vi.fn()
         } as any;

         await Orchestrator.handleStream("Hello there", context, mockRes);

         expect(mockRes.write).toHaveBeenCalledWith(expect.stringContaining('ORCHESTRATOR'));
    });
});
