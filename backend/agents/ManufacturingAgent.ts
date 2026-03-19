import { BaseAgent, AgentContext } from './BaseAgent';
import { getCollection, findEntity } from '../data/db';

export class ManufacturingAgent extends BaseAgent {
    constructor() {
        super('MANUFACTURING');
    }

    protected getSystemPrompt(context: AgentContext): string {
        return `You are the Manufacturing (Make) Agent for the Supply Chain Orchestrator.
Your role is to monitor factory production, assess digital twin machine telemetry (OEE, vibration, temperature), and recommend predictive maintenance.
User Context: Name: ${context.userName}, Role: ${context.userRole}.
Provide quantitative factory efficiency analysis. If a machine health score is < 80, explicitly recommend urgent maintenance and highlight the failure risk.`;
    }

    protected queryData(entities: Record<string, string>): any {
        const result: any = { status: 'Success' };

        const machineId = entities['machine_id'] || entities['entity_id'];

        if (machineId) {
            const machine = findEntity('machineStatus', (m) => m.id === machineId.toUpperCase() || m.name.toLowerCase().includes(machineId.toLowerCase()));
            if (machine) {
                result.machineTelemetry = machine;
                if (machine.health < 80) {
                    result.maintenanceWarning = true;
                }
            } else {
                result.message = `No telemetry found for machine ${machineId}.`;
            }
        } else {
            const machines = getCollection('machineStatus');
            const atRisk = machines?.filter((m: any) => m.health < 80) || [];

            result.overview = {
                totalMachinesTracked: machines?.length || 0,
                machinesAtRisk: atRisk.length,
                atRiskDetails: atRisk,
                averageOEE: machines ? (machines.reduce((acc: number, m: any) => acc + m.oee, 0) / machines.length).toFixed(1) + '%' : 'N/A'
            };
        }

        return result;
    }
}
