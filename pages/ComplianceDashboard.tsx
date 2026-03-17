import React, { useState } from 'react';
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { complianceMetrics, carbonData, auditLogs, complianceRadarData } from '../mockData';
import { ShieldCheck, AlertTriangle, CheckCircle, Leaf, FileText, Activity } from 'lucide-react';
import OLAPExplorer from '../components/OLAPExplorer';

const ComplianceDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  // Custom Tooltip for Recharts
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
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#15151a] p-4 rounded-xl border border-[#27272a]">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-900/20 rounded-lg">
                <ShieldCheck size={24} className="text-green-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">ISO Compliance Hub</h2>
                <div className="flex space-x-2 text-xs text-gray-400">
                   <span>ISO 9001 (Quality)</span>
                   <span>•</span>
                   <span>ISO 14001 (Env)</span>
                   <span>•</span>
                   <span>ISO 28000 (Security)</span>
                </div>
            </div>
         </div>
         <button className="px-4 py-2 bg-[#ffe600] text-black rounded-lg font-bold text-sm hover:bg-yellow-400 transition-colors">
            Generate Audit Report
         </button>
      </div>

      {/* Top Cards: ISO Standards Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {complianceMetrics.map((metric) => (
           <div key={metric.standard} className={`bg-[#15151a] border rounded-xl p-4 flex flex-col justify-between ${
               metric.status === 'At Risk' ? 'border-red-500/50 bg-red-900/5' : 'border-[#27272a]'
           }`}>
              <div className="flex justify-between items-start">
                 <h3 className="text-sm font-bold text-gray-300">{metric.standard}</h3>
                 {metric.status === 'Compliant' ? (
                     <CheckCircle size={16} className="text-green-500" />
                 ) : (
                     <AlertTriangle size={16} className="text-red-500" />
                 )}
              </div>
              <div className="mt-4">
                 <div className="flex items-end justify-between">
                    <span className="text-3xl font-mono font-bold text-white">{metric.score}/100</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                        metric.status === 'Compliant' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                    }`}>
                        {metric.status}
                    </span>
                 </div>
                 <div className="w-full bg-[#27272a] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                        className={`h-full rounded-full ${metric.status === 'Compliant' ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{ width: `${metric.score}%` }}
                    ></div>
                 </div>
                 <p className="text-[10px] text-gray-500 mt-2">Last Audit: {metric.lastAudit}</p>
              </div>
           </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
         
         {/* Compliance Radar */}
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
            <div className="p-4 border-b border-[#27272a]">
               <h3 className="text-white font-bold text-sm">Compliance Maturity Model</h3>
            </div>
            <div className="flex-1 p-4">
               <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={complianceRadarData}>
                     <PolarGrid stroke="#3f3f46" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 150]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                     <Radar name="Current Status" dataKey="A" stroke="#ffe600" strokeWidth={2} fill="#ffe600" fillOpacity={0.3} />
                     <Radar name="Target" dataKey="B" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.1} />
                     <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* ISO 14001: Carbon Emissions Anomaly */}
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
            <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
               <h3 className="text-white font-bold text-sm flex items-center">
                  <Leaf size={16} className="text-green-500 mr-2" />
                  ISO 14001: Emission Tracking
               </h3>
               <div className="flex items-center text-xs space-x-2">
                   <div className="flex items-center"><div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div> Scope 3 (Anomaly)</div>
               </div>
            </div>
            <div className="flex-1 p-4">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={carbonData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="month" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                     <YAxis stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
                     <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                     <Tooltip content={<CustomTooltip />} />
                     <Area type="monotone" dataKey="scope3" stackId="1" stroke="#ef4444" fill="url(#colorScope3)" />
                     <Area type="monotone" dataKey="scope2" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                     <Area type="monotone" dataKey="scope1" stackId="1" stroke="#10b981" fill="url(#colorScope1)" />
                  </AreaChart>
               </ResponsiveContainer>
               {/* Anomaly Annotation */}
               <div className="absolute top-[60%] right-[35%] bg-red-900/80 text-white text-[10px] px-2 py-1 rounded border border-red-500 animate-pulse pointer-events-none">
                  Scope 3 Spike &gt; 25%
               </div>
            </div>
         </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden">
         <div className="p-4 border-b border-[#27272a] bg-[#1a1a20]">
             <h3 className="text-white font-bold text-sm">Recent Audit Findings & Non-Conformances</h3>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
               <thead className="bg-[#1e1e24] text-xs uppercase font-medium text-gray-500">
                  <tr>
                     <th className="px-6 py-3">ID</th>
                     <th className="px-6 py-3">Standard</th>
                     <th className="px-6 py-3">Severity</th>
                     <th className="px-6 py-3">Finding</th>
                     <th className="px-6 py-3">Date</th>
                     <th className="px-6 py-3">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#27272a]">
                  {auditLogs.map((log) => (
                     <tr key={log.id} className="hover:bg-[#1e1e24] transition-colors">
                        <td className="px-6 py-4 font-mono text-white">#{log.id}</td>
                        <td className="px-6 py-4">{log.standard}</td>
                        <td className="px-6 py-4">
                           <span className={`px-2 py-1 rounded text-xs ${
                              log.severity === 'Major' ? 'bg-red-900/30 text-red-400 border border-red-900' : 
                              log.severity === 'Minor' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-900' : 
                              'bg-blue-900/30 text-blue-400'
                           }`}>
                              {log.severity}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-white">{log.finding}</td>
                        <td className="px-6 py-4">{log.date}</td>
                        <td className="px-6 py-4">
                           <div className="flex items-center">
                              {log.status === 'Open' ? (
                                 <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                              ) : (
                                 <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                              )}
                              {log.status}
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="ENABLE" title="Audit History & Compliance Trends" />

    </div>
  );
};

export default ComplianceDashboard;