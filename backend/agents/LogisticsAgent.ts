import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, findEntity, filterEntities } from '../data/db';

export class LogisticsAgent extends BaseAgent {
    constructor() {
        super('LOGISTICS');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Logistics Agent for the Supply Chain Orchestrator.
Your role is to monitor global shipments, analyze transit delays, flag regional risks (like strikes or conflict zones), and recommend routing alternatives.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide clear status updates. If risks are active or shipments are delayed, explicitly mention alternate routes or impacts.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const shipmentId = entities['shipment_id'] || entities['entity_id'];

        if (shipmentId) {
            const shipment = findEntity('shipments', (s) => s.id === shipmentId.toUpperCase());
            if (shipment) {
                result.shipmentDetails = shipment;
                if (shipment.activeRisks && shipment.activeRisks.length > 0) {
                    const risks = filterEntities('riskZones', (rz) => shipment.activeRisks.includes(rz.id));
                    result.activeRiskZones = risks;
                }
            } else {
                result.message = `No tracking data found for shipment ${shipmentId}.`;
            }
        } else {
            const delayed = filterEntities('shipments', (s) => s.status === 'Delayed');
            const risks = getCollection('riskZones');
            result.overview = {
                totalActiveShipments: filterEntities('shipments', (s) => s.status !== 'Delivered').length,
                delayedShipmentsCount: delayed.length,
                delayedShipments: delayed,
                globalRisksActive: risks?.length || 0,
                activeRisks: risks
            };
        }

        return result;
    }
}
