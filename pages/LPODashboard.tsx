import React, { useState, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid,
  ComposedChart, Bar, Line, Legend, LineChart, BarChart
} from 'recharts';
import { inventoryData, anomalousInventoryData, productionData, forecastingData, factorsData } from '../mockData';
import { MapPin, Info, ArrowUpRight, Plus, Minus, Filter, Calendar, Zap, AlertTriangle, Activity, X, Sliders } from 'lucide-react';
import * as L from 'leaflet';
import { InventoryData } from '../types';
import { useAgents } from '../contexts/AgentContext';
import { useAuth } from '../contexts/AuthContext';
import DynamicWidget from '../components/DynamicWidget';
import OLAPExplorer from '../components/OLAPExplorer';

const LPODashboard: React.FC = () => {
  const [timeFilter, setTimeFilter] = useState('Month');
  const [diagnosticMode, setDiagnosticMode] = useState(false);
  const [scanning, setScanning] = useState(false);
  
  // Custom Agent Widgets
  const { getWidgetsByPhase } = useAgents();
  const { user } = useAuth();
  const customWidgets = getWidgetsByPhase('PLAN', user.role);

  // Simulation State
  const [showSimulator, setShowSimulator] = useState(false);
  const [demandFactor, setDemandFactor] = useState(1.0); // 1.0 = 100%
  const [simulatedData, setSimulatedData] = useState<InventoryData[]>(inventoryData);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Use anomalous data when in diagnostic mode, otherwise normal or simulated
  const currentInventoryData = diagnosticMode ? anomalousInventoryData : (showSimulator ? simulatedData : inventoryData);

  // Recalculate simulation when factor changes
  useEffect(() => {
     if (showSimulator) {
        const newData = inventoryData.map(item => ({
           ...item,
           // Simulate: Increased demand leads to higher stockout quantity
           stockoutQuantity: Math.round(item.stockoutQuantity * demandFactor),
           stockoutInstances: demandFactor > 1.1 ? Math.round(item.stockoutInstances * 1.3) : item.stockoutInstances
        }));
        setSimulatedData(newData);
     }
  }, [demandFactor, showSimulator]);

  const handleRunDiagnostic = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setDiagnosticMode(true);
      setShowSimulator(false); // Disable simulator if diagnostic runs
    }, 1500);
  };

  const getFilteredProductionData = () => {
    if (timeFilter === 'Week') return productionData.slice(-3);
    if (timeFilter === 'Year') return productionData;
    return productionData.slice(-6);
  }

  // Initialize Map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([25, 10], 2); // Global view

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update Map Markers based on Diagnostic Mode
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    const layerGroup = markersLayerRef.current;
    layerGroup.clearLayers();

    const locations = [
      { id: 'loc-1', name: 'North America DC', coords: [40.7128, -74.0060] as [number, number], status: diagnosticMode ? 'critical' : 'warning', otif: diagnosticMode ? 72 : 84 },
      { id: 'loc-2', name: 'Rotterdam Hub', coords: [51.9225, 4.47917] as [number, number], status: 'good', otif: 94 },
      { id: 'loc-3', name: 'Singapore APAC', coords: [1.3521, 103.8198] as [number, number], status: 'good', otif: 91 },
      { id: 'loc-4', name: 'Sao Paulo Plant', coords: [-23.5505, -46.6333] as [number, number], status: 'warning', otif: 82 },
    ];

    locations.forEach(loc => {
      let color = '#22c55e'; // Green
      let radius = 6;
      
      if (loc.status === 'warning') color = '#eab308'; // Yellow
      if (loc.status === 'critical') {
          color = '#ef4444'; // Red
          radius = 10;
      }

      // Base marker
      const marker = L.circleMarker(loc.coords, {
        radius: radius,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      const popupContent = `
        <div style="font-family: sans-serif; color: #1f2937;">
          <strong>${loc.name}</strong><br/>
          OTIF: <span style="color:${color}; font-weight:bold">${loc.otif}%</span><br/>
          Status: ${loc.status.toUpperCase()}
        </div>
      `;

      marker.bindPopup(popupContent);
      layerGroup.addLayer(marker);

      // Add visual pulse effect for critical items
      if (loc.status === 'critical') {
         // This is a simulated visual effect using a larger transparent circle
         const pulse = L.circleMarker(loc.coords, {
            radius: 20,
            fillColor: color,
            fillOpacity: 0.2,
            stroke: false
         });
         layerGroup.addLayer(pulse);
      }
    });

    // Fly to critical location if in diagnostic mode
    if (diagnosticMode) {
       mapRef.current.flyTo([40.7128, -74.0060], 4, { duration: 1.5 });
    } else {
       mapRef.current.flyTo([25, 10], 2, { duration: 1.5 });
    }

  }, [diagnosticMode]);

  // Custom Components for Charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="bg-[#1e1e24] border border-[#3f3f46] p-3 rounded shadow-xl z-50">
          <p className="text-white font-medium mb-1">{label || dataPoint.name}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-gray-300">
              {entry.name}: <span className="text-white font-mono">{typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}</span>
            </p>
          ))}
          {dataPoint.isAnomaly && (
            <div className="mt-2 pt-2 border-t border-red-900/50 text-xs text-red-400 font-semibold flex items-center">
              <AlertTriangle size={12} className="mr-1" />
              Anomaly Detected (Z-Score: {dataPoint.zScore})
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header Controls */}
      <div className="flex justify-between items-center bg-[#15151a] p-4 rounded-xl border border-[#27272a] shadow-md">
         <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Planning Control Tower</h2>
            {diagnosticMode ? (
              <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 text-xs border border-red-900 animate-pulse flex items-center">
                <Activity size={12} className="mr-1" /> Diagnostic Active
              </span>
            ) : showSimulator ? (
               <span className="px-2 py-0.5 rounded bg-purple-900/30 text-purple-400 text-xs border border-purple-900 flex items-center">
                  <Sliders size={12} className="mr-1" /> S&OP Simulator
               </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-blue-900/30 text-blue-400 text-xs border border-blue-900">Normal Operation</span>
            )}
         </div>
         <div className="flex items-center space-x-3">
            
            <button
               onClick={() => {
                  setShowSimulator(!showSimulator);
                  setDiagnosticMode(false);
               }}
               className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-all ${showSimulator ? 'bg-purple-600 text-white' : 'bg-[#27272a] text-gray-300 hover:bg-[#3f3f46]'}`}
            >
               <Sliders size={16} className="mr-2" />
               Scenario Plan
            </button>

            {!diagnosticMode ? (
              <button 
                onClick={handleRunDiagnostic}
                disabled={scanning}
                className="flex items-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-all shadow-lg hover:shadow-indigo-500/20"
              >
                {scanning ? <Zap size={16} className="mr-2 animate-spin" /> : <Zap size={16} className="mr-2" />}
                {scanning ? 'Scanning...' : 'Run Anomaly Scan'}
              </button>
            ) : (
              <button 
                onClick={() => setDiagnosticMode(false)}
                className="flex items-center px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-gray-300 rounded-md text-sm font-medium transition-all"
              >
                <X size={16} className="mr-2" />
                Clear Diagnostics
              </button>
            )}

            <div className="flex bg-[#101014] rounded-lg p-1 border border-[#27272a]">
               {['Week', 'Month', 'Year'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                       timeFilter === t ? 'bg-[#ffe600] text-black' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {t}
                  </button>
               ))}
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

      {/* Simulator Control Panel (SCOR PLAN Enhancement) */}
      {showSimulator && (
         <div className="bg-[#1e1e24] border border-purple-500/50 rounded-xl p-4 animate-slide-up mb-6">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-white font-bold flex items-center">
                  <Sliders size={18} className="text-purple-500 mr-2" />
                  S&OP Scenario Simulation
               </h3>
               <span className="text-xs text-gray-400">Adjust demand drivers to forecast stockout risk</span>
            </div>
            <div className="flex items-center space-x-8">
               <div className="flex-1">
                  <div className="flex justify-between text-xs mb-2">
                     <span className="text-gray-300">Global Demand Factor</span>
                     <span className="text-purple-400 font-bold">{Math.round((demandFactor - 1) * 100)}% Surge</span>
                  </div>
                  <input 
                     type="range" 
                     min="0.8" 
                     max="1.5" 
                     step="0.1" 
                     value={demandFactor} 
                     onChange={(e) => setDemandFactor(parseFloat(e.target.value))}
                     className="w-full h-2 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                     <span>-20%</span>
                     <span>Normal</span>
                     <span>+50%</span>
                  </div>
               </div>
               <div className="p-3 bg-[#15151a] rounded border border-[#3f3f46]">
                  <span className="block text-xs text-gray-500">Projected Risk Impact</span>
                  <span className="block text-xl font-bold text-white mt-1">
                     ${(300 * demandFactor).toFixed(0)}M
                  </span>
                  <span className="text-[10px] text-gray-400">Revenue at Risk</span>
               </div>
            </div>
         </div>
      )}

      {/* Anomaly Alert Banner (Conditional) */}
      {diagnosticMode && (
        <div className="bg-red-900/10 border border-red-900/50 rounded-xl p-4 flex items-start space-x-4 animate-slide-up">
           <div className="p-2 bg-red-900/20 rounded-full">
             <AlertTriangle size={24} className="text-red-500" />
           </div>
           <div>
             <h3 className="text-red-400 font-bold text-lg">Critical Anomaly Detected: SKU-004</h3>
             <p className="text-gray-300 text-sm mt-1">
               Sudden spike in stockout instances (Z-Score &gt; 3.0). This deviates significantly from the 6-month moving average.
             </p>
             <div className="mt-2 flex space-x-4 text-xs">
               <span className="text-gray-500">Confidence: <span className="text-white">98.2%</span></span>
               <span className="text-gray-500">Root Cause: <span className="text-white">Unplanned Maintenance (Line 3)</span></span>
               <span className="text-gray-500">Impact: <span className="text-white">$120k Revenue Risk</span></span>
             </div>
           </div>
        </div>
      )}

      {/* Top Row: Overall OTIF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall OTIF Card */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-0 overflow-hidden flex flex-col relative">
          <div className="bg-gradient-to-r from-purple-900 to-[#15151a] p-4 border-b border-[#27272a] flex justify-between items-center">
            <h3 className="text-white font-bold flex items-center">
              <span className="w-1 h-5 bg-white mr-2"></span> Overall OTIF
            </h3>
            <span className="text-xs text-purple-200 opacity-70">Updated: Just Now</span>
          </div>
          <div className="p-6 flex justify-around items-center flex-1">
             <CircularProgress value={diagnosticMode ? 76 : (showSimulator ? 72 : 81)} label="OTIF" color={diagnosticMode ? "#ef4444" : "#d946ef"} />
             <CircularProgress value={91} label="On Time" color="#a855f7" />
             <CircularProgress value={88} label="In Full" color="#ffffff" />
          </div>
        </div>

        {/* Impact Cards */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Info size={16} className="text-gray-500"/>
           </div>
           <div className={`p-4 rounded-full mb-3 border transition-colors ${diagnosticMode ? 'bg-red-900/20 border-red-500' : 'bg-[#1e1e24] border-[#3f3f46]'}`}>
             <div className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Impacted by OTIF</div>
             <div className={`${diagnosticMode ? 'text-red-500' : 'text-blue-400'} font-mono text-4xl font-bold`}>
                {diagnosticMode ? '850' : (showSimulator ? Math.round(450 * demandFactor) : '450')}
             </div>
             <div className="text-gray-500 text-xs">Orders</div>
           </div>
        </div>
        
        <div className="grid grid-rows-2 gap-4">
           <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-center">
              <div className="text-gray-400 text-xs uppercase font-bold mb-1">#Customers with Delays</div>
              <div className="text-green-400 font-mono text-3xl font-bold">19</div>
           </div>
           <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 flex flex-col justify-center">
               <div className="text-gray-400 text-xs uppercase font-bold mb-1">OTIF Revenue Impact</div>
               <div className="text-yellow-500 font-mono text-3xl font-bold">${(300 * demandFactor).toFixed(0)}M</div>
           </div>
        </div>
      </div>

      {/* Row 2: Map & Bubble Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[400px]">
        {/* Real Leaflet Map */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col overflow-hidden">
           <div className="p-4 border-b border-[#27272a] flex justify-between">
              <h3 className="text-white font-bold">OTIF Across all Locations</h3>
           </div>
           <div className="relative flex-1 w-full h-full">
              <div ref={mapContainerRef} className="w-full h-full z-0"></div>
           </div>
        </div>

        {/* Bubble Chart */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl flex flex-col">
           <div className="p-4 border-b border-[#27272a] flex justify-between">
              <h3 className="text-white font-bold">Factors Impacting OTIF</h3>
           </div>
           <div className="flex-1 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                  <XAxis type="number" dataKey="x" name="Impact" stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} />
                  <YAxis type="number" dataKey="y" name="Frequency" stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} />
                  <ZAxis type="number" dataKey="z" range={[100, 1000]} name="Volume" />
                  <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="Factors" data={factorsData} fill="#8884d8">
                    {factorsData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.isOutlier && diagnosticMode ? '#ef4444' : (index % 2 === 0 ? '#6366f1' : '#eab308')} 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
           </div>
        </div>
      </div>

      {/* Row 3: Complex Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Inventory - Stockout with Anomaly Highlight */}
        <div className={`bg-[#15151a] border ${diagnosticMode ? 'border-red-500' : 'border-[#27272a]'} rounded-xl p-4 h-[300px] transition-colors`}>
           <div className="flex justify-between items-center mb-4">
             <h3 className={`${diagnosticMode ? 'text-red-400' : 'text-white'} font-bold text-sm`}>
               {diagnosticMode ? 'Anomaly Detected: SKU-004' : (showSimulator ? 'Simulated Inventory Risk' : 'Inventory (Top 10 SKUs in Stockout)')}
             </h3>
           </div>
           <ResponsiveContainer width="100%" height="85%">
             <ComposedChart data={currentInventoryData}>
               <CartesianGrid stroke="#27272a" vertical={false} />
               <XAxis dataKey="sku" angle={-45} textAnchor="end" height={60} tick={{fill: '#52525b', fontSize: 9}} stroke="#3f3f46" />
               <YAxis yAxisId="left" stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} />
               <YAxis yAxisId="right" orientation="right" stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} />
               <Tooltip content={<CustomTooltip />} />
               <Bar yAxisId="left" dataKey="stockoutInstances" barSize={12} radius={[2, 2, 0, 0]}>
                 {currentInventoryData.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={entry.isAnomaly ? '#ef4444' : (showSimulator ? '#a855f7' : '#0ea5e9')} />
                 ))}
               </Bar>
               <Line yAxisId="right" type="monotone" dataKey="stockoutQuantity" stroke={diagnosticMode ? "#ef4444" : "#ffffff"} strokeWidth={2} dot={{fill: '#ffffff', r: 3}} />
             </ComposedChart>
           </ResponsiveContainer>
        </div>

        {/* Forecasting Error */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 h-[300px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-white font-bold text-sm">Forecasting Error - Top 10 SKUs</h3>
           </div>
           <ResponsiveContainer width="100%" height="85%">
             <LineChart data={forecastingData}>
               <CartesianGrid stroke="#27272a" vertical={false} />
               <XAxis dataKey="sku" angle={-45} textAnchor="end" height={60} tick={{fill: '#52525b', fontSize: 9}} stroke="#3f3f46" />
               <YAxis stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} domain={[0, 100]} />
               <Tooltip content={<CustomTooltip />} />
               <Line type="step" dataKey="error" stroke="#d946ef" strokeWidth={2} dot={false} />
               <Line type="monotone" dataKey="error" stroke="#a855f7" strokeWidth={2} strokeDasharray="5 5" dot={false} />
             </LineChart>
           </ResponsiveContainer>
        </div>

        {/* Production Attainment */}
        <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-4 h-[300px]">
           <div className="flex justify-between items-center mb-4">
             <h3 className="text-white font-bold text-sm">Production Attainment</h3>
           </div>
           <ResponsiveContainer width="100%" height="85%">
             <BarChart data={getFilteredProductionData()} barGap={0}>
               <CartesianGrid stroke="#27272a" vertical={false} />
               <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} tick={{fill: '#52525b', fontSize: 9}} stroke="#3f3f46" />
               <YAxis stroke="#52525b" tick={{fill: '#52525b', fontSize: 10}} />
               <Tooltip content={<CustomTooltip />} />
               <Bar dataKey="planned" fill="#f472b6" barSize={8} radius={[2, 2, 0, 0]} />
               <Bar dataKey="actual" fill="#a855f7" barSize={8} radius={[2, 2, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
        </div>

      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="PLAN" title="Historical Planning & Forecast Data" />

    </div>
  );
};

// Helper for Circular Progress in CSS/SVG
const CircularProgress = ({ value, label, color }: { value: number, label: string, color: string }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="50%" cy="50%" r={radius} stroke="#27272a" strokeWidth="8" fill="transparent" />
          <circle 
            cx="50%" cy="50%" r={radius} 
            stroke={color} 
            strokeWidth="8" 
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-400 mt-2">{label}</span>
    </div>
  );
};

export default LPODashboard;