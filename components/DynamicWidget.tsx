import React from 'react';
import { DashboardWidgetConfig } from '../types';
import { ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ArrowUpRight, Activity, Zap, Play } from 'lucide-react';
import { useNotifications } from '../contexts/NotificationContext';

interface DynamicWidgetProps {
  config: DashboardWidgetConfig;
}

const DynamicWidget: React.FC<DynamicWidgetProps> = ({ config }) => {
  const { addNotification } = useNotifications();

  const handleActionClick = () => {
     addNotification({
        title: 'Action Triggered',
        message: `Executed action: ${config.actionLabel || 'Custom Agent Workflow'}`,
        type: 'success',
        link: '#'
     });
  };

  // KPI Card
  if (config.type === 'KPI_CARD') {
    const metric = config.data[0];
    return (
      <div className="bg-[#15151a] border border-blue-500/30 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500 transition-colors">
         <div className="absolute top-0 right-0 p-2 opacity-50">
             <Activity size={16} className="text-blue-500" />
         </div>
         <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">{config.title}</h3>
         <div className="flex items-baseline">
            <span className="text-3xl font-bold text-white">{metric.value.toLocaleString()}</span>
            {config.kpiUnit && <span className="ml-1 text-sm text-gray-500">{config.kpiUnit}</span>}
         </div>
         <div className="mt-2 text-xs text-green-400 flex items-center">
            <ArrowUpRight size={12} className="mr-1" />
            Live Agent Data
         </div>
      </div>
    );
  }

  // Action Panel
  if (config.type === 'ACTION_PANEL') {
     return (
        <div className="bg-[#15151a] border border-purple-500/30 rounded-xl p-5 flex flex-col justify-between hover:border-purple-500 transition-colors">
           <div>
              <div className="flex items-center space-x-2 mb-2">
                 <Zap size={16} className="text-purple-500" />
                 <h3 className="text-sm font-bold text-gray-200">{config.title}</h3>
              </div>
              <p className="text-xs text-gray-400 mb-4">Click to execute the configured agent workflow inside this phase.</p>
           </div>
           <button 
             onClick={handleActionClick}
             className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-bold flex items-center justify-center transition-colors"
           >
              <Play size={12} className="mr-2 fill-current" />
              {config.actionLabel || 'Run Workflow'}
           </button>
        </div>
     );
  }

  // Bar Chart
  if (config.type === 'BAR_CHART') {
    return (
      <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 h-[250px] flex flex-col">
         <h3 className="text-sm font-bold text-gray-200 mb-4">{config.title}</h3>
         <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={config.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                  <YAxis stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#3f3f46', color: '#fff' }} 
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[2, 2, 0, 0]}>
                     {config.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                     ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
    );
  }

  // Pie Chart
  if (config.type === 'PIE_CHART') {
     return (
      <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 h-[250px] flex flex-col">
         <h3 className="text-sm font-bold text-gray-200 mb-4">{config.title}</h3>
         <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={config.data}
                     innerRadius={40}
                     outerRadius={70}
                     paddingAngle={5}
                     dataKey="value"
                  >
                     {config.data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                     ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e1e24', borderColor: '#3f3f46', color: '#fff' }} />
               </PieChart>
            </ResponsiveContainer>
         </div>
      </div>
     );
  }

  return null;
};

export default DynamicWidget;