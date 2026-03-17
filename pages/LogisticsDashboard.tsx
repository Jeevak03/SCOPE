import React, { useEffect, useRef, useState } from 'react';
import { Map as MapIcon, Truck, Navigation, Clock, Anchor, Package, RefreshCw, AlertTriangle, CloudRain, TrafficCone, Eye, EyeOff, Layers, Wind, Flame, ShieldAlert, ArrowRight, Gavel, CheckCircle, Globe } from 'lucide-react';
import { shipments as initialShipments, riskZones } from '../mockData';
import { Shipment, RiskZone, RouteOption } from '../types';
import * as L from 'leaflet';
import { useNotifications } from '../contexts/NotificationContext';
import OLAPExplorer from '../components/OLAPExplorer';

type TimezoneMode = 'Local' | 'UTC' | 'Dest';

const LogisticsDashboard: React.FC = () => {
  const { addNotification } = useNotifications();
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{[key: string]: L.CircleMarker}>({});
  const polylineRef = useRef<{[key: string]: L.Polyline}>({});
  const weatherLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const riskLayerRef = useRef<L.LayerGroup | null>(null);
  const alternateRouteLayerRef = useRef<L.LayerGroup | null>(null);

  const [shipments, setShipments] = useState<Shipment[]>(initialShipments);
  const [activeShipmentId, setActiveShipmentId] = useState<string | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [showWeather, setShowWeather] = useState(false);
  const [showRisks, setShowRisks] = useState(true);
  const [proposedRoute, setProposedRoute] = useState<RouteOption | null>(null);
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());
  
  // Timezone Context Switcher
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('Dest');

  // Weather Data Definition
  const weatherEvents = [
    { id: 'w1', coords: [42.0, -40.0], radius: 900000, color: '#6366f1', type: 'Atlantic Storm System', icon: 'cloud-rain' }, 
    { id: 'w2', coords: [15.0, 115.0], radius: 600000, color: '#ef4444', type: 'Typhoon Warning', icon: 'wind' }, 
    { id: 'w3', coords: [53.5, 9.9], radius: 150000, color: '#f59e0b', type: 'Heavy Fog (Hamburg)', icon: 'cloud' },
  ];

  // Helper to interpolate position between two coordinates based on progress (0-100)
  const interpolatePosition = (start: [number, number], end: [number, number], progress: number): [number, number] => {
    const fraction = progress / 100;
    const lat = start[0] + (end[0] - start[0]) * fraction;
    const lng = start[1] + (end[1] - start[1]) * fraction;
    return [lat, lng];
  };

  const formatETATime = (isoString: string, destTimezone: string) => {
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
      // Browser Local Time
      return date.toLocaleString(undefined, options);
    }

    if (timezoneMode === 'Dest') {
      try {
        return date.toLocaleString('en-US', { 
          ...options,
          timeZone: destTimezone, 
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
      // Initialize map
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false
      }).setView([20, 10], 2);

      // Add CartoDB Dark Matter tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Initialize Overlay Layers
      weatherLayerRef.current = L.layerGroup().addTo(map);
      trafficLayerRef.current = L.layerGroup().addTo(map);
      riskLayerRef.current = L.layerGroup().addTo(map);
      alternateRouteLayerRef.current = L.layerGroup().addTo(map);

      mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Risk Layer (War, Strikes)
  useEffect(() => {
     if (!mapRef.current || !riskLayerRef.current) return;
     const riskLayer = riskLayerRef.current;
     riskLayer.clearLayers();

     if (showRisks) {
        riskZones.forEach(zone => {
           if (zone.type === 'WAR') {
              // Draw Polygon
              L.polygon(zone.coordinates, {
                 color: '#ef4444',
                 fillColor: '#ef4444',
                 fillOpacity: 0.2,
                 weight: 1,
                 dashArray: '5, 5'
              }).addTo(riskLayer);

              // Add Icon
              const iconHtml = `
                 <div class="flex items-center justify-center w-8 h-8 bg-red-900/80 rounded-full text-red-400 border border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-3-.928.857-1.928.857-3 3-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5z"></path><path d="M15.5 14.5A2.5 2.5 0 0 0 18 12c0-1.38-.5-2-1-3-1.072-2.143-2.072-2.143-3-3-.928.857-1.928.857-3 3-.5 1-1 1.62-1 3a2.5 2.5 0 0 0 2.5 2.5z"></path><line x1="12" y1="8" x2="12" y2="22"></line></svg>
                 </div>
              `;
              const icon = L.divIcon({ html: iconHtml, className: 'risk-icon', iconSize: [32, 32] });
              L.marker(zone.center, { icon }).bindPopup(`<b>${zone.name}</b><br/>${zone.impactDescription}`).addTo(riskLayer);
           } 
           else if (zone.type === 'STRIKE') {
              const iconHtml = `
                 <div class="flex items-center justify-center w-8 h-8 bg-orange-900/80 rounded-full text-orange-400 border border-orange-500 shadow-lg">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                 </div>
              `;
              const icon = L.divIcon({ html: iconHtml, className: 'risk-icon', iconSize: [32, 32] });
              L.marker(zone.center, { icon }).bindPopup(`<b>${zone.name}</b><br/>${zone.impactDescription}`).addTo(riskLayer);
           }
        });
     }
  }, [showRisks]);

  // Handle Overlay Toggles (Weather/Traffic)
  useEffect(() => {
    if (!mapRef.current || !weatherLayerRef.current || !trafficLayerRef.current) return;
    const weatherLayer = weatherLayerRef.current;
    const trafficLayer = trafficLayerRef.current;
    weatherLayer.clearLayers();
    trafficLayer.clearLayers();

    if (showWeather) {
      weatherEvents.forEach(evt => {
        // Visual Circle
        L.circle(evt.coords as [number, number], {
          radius: evt.radius,
          color: 'transparent',
          fillColor: evt.color,
          fillOpacity: 0.25,
          interactive: false
        }).addTo(weatherLayer);

        // Weather Icon
        const iconColorClass = evt.color === '#ef4444' ? 'bg-red-500' : evt.color === '#f59e0b' ? 'bg-amber-500' : 'bg-blue-500';
        
        const iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 ${iconColorClass}/80 rounded-full text-white backdrop-blur-sm border border-white/20 shadow-lg animate-pulse">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${evt.icon === 'wind' ? '<path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/>' : 
                  evt.icon === 'cloud' ? '<path d="M17.5 19c0-1.7-1.3-3-3-3h-11C1.6 16 0 14.4 0 12.5S1.6 9 3.5 9c.1 0 .3 0 .4.1a5 5 0 1 1 9.6-3 4.5 4.5 0 0 1 3.2 8.3"/>' :
                  '<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v6"/><path d="M8 14v6"/><path d="M12 16v6"/>'}
             </svg>
          </div>
        `;
        
        const icon = L.divIcon({
            html: iconHtml,
            className: 'weather-marker-icon',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        L.marker(evt.coords as [number, number], { icon })
          .bindPopup(`<div class="font-bold text-gray-800">${evt.type}</div><div class="text-xs text-gray-600">Impact: High</div>`)
          .addTo(weatherLayer);
      });
    }

    if (showTraffic) {
       // Mock Traffic Data (Congestion points)
       const trafficPoints = [
         { coords: [33.8, -118.2], label: 'LA Port Congestion' }, 
         { coords: [51.95, 4.1], label: 'Lock Maintenance' }, 
         { coords: [41.9, -87.7], label: 'I-90 Delays' }, 
         { coords: [31.2, 121.5], label: 'Customs Backlog' }, 
       ];

       trafficPoints.forEach(p => {
         const icon = L.divIcon({
            html: `<div class="relative flex h-3 w-3"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span></div>`,
            className: 'traffic-dot',
            iconSize: [12, 12]
         });
         L.marker(p.coords as [number, number], { icon })
           .bindTooltip(p.label, { 
              permanent: true, 
              direction: 'top', 
              className: 'bg-[#15151a] text-red-400 border border-red-900/50 text-[10px] px-2 py-0.5 rounded shadow-xl' 
           })
           .addTo(trafficLayer);
       });
    }
  }, [showWeather, showTraffic]);

  // Handle Alternate Route Visualization
  useEffect(() => {
      if (!mapRef.current || !alternateRouteLayerRef.current) return;
      const layer = alternateRouteLayerRef.current;
      layer.clearLayers();

      if (proposedRoute) {
          const line = L.polyline(proposedRoute.coordinates, {
              color: '#10b981', // Green
              weight: 3,
              dashArray: '10, 10',
              opacity: 0.8
          }).addTo(layer);
          
          mapRef.current.fitBounds(line.getBounds(), { padding: [50, 50] });
      }

  }, [proposedRoute]);

  // Monitor Weather Impact on Shipments
  useEffect(() => {
    shipments.forEach(shp => {
        if(shp.status !== 'Delivered') {
            const currentPos = interpolatePosition(shp.originCoordinates, shp.destinationCoordinates, shp.progress);
            
            weatherEvents.forEach(evt => {
                const dist = L.latLng(currentPos).distanceTo(evt.coords as [number, number]);
                // If within radius (and not already notified for this shipment-event combo)
                if (dist < evt.radius) {
                    const notificationKey = `${shp.id}-${evt.id}`;
                    if (!notifiedEvents.has(notificationKey)) {
                        addNotification({
                            title: `Weather Alert: ${shp.id}`,
                            message: `${evt.type} detected on route. Potential delay for shipment to ${shp.destination.split(',')[0]}.`,
                            type: 'warning',
                            link: '/logistics'
                        });
                        setNotifiedEvents(prev => new Set(prev).add(notificationKey));
                    }
                }
            });
        }
    });
  }, [shipments, showWeather]); // Check when shipments update or weather layer is toggled

  // Update Markers and Simulate Movement
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    shipments.forEach(shp => {
      const currentPos = interpolatePosition(shp.originCoordinates, shp.destinationCoordinates, shp.progress);
      
      const hasRisk = shp.activeRisks && shp.activeRisks.length > 0;
      const color = hasRisk ? '#ef4444' : shp.status === 'Delayed' ? '#ef4444' : shp.status === 'Delivered' ? '#22c55e' : '#3b82f6';

      // 1. Draw Route Line
      if (!polylineRef.current[shp.id]) {
        const polyline = L.polyline([shp.originCoordinates, shp.destinationCoordinates], {
          color: color,
          weight: 2,
          opacity: 0.4,
          dashArray: '5, 10'
        }).addTo(map);
        polylineRef.current[shp.id] = polyline;
      }

      // 2. Draw Ship Marker
      if (!markersRef.current[shp.id]) {
        const marker = L.circleMarker(currentPos, {
          radius: hasRisk ? 8 : 6,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        
        marker.on('click', () => {
             setActiveShipmentId(shp.id);
             setProposedRoute(null); // Reset proposed route on new selection
        });
        markersRef.current[shp.id] = marker;
      } else {
        markersRef.current[shp.id].setLatLng(currentPos);
        markersRef.current[shp.id].setStyle({ 
            radius: shp.id === activeShipmentId ? 10 : (hasRisk ? 8 : 6), 
            color: shp.id === activeShipmentId ? '#ffe600' : '#fff' 
        });
      }
    });
  }, [shipments, activeShipmentId]);

  const handleFocusShipment = (id: string) => {
      setActiveShipmentId(id);
      setProposedRoute(null);
      const shp = shipments.find(s => s.id === id);
      if (shp && mapRef.current) {
          const currentPos = interpolatePosition(shp.originCoordinates, shp.destinationCoordinates, shp.progress);
          mapRef.current.setView(currentPos, 4, { animate: true });
          markersRef.current[id].openPopup();
      }
  };

  const getActiveShipment = () => shipments.find(s => s.id === activeShipmentId);
  const activeShipment = getActiveShipment();
  const activeRiskZone = activeShipment?.activeRisks ? riskZones.find(r => r.id === activeShipment.activeRisks![0]) : null;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-center bg-[#15151a] p-4 rounded-xl border border-[#27272a]">
         <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-900/20 rounded-lg">
                <Truck size={24} className="text-blue-500" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-white">Logistics Command Center</h2>
                <p className="text-xs text-gray-400">Real-time Visibility & Route Optimization</p>
            </div>
         </div>
         <div className="flex space-x-3">
            <div className="flex items-center px-3 py-1 bg-[#1e1e24] rounded-lg border border-[#3f3f46] text-xs text-green-400">
               <RefreshCw size={12} className="mr-2 animate-spin" />
               Live Tracking Active
            </div>
            <button className="px-4 py-2 bg-[#ffe600] text-black rounded-lg font-bold text-sm hover:bg-yellow-400">
               Optimize Routes
            </button>
         </div>
      </div>

      {/* Interactive Map Area */}
      <div className="bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden h-[500px] relative">
         {/* Live Fleet Overview Card */}
         <div className="absolute top-4 left-4 z-[400] bg-[#1e1e24]/90 backdrop-blur p-4 rounded-lg border border-[#3f3f46] w-64 shadow-xl">
            <h3 className="text-white font-bold mb-2">Live Fleet Overview</h3>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400">In Transit</span>
                  <span className="text-blue-400 font-bold">142</span>
               </div>
               <div className="flex justify-between text-sm">
                  <span className="text-gray-400">At Risk</span>
                  <span className="text-red-400 font-bold flex items-center"><ShieldAlert size={12} className="mr-1"/> 2</span>
               </div>
            </div>
         </div>

         {/* Layer Controls */}
         <div className="absolute top-4 right-4 z-[400] flex flex-col space-y-2">
            <button 
                onClick={() => setShowRisks(!showRisks)}
                className={`p-2 rounded-lg border backdrop-blur transition-all flex items-center space-x-3 ${showRisks ? 'bg-red-600/90 border-red-400 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-[#1e1e24]/90 border-[#3f3f46] text-gray-400 hover:text-white'}`}
            >
                <div className={`p-1 rounded ${showRisks ? 'bg-white/20' : 'bg-transparent'}`}>
                  <Flame size={16} />
                </div>
                <div className="text-left pr-2">
                   <span className="block text-xs font-bold">Threat Layer</span>
                   <span className="block text-[10px] opacity-70">War & Strikes</span>
                </div>
            </button>
            
            <button 
                onClick={() => setShowWeather(!showWeather)}
                className={`p-2 rounded-lg border backdrop-blur transition-all flex items-center space-x-3 ${showWeather ? 'bg-blue-600/90 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-[#1e1e24]/90 border-[#3f3f46] text-gray-400 hover:text-white'}`}
            >
                <div className={`p-1 rounded ${showWeather ? 'bg-white/20' : 'bg-transparent'}`}>
                  {showWeather ? <CloudRain size={16} /> : <Wind size={16} />}
                </div>
                <div className="text-left pr-2">
                   <span className="block text-xs font-bold">Weather Layer</span>
                   <span className="block text-[10px] opacity-70">{showWeather ? 'On' : 'Off'}</span>
                </div>
            </button>

            <button 
                onClick={() => setShowTraffic(!showTraffic)}
                className={`p-2 rounded-lg border backdrop-blur transition-all flex items-center space-x-3 ${showTraffic ? 'bg-amber-600/90 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-[#1e1e24]/90 border-[#3f3f46] text-gray-400 hover:text-white'}`}
            >
                <div className={`p-1 rounded ${showTraffic ? 'bg-white/20' : 'bg-transparent'}`}>
                  <TrafficCone size={16} />
                </div>
                <div className="text-left pr-2">
                   <span className="block text-xs font-bold">Traffic Layer</span>
                   <span className="block text-[10px] opacity-70">{showTraffic ? 'On' : 'Off'}</span>
                </div>
            </button>
         </div>

         {/* Route Proposal Overlay (If Risk) */}
         {activeShipment && activeRiskZone && (
             <div className="absolute bottom-6 left-6 z-[400] w-80 bg-[#1e1e24]/95 backdrop-blur border border-red-500 rounded-xl overflow-hidden shadow-2xl animate-slide-up">
                <div className="bg-red-900/20 p-3 border-b border-red-900/50 flex items-center space-x-2">
                    <ShieldAlert size={18} className="text-red-500" />
                    <span className="text-red-400 font-bold text-sm">CRITICAL RISK ALERT</span>
                </div>
                <div className="p-4">
                    <h4 className="text-white font-bold">{activeRiskZone.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 mb-4">{activeRiskZone.impactDescription}</p>
                    
                    <div className="bg-black/40 rounded p-2 mb-4">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide">Current ETA Impact</div>
                        <div className="text-red-400 font-bold text-lg">+14 Days Delay</div>
                    </div>

                    {!proposedRoute ? (
                        <button 
                            onClick={() => setProposedRoute(activeShipment.alternateRoutes?.[0] || null)}
                            className="w-full py-2 bg-[#ffe600] text-black font-bold text-xs rounded hover:bg-yellow-400 transition-colors flex items-center justify-center"
                        >
                            <Navigation size={14} className="mr-2" />
                            Propose Alternate Routes
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className="p-2 border border-green-500/30 bg-green-900/10 rounded">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-green-400 font-bold text-xs">{proposedRoute.name}</span>
                                    <span className="text-[10px] bg-green-900 text-green-300 px-1 rounded">Recommended</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-400">
                                    <div>ETA: <span className="text-white">{proposedRoute.eta}</span></div>
                                    <div>Cost: <span className="text-white">{proposedRoute.cost}</span></div>
                                    <div>Risk: <span className="text-green-400">{proposedRoute.riskLevel}</span></div>
                                    <div>Dist: <span className="text-white">{proposedRoute.distance}</span></div>
                                </div>
                            </div>
                            <div className="flex space-x-2">
                                <button className="flex-1 py-1.5 bg-green-600 text-white font-bold text-xs rounded hover:bg-green-700">
                                    Accept Route
                                </button>
                                <button onClick={() => setProposedRoute(null)} className="py-1.5 px-3 border border-[#3f3f46] text-gray-400 text-xs rounded hover:text-white">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
             </div>
         )}

         {/* Leaflet Map Container */}
         <div ref={mapContainerRef} className="w-full h-full z-0"></div>
      </div>

      {/* Shipment List & Optimization Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         
         <div className="lg:col-span-2 bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#27272a] flex justify-between items-center bg-[#1a1a20]">
               <h3 className="text-white font-bold text-sm">Active Shipments</h3>
               
               {/* Timezone Toggle */}
               <div className="flex bg-[#101014] rounded-lg p-1 border border-[#3f3f46]">
                  {['Dest', 'UTC', 'Local'].map((mode) => (
                     <button
                        key={mode}
                        onClick={() => setTimezoneMode(mode as TimezoneMode)}
                        className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center ${
                           timezoneMode === mode ? 'bg-[#ffe600] text-black' : 'text-gray-400 hover:text-white'
                        }`}
                     >
                        {mode === 'Dest' && <Globe size={10} className="mr-1"/>}
                        {mode === 'UTC' && <Clock size={10} className="mr-1"/>}
                        {mode}
                     </button>
                  ))}
               </div>
            </div>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-gray-400">
                   <thead className="bg-[#1e1e24] text-xs uppercase font-medium text-gray-500 sticky top-0 z-10">
                      <tr>
                         <th className="px-6 py-3">ID</th>
                         <th className="px-6 py-3">Route</th>
                         <th className="px-6 py-3">ETA ({timezoneMode})</th>
                         <th className="px-6 py-3">Status</th>
                         <th className="px-6 py-3">Progress</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#27272a]">
                      {shipments.map((shp) => (
                         <tr 
                            key={shp.id} 
                            onClick={() => handleFocusShipment(shp.id)}
                            className={`hover:bg-[#1e1e24] transition-colors cursor-pointer ${activeShipmentId === shp.id ? 'bg-[#1e1e24] border-l-2 border-[#ffe600]' : ''}`}
                         >
                            <td className="px-6 py-4 font-mono text-white">{shp.id}</td>
                            <td className="px-6 py-4 text-xs">
                               <div className="flex items-center">
                                  {shp.origin.split(',')[0]} <Navigation size={12} className="mx-2 text-gray-600"/> {shp.destination.split(',')[0]}
                               </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-mono text-white">
                               {formatETATime(shp.eta, shp.timezone)}
                            </td>
                            <td className="px-6 py-4">
                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  shp.status === 'Delayed' ? 'bg-red-900/30 text-red-400' : 
                                  shp.status === 'Delivered' ? 'bg-green-900/30 text-green-400' : 
                                  'bg-blue-900/30 text-blue-400'
                               }`}>
                                  {shp.status}
                               </span>
                            </td>
                            <td className="px-6 py-4 w-32">
                               <div className="w-full bg-[#27272a] h-1.5 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${shp.status === 'Delayed' ? 'bg-red-500' : 'bg-blue-500'}`} 
                                    style={{ width: `${shp.progress}%` }}
                                  ></div>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
            </div>
         </div>

         <div className="space-y-4">
             {/* Live Prediction Card */}
             {activeShipmentId ? (
                 <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-5 animate-slide-up relative overflow-hidden">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-purple-900/20 rounded-lg">
                            <Clock size={20} className="text-purple-500"/>
                        </div>
                        <span className="text-xs text-gray-500 uppercase font-bold">Last-Mile Prediction</span>
                    </div>
                    
                    <div className="mb-4">
                        <div className="text-3xl font-bold text-white mb-1">{activeShipment?.deliveryWindow || '--'}</div>
                        <div className="text-xs text-gray-400">Predicted Arrival Window ({timezoneMode})</div>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-[#27272a]">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 flex items-center"><TrafficCone size={12} className="mr-2"/> Traffic Impact</span>
                            <span className="text-yellow-400">+12 mins</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 flex items-center"><ShieldAlert size={12} className="mr-2"/> War Risk</span>
                            <span className={`${activeShipment?.activeRisks?.includes('RZ-1') ? 'text-red-500 font-bold' : 'text-green-400'}`}>
                                {activeShipment?.activeRisks?.includes('RZ-1') ? 'Detected' : 'None'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 flex items-center"><Gavel size={12} className="mr-2"/> Strike Risk</span>
                            <span className={`${activeShipment?.activeRisks?.includes('RZ-2') ? 'text-red-500 font-bold' : 'text-green-400'}`}>
                                {activeShipment?.activeRisks?.includes('RZ-2') ? 'High' : 'None'}
                            </span>
                        </div>
                    </div>
                 </div>
             ) : (
                <div className="bg-[#15151a] border border-[#27272a] rounded-xl p-5 flex flex-col items-center justify-center text-center h-48 opacity-60">
                    <Truck size={32} className="text-gray-500 mb-2"/>
                    <p className="text-sm text-gray-400">Select a shipment to view Real-time Prediction</p>
                </div>
             )}
         </div>

      </div>

      {/* Historical Data Deep Dive */}
      <OLAPExplorer phase="DELIVER" title="Shipment History & Logistics Performance" />

    </div>
  );
};

export default LogisticsDashboard;