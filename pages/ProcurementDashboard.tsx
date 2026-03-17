import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, Cell
} from 'recharts';
import { DollarSign, Users, FileText, Briefcase, Zap } from 'lucide-react';
import { spendCategories, customerOtifData } from '../mockData';
import { useAgents } from '../contexts/AgentContext';
import { useAuth } from '../contexts/AuthContext';
import DynamicWidget from '../components/DynamicWidget';
import OLAPExplorer from '../components/OLAPExplorer';

const ProcurementDashboard: React.FC = () => {
  const { getWidgetsByPhase } = useAgents();
  const { user } = useAuth();
  const customWidgets = getWidgetsByPhase('SOURCE', user.role);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1e24] border border-[#3f3f46] p-3 rounded shadow-xl">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-300">
              {entry.name}: <span className="text-white font-mono">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Top Section: Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         
         <div className="bg-[#15151a] border border-[#27272a] rounded-lg p-5 flex flex-col justify-between h-32 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center text-gray-400">
                <DollarSign size={16} className="mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Spend (USD)</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">$317M</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-lg p-5 flex flex-col justify-between h-32 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center text-gray-400">
                <Users size={16} className="mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider"># Vendors</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">7,877</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-lg p-5 flex flex-col justify-between h-32 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center text-gray-400">
                <FileText size={16} className="mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider"># POs / Invoices</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">13.1K</div>
              <div className="text-xs text-gray-500">24.6K Invoices</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-lg p-5 flex flex-col justify-between h-32 hover:border-blue-500 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-center text-gray-400">
                <Briefcase size={16} className="mr-2" />
                <span className="text-xs font-bold uppercase tracking-wider">Managed Spend</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-400">$152M</div>
            </div>
         </div>

      </div>

      {/* CUSTOM AGENT WIDGETS SECTION */}
      {customWidgets.length > 0 && (
        <div className="mb-6">
           <div className="flex items-center space-x-2 mb-3">
              <Zap size={16} className="text-[#ffe600]" />
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Custom Agent Widgets</h3>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {customWidgets.map(widget => (
                 <DynamicWidget key={widget.id} config={widget} />
              ))}
           </div>
        </div>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        
        {/* Product Categories */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
          <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
            <h3 className="text-white font-bold">Top Product Categories with Low OTIF</h3>
            <span className="bg-gray-800 text-gray-300 text-[10px] px-2 py-1 rounded-full border border-gray-700">Segmentation</span>
          </div>
          <div className="flex-1 p-4">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={spendCategories} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid stroke="#27272a" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-35} textAnchor="end" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                  <YAxis stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} label={{ value: 'OTIF %', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="OTIF %" barSize={50}>
                    {spendCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  {/* Gross Margin Line */}
                  <Line type="monotone" dataKey="margin" stroke="#ffffff" strokeWidth={2} dot={{r: 4, fill: 'white'}} />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Analysis */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
          <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
            <h3 className="text-white font-bold">Top Customers with Low OTIF</h3>
            <div className="flex items-center space-x-3 text-[10px]">
               <span className="text-gray-400">Target 85%</span>
               <span className="flex items-center text-pink-500"><div className="w-2 h-2 bg-pink-500 mr-1"></div> $ Revenue Delayed</span>
               <span className="flex items-center text-orange-400"><div className="w-2 h-2 bg-orange-400 mr-1 rounded-full"></div> OTIF %</span>
            </div>
          </div>
          <div className="flex-1 p-4">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={customerOtifData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                  <CartesianGrid stroke="#27272a" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="customer" angle={-45} textAnchor="end" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                  <YAxis yAxisId="left" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} label={{ value: '$ Revenue Delayed', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#52525b" domain={[70, 100]} tick={{fill: '#9ca3af', fontSize: 10}} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="revenueDelayed" fill="#ec4899" barSize={10} radius={[2, 2, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="otif" stroke="#fb923c" strokeWidth={2} dot={{r: 3, fill: '#fb923c'}} />
               </ComposedChart>
             </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="SOURCE" title="Vendor Performance & Spend History" />

    </div>
  );
};

export default ProcurementDashboard;