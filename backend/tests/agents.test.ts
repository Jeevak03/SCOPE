import { describe, it, expect, vi } from 'vitest';
import { PlanningAgent } from '../agents/PlanningAgent';
import { LogisticsAgent } from '../agents/LogisticsAgent';
import * as db from '../data/db';
import { AgentContext } from '../agents/BaseAgent';

vi.mock('../data/db', () => ({
   getCollection: vi.fn(),
   findEntity: vi.fn(),
   filterEntities: vi.fn()
}));

describe('Agents Data Retrieval', () => {

    const context: AgentContext = {
        userName: 'Test User',
        userRole: 'EXECUTIVE',
        entities: {},
        history: []
    };

    it('PlanningAgent retrieves SKU specific data', () => {
        const agent = new PlanningAgent();
        const mockSkuContext = { ...context, entities: { sku: 'SKU-001' } };

        vi.spyOn(db, 'findEntity').mockReturnValue({ sku: 'SKU-001', stockoutInstances: 20 });

        const data = (agent as any).queryData(mockSkuContext.entities);

        expect(db.findEntity).toHaveBeenCalled();
        expect(data).toHaveProperty('inventory');
        expect(data.inventory.sku).toBe('SKU-001');
    });

    it('LogisticsAgent returns general overview when no entity provided', () => {
         const agent = new LogisticsAgent();

         vi.spyOn(db, 'filterEntities').mockReturnValue([{ status: 'Delayed' }]);
         vi.spyOn(db, 'getCollection').mockReturnValue([]);

         const data = (agent as any).queryData(context.entities);

         expect(data).toHaveProperty('overview');
         expect(data.overview.delayedShipmentsCount).toBe(1);
    });

});
