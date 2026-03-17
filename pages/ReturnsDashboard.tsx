import React, { useEffect, useRef, useState } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area
} from 'recharts';
import { RotateCcw, RefreshCw, Trash2, Truck, ArrowDownLeft, DollarSign, Package, AlertTriangle, Check, X, Search, FileText, User, Globe, Clock } from 'lucide-react';
import { dispositionData, returnReasons, recentReturns } from '../mockData';
import * as L from 'leaflet';
import OLAPExplorer from '../components/OLAPExplorer';

type TimezoneMode = 'Local' | 'UTC' | 'Entity';

const ReturnsDashboard: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [returnRequests, setReturnRequests] = useState(recentReturns);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Timezone Context Switcher
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('Entity');

  // Handle Approval Action
  const handleAction = (id: string, action: 'Approved' | 'Rejected') => {
      setReturnRequests(prev => prev.map(item => 
          item.id === id ? { ...item, status: action } : item
      ));
  };

  // Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e1e24] border border-[#3f3f46] p-3 rounded shadow-xl">
          <p className="text-white font-medium mb-1">{label || payload[0].name}</p>
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

  // Time formatting helper
  const formatReturnDate = (isoString: string, originTimezone: string) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    let options: Intl.DateTimeFormatOptions = { 
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    };

    if (timezoneMode === 'UTC') {
      return date.toISOString().replace('T', ' ').substring(5, 16) + ' UTC';
    } 
    
    if (timezoneMode === 'Local') {
      return date.toLocaleString(undefined, options);
    }

    if (timezoneMode === 'Entity') {
      try {
        return date.toLocaleString('en-US', { 
          ...options,
          timeZone: originTimezone, 
          timeZoneName: 'short'
        });
      } catch (e) {
        return date.toISOString().substring(0, 16); 
      }
    }
    return isoString;
  };

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([38, -95], 4); // US Center view

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Add Return Centers
      const centers = [
        { name: "West Coast Recovery", coords: [36.1699, -115.1398], type: 'Refurb Hub' },
        { name: "East Coast Returns", coords: [40.7128, -74.0060], type: 'Sorting' },
        { name: "Midwest Recycling", coords: [41.8781, -87.6298], type: 'Recycling' }
      ];

      centers.forEach(center => {
          L.circleMarker(center.coords as [number, number], {
              radius: 8,
              fillColor: '#a855f7',
              color: '#fff',
              weight: 1,
              fillOpacity: 0.8
          }).addTo(map).bindPopup(center.name);
      });

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const filteredReturns = returnRequests.filter(req => 
      req.sku.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#15151a] p-4 rounded-xl border border-[#27272a]">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-900/20 rounded-lg">
                <RotateCcw size={24} className="text-purple-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Reverse Logistics & Recovery</h2>
                <div className="flex space-x-2 text-xs text-gray-400">
                   <span>SCOR: Return</span>
                   <span>•</span>
                   <span>Circular Economy</span>
                </div>
            </div>
         </div>
         <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Recovery Rate Target: 65%</span>
            <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[72%]"></div>
            </div>
            <span className="text-sm font-bold text-purple-400">72%</span>
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-gray-500 uppercase">Total Returns Value</span>
               <DollarSign size={16} className="text-gray-400" />
            </div>
            <div>
               <div className="text-2xl font-bold text-white">$12.4M</div>
               <div className="text-xs text-red-400 flex items-center mt-1"><ArrowDownLeft size={12} className="mr-1"/> +8% vs last month</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-gray-500 uppercase">Items Processed</span>
               <Package size={16} className="text-gray-400" />
            </div>
            <div>
               <div className="text-2xl font-bold text-white">45,200</div>
               <div className="text-xs text-gray-400 mt-1">Units YTD</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-gray-500 uppercase">Resell Revenue</span>
               <RefreshCw size={16} className="text-green-500" />
            </div>
            <div>
               <div className="text-2xl font-bold text-green-400">$4.1M</div>
               <div className="text-xs text-gray-400 mt-1">From Refurbished</div>
            </div>
         </div>

         <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <span className="text-xs font-bold text-gray-500 uppercase">Avg Processing Time</span>
               <Truck size={16} className="text-gray-400" />
            </div>
            <div>
               <div className="text-2xl font-bold text-white">3.2 Days</div>
               <div className="text-xs text-green-400 flex items-center mt-1"><ArrowDownLeft size={12} className="mr-1"/> -0.5 days</div>
            </div>
         </div>

      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
         
         {/* Returns Map */}
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[#27272a]">
               <h3 className="text-white font-bold text-sm">Return Flow Visualization</h3>
            </div>
            <div className="relative flex-1 w-full h-full">
               <div ref={mapContainerRef} className="w-full h-full z-0"></div>
            </div>
         </div>

         {/* Disposition Chart */}
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
            <div className="p-4 border-b border-[#27272a]">
               <h3 className="text-white font-bold text-sm">Disposition Analysis</h3>
            </div>
            <div className="flex-1 p-4 flex">
               <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie
                          data={dispositionData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                       >
                          {dispositionData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                       </Pie>
                       <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                 </ResponsiveContainer>
               </div>
               <div className="w-1/3 flex flex-col justify-center space-y-3">
                  {dispositionData.map(d => (
                     <div key={d.name} className="flex items-center text-xs">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: d.color }}></div>
                        <span className="text-gray-300">{d.name}</span>
                        <span className="ml-auto font-bold text-white">{d.value}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>

      </div>

      {/* Detailed Returns Authorization Table */}
      <div className="bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden">
         <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#1a1a20]">
            <div>
               <h3 className="text-white font-bold text-sm flex items-center">
                   <FileText size={16} className="mr-2 text-purple-500" />
                   Returns Authorization & Disposition Console
               </h3>
               <p className="text-xs text-gray-400 mt-1">Manage dispositions, review inspection (RCA), and approve financial impacts.</p>
            </div>
            
            <div className="flex items-center space-x-3">
                {/* Timezone Toggle */}
               <div className="flex bg-[#101014] rounded-lg p-1 border border-[#3f3f46]">
                  {['Entity', 'UTC', 'Local'].map((mode) => (
                     <button
                        key={mode}
                        onClick={() => setTimezoneMode(mode as TimezoneMode)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center ${
                           timezoneMode === mode ? 'bg-[#ffe600] text-black' : 'text-gray-400 hover:text-white'
                        }`}
                     >
                        {mode === 'Entity' && <Globe size={10} className="mr-1"/>}
                        {mode === 'UTC' && <Clock size={10} className="mr-1"/>}
                        {mode}
                     </button>
                  ))}
               </div>

                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search SKU or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#101014] border border-[#3f3f46] rounded-lg pl-8 pr-4 py-1.5 text-xs text-white focus:ring-1 focus:ring-purple-500 w-64"
                    />
                    <Search size={12} className="absolute left-2.5 top-2.5 text-gray-500"/>
                </div>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
               <thead className="bg-[#1e1e24] text-xs uppercase font-medium text-gray-500">
                  <tr>
                     <th className="px-4 py-3">Return ID / SKU</th>
                     <th className="px-4 py-3">Origin / Date</th>
                     <th className="px-4 py-3">Reason / Condition</th>
                     <th className="px-4 py-3">Inspection (RCA) & Eligibility</th>
                     <th className="px-4 py-3">Disposition</th>
                     <th className="px-4 py-3 text-right">Fin. Impact</th>
                     <th className="px-4 py-3">Owner</th>
                     <th className="px-4 py-3 text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-[#27272a]">
                  {filteredReturns.map((item) => (
                     <tr key={item.id} className="hover:bg-[#1e1e24] transition-colors group">
                        <td className="px-4 py-4">
                           <div className="font-mono text-white text-xs">{item.id}</div>
                           <div className="text-purple-400 font-bold text-xs">{item.sku}</div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="text-white">{item.returnLocation}</div>
                           <div className="text-[10px] text-gray-500 font-mono mt-1">
                              {formatReturnDate(item.date, item.timezone)}
                           </div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="text-white text-xs">{item.reason}</div>
                           <span className="text-[10px] bg-[#27272a] border border-[#3f3f46] px-1.5 py-0.5 rounded text-gray-300 inline-block mt-1">
                              {item.condition}
                           </span>
                        </td>
                        <td className="px-4 py-4 max-w-xs">
                           <div className="text-xs text-gray-300 mb-1 flex items-start">
                              <Search size={10} className="mr-1 mt-0.5 flex-shrink-0" />
                              {item.rcaNotes}
                           </div>
                           <div className="flex items-center text-[10px] text-gray-500 font-medium border-t border-gray-800 pt-1 mt-1">
                              Eligibility: <span className="text-gray-300 ml-1">{item.eligibility}</span>
                           </div>
                        </td>
                        <td className="px-4 py-4">
                           <span className={`px-2 py-1 rounded text-xs font-bold border ${
                              item.disposition === 'Scrap' ? 'bg-red-900/20 text-red-400 border-red-900' :
                              item.disposition === 'Restock' ? 'bg-green-900/20 text-green-400 border-green-900' :
                              'bg-yellow-900/20 text-yellow-400 border-yellow-900'
                           }`}>
                              {item.disposition}
                           </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                           <div className={`font-mono font-bold ${item.financialImpact >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {item.financialImpact < 0 ? '-' : '+'}{Math.abs(item.financialImpact).toFixed(2)}
                           </div>
                           <div className="text-[10px] text-gray-500">{item.currency}</div>
                        </td>
                        <td className="px-4 py-4">
                           <div className="flex items-center">
                              <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center mr-2 text-[10px] text-white">
                                 {item.responsiblePersona.charAt(0)}
                              </div>
                              <div>
                                 <div className="text-xs text-white">{item.responsiblePersona}</div>
                                 <div className="text-[10px] text-gray-500">{item.responsibleDept}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                           {item.status === 'Pending' ? (
                              <div className="flex space-x-2 justify-center">
                                 <button 
                                    onClick={() => handleAction(item.id, 'Approved')}
                                    className="p-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 border border-green-900" 
                                    title="Approve"
                                 >
                                    <Check size={14} />
                                 </button>
                                 <button 
                                    onClick={() => handleAction(item.id, 'Rejected')}
                                    className="p-1.5 bg-red-900/30 text-red-400 rounded hover:bg-red-900/50 border border-red-900" 
                                    title="Reject"
                                 >
                                    <X size={14} />
                                 </button>
                              </div>
                           ) : (
                              <span className={`text-xs font-bold ${item.status === 'Approved' ? 'text-green-500' : item.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                                 {item.status}
                              </span>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="RETURN" title="Return Merchandise Authorization (RMA) History" />

    </div>
  );
};

export default ReturnsDashboard;