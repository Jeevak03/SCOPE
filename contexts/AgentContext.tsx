import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CustomAgent, SCORPhase, DashboardWidgetConfig, UserRole } from '../types';

interface AgentContextType {
  agents: CustomAgent[];
  addAgent: (agent: CustomAgent) => void;
  updateAgent: (id: string, updates: Partial<CustomAgent>) => void;
  deleteAgent: (id: string) => void;
  getWidgetsByPhase: (phase: SCORPhase, userRole: UserRole) => DashboardWidgetConfig[];
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial Mock Data for a custom agent
  const [agents, setAgents] = useState<CustomAgent[]>([
    {
      id: 'ca-1',
      name: 'Spot Buy Bot',
      description: 'Automates small-dollar ad-hoc procurement requests under $5k.',
      phase: 'SOURCE',
      status: 'Active',
      createdBy: 'Maria Rodriguez',
      knowledgeBase: [
        { id: 'k1', name: 'Procurement_Policy_v2.pdf', type: 'PDF', content: '...', dateUploaded: new Date() }
      ],
      actions: ['Approve PO < $500', 'Check Vendor Whitelist'],
      widgets: [
        {
          id: 'w1',
          title: 'Spot Buy Volume',
          type: 'BAR_CHART',
          targetDashboard: 'SOURCE',
          visibleTo: ['PROCUREMENT', 'EXECUTIVE'],
          data: [
            { name: 'Mon', value: 12, color: '#3b82f6' },
            { name: 'Tue', value: 19, color: '#3b82f6' },
            { name: 'Wed', value: 8, color: '#3b82f6' },
            { name: 'Thu', value: 15, color: '#3b82f6' },
            { name: 'Fri', value: 22, color: '#3b82f6' },
          ]
        },
        {
          id: 'w2',
          title: 'Auto-Approved Spend',
          type: 'KPI_CARD',
          targetDashboard: 'SOURCE',
          visibleTo: ['PROCUREMENT'],
          data: [{ name: 'Spend', value: 4500 }],
          kpiUnit: 'USD'
        }
      ]
    }
  ]);

  const addAgent = (agent: CustomAgent) => {
    setAgents(prev => [...prev, agent]);
  };

  const updateAgent = (id: string, updates: Partial<CustomAgent>) => {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAgent = (id: string) => {
    setAgents(prev => prev.filter(a => a.id !== id));
  };

  // Helper to filter widgets for a specific dashboard page and user role
  const getWidgetsByPhase = (phase: SCORPhase, userRole: UserRole): DashboardWidgetConfig[] => {
    const widgets: DashboardWidgetConfig[] = [];
    agents.filter(a => a.phase === phase && a.status === 'Active').forEach(agent => {
      agent.widgets.forEach(w => {
        if (w.visibleTo.includes(userRole)) {
          widgets.push(w);
        }
      });
    });
    return widgets;
  };

  return (
    <AgentContext.Provider value={{ agents, addAgent, updateAgent, deleteAgent, getWidgetsByPhase }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgents = () => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgents must be used within an AgentProvider');
  }
  return context;
};