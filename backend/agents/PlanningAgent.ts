import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, findEntity } from '../data/db';

export class PlanningAgent extends BaseAgent {
    constructor() {
        super('LPO');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Planning (LPO) Agent for the Supply Chain Orchestrator.
Your role is to analyze inventory data, stockout risks, forecasting errors, and production anomalies.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide clear, actionable insights regarding inventory levels and planning strategies.
Identify outliers (e.g., Z-scores > 2.0).
Use bullet points for readability. Provide the specific metric values if requested.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const sku = entities['sku'] || entities['entity_id'];
        if (sku) {
            const inventory = findEntity('inventoryData', (i) => i.sku === sku.toUpperCase());
            const anomalous = findEntity('anomalousInventoryData', (i) => i.sku === sku.toUpperCase());
            const forecast = findEntity('forecastingData', (f) => f.sku === sku.toUpperCase() || f.sku === sku.toUpperCase().replace('-', ''));

            if (inventory) result.inventory = inventory;
            if (anomalous && anomalous.isAnomaly) result.anomalyAlert = anomalous;
            if (forecast) result.forecastError = forecast;

            if (Object.keys(result).length === 1) {
                result.message = `No specific planning data found for SKU ${sku}.`;
            }
        } else {
            const allAnomalies = getCollection('anomalousInventoryData')?.filter((i: any) => i.isAnomaly);
            result.overview = {
                totalSKUsMonitored: getCollection('inventoryData')?.length || 0,
                activeAnomalies: allAnomalies?.length || 0,
                anomalies: allAnomalies,
                averageProductionPerformance: "92% (from recent Make phase tracking)"
            };
        }

        return result;
    }
}
