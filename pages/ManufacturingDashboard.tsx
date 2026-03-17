import React from 'react';
import { Activity, Cpu, Thermometer, Settings, AlertTriangle, CheckCircle } from 'lucide-react';
import { machineStatus } from '../mockData';
import { ResponsiveContainer, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import OLAPExplorer from '../components/OLAPExplorer';

const ManufacturingDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#15151a] p-4 rounded-xl border border-[#27272a]">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-900/20 rounded-lg">
                <Settings size={24} className="text-orange-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Smart Factory Monitor</h2>
                <p className="text-xs text-gray-400">Digital Twin & OEE Tracking</p>
            </div>
         </div>
         <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
               <span className="w-2 h-2 rounded-full bg-green-500"></span>
               <span>Plant A: Online</span>
            </div>
            <button className="px-4 py-2 bg-[#2e2e36] text-white rounded-lg text-sm hover:bg-[#3f3f46] border border-[#3f3f46]">
               Maintenance Log
            </button>
         </div>
      </div>

      {/* Digital Twin Visualization Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden min-h-[400px] relative">
            <div className="absolute top-4 left-4 z-10">
               <h3 className="text-white font-bold bg-[#1e1e24]/80 px-3 py-1 rounded backdrop-blur">Digital Twin: Line 1 Assembly</h3>
            </div>
            
            {/* Visual Representation of Production Line */}
            <div className="w-full h-full bg-[#1a1a20] relative flex items-center justify-center">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
               
               {/* Conveyor Belt */}
               <div className="w-[90%] h-12 bg-[#27272a] border-y-2 border-[#3f3f46] relative flex items-center justify-around overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(90deg,transparent,transparent_20px,#1a1a20_20px,#1a1a20_40px)] opacity-50 animate-[slide_5s_linear_infinite]"></div>
                  
                  {/* Products on Belt */}
                  <div className="w-8 h-8 bg-blue-500 rounded shadow-lg z-10 animate-pulse"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded shadow-lg z-10"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded shadow-lg z-10"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded shadow-lg z-10"></div>
                  <div className="w-8 h-8 bg-blue-500 rounded shadow-lg z-10"></div>
               </div>

               {/* Stations */}
               <div className="absolute top-[30%] left-[10%] w-24 h-32 border-2 border-[#3f3f46] bg-[#1e1e24] rounded-lg flex flex-col items-center justify-center p-2">
                  <Cpu className="text-green-500 mb-2" />
                  <span className="text-xs text-gray-400 font-mono">Station 1</span>
                  <span className="text-xs text-green-500">OK</span>
               </div>

               <div className="absolute top-[30%] left-[40%] w-24 h-32 border-2 border-[#3f3f46] bg-[#1e1e24] rounded-lg flex flex-col items-center justify-center p-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <Activity className="text-red-500 mb-2 animate-bounce" />
                  <span className="text-xs text-gray-400 font-mono">Station 2</span>
                  <span className="text-xs text-red-500 animate-pulse">VIBRATION</span>
               </div>

               <div className="absolute top-[30%] left-[70%] w-24 h-32 border-2 border-[#3f3f46] bg-[#1e1e24] rounded-lg flex flex-col items-center justify-center p-2">
                  <CheckCircle className="text-blue-500 mb-2" />
                  <span className="text-xs text-gray-400 font-mono">QC Cam</span>
                  <span className="text-xs text-blue-500">Scanning</span>
               </div>

            </div>
         </div>

         {/* OEE Gauges */}
         <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-5 flex flex-col">
            <h3 className="text-white font-bold mb-4">Overall Equipment Effectiveness (OEE)</h3>
            <div className="flex-1 flex flex-col justify-around space-y-4">
               
               <div className="bg-[#1e1e24] p-4 rounded-lg border border-[#27272a]">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-gray-400 text-sm">Availability</span>
                     <span className="text-green-400 text-xl font-bold">92%</span>
                  </div>
                  <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[92%]"></div>
                  </div>
               </div>

               <div className="bg-[#1e1e24] p-4 rounded-lg border border-[#27272a]">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-gray-400 text-sm">Performance</span>
                     <span className="text-yellow-400 text-xl font-bold">85%</span>
                  </div>
                  <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-yellow-500 w-[85%]"></div>
                  </div>
               </div>

               <div className="bg-[#1e1e24] p-4 rounded-lg border border-[#27272a]">
                  <div className="flex justify-between items-end mb-2">
                     <span className="text-gray-400 text-sm">Quality</span>
                     <span className="text-blue-400 text-xl font-bold">98%</span>
                  </div>
                  <div className="w-full bg-[#27272a] h-2 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[98%]"></div>
                  </div>
               </div>

            </div>
         </div>
      </div>

      {/* Machine Status Cards */}
      <h3 className="text-white font-bold text-lg mt-8">Machine Diagnostics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {machineStatus.map((machine) => (
            <div key={machine.id} className={`bg-[#15151a] border rounded-xl p-4 transition-colors ${
               machine.health < 80 ? 'border-red-500/50 bg-red-900/5' : 'border-[#27272a] hover:border-gray-600'
            }`}>
               <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                     <Cpu size={16} className="text-gray-400" />
                     <span className="text-sm font-bold text-gray-200">{machine.name}</span>
                  </div>
                  <span className={`w-2 h-2 rounded-full ${
                     machine.status === 'Running' ? 'bg-green-500' : 
                     machine.status === 'Maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></span>
               </div>
               
               <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                     <span>Temp</span>
                     <span className={`${machine.temperature > 80 ? 'text-red-400 font-bold' : 'text-white'}`}>{machine.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                     <span>Vibration</span>
                     <span className={`${machine.vibration > 3.0 ? 'text-red-400 font-bold' : 'text-white'}`}>{machine.vibration} mm/s</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#27272a]">
                     <span>Health Score</span>
                     <span className={`font-bold ${
                        machine.health > 90 ? 'text-green-400' : machine.health > 70 ? 'text-yellow-400' : 'text-red-400'
                     }`}>{machine.health}%</span>
                  </div>
               </div>

               {machine.health < 80 && (
                   <button className="mt-3 w-full py-1.5 bg-red-900/30 text-red-400 border border-red-900 rounded text-xs hover:bg-red-900/50">
                      Schedule Maint.
                   </button>
               )}
            </div>
         ))}
      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="MAKE" title="Production & OEE History" />

    </div>
  );
};

export default ManufacturingDashboard;