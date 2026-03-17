import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { 
  Filter, Download, ChevronLeft, ChevronRight, ArrowUpDown, Search, Calendar, FileText, X, Building, CheckCircle, AlertTriangle, RefreshCw, Clock
} from 'lucide-react';
import { HistoricalRecord, SCORPhase, VendorProfile } from '../types';
import { olapData, vendorRegistry } from '../mockData';

interface OLAPExplorerProps {
  phase: SCORPhase;
  title?: string;
}

type TimezoneMode = 'Local' | 'UTC' | 'Entity';

const OLAPExplorer: React.FC<OLAPExplorerProps> = ({ phase, title }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // Advanced Filters
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  
  // Timezone State
  const [timezoneMode, setTimezoneMode] = useState<TimezoneMode>('Entity');

  const [sortConfig, setSortConfig] = useState<{ key: keyof HistoricalRecord; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // 1. Extract Unique Options for Dropdowns based on Phase Data
  const { years, countries, categories } = useMemo(() => {
    const phaseData = olapData.filter(d => d.phase === phase);
    const yrs = Array.from(new Set(phaseData.map(d => d.date.split('-')[0]))).sort().reverse();
    const cnts = Array.from(new Set(phaseData.map(d => d.country))).sort();
    const cats = Array.from(new Set(phaseData.map(d => d.category))).sort();
    return { years: yrs, countries: cnts, categories: cats };
  }, [phase]);

  // 2. Filter Logic
  const filteredData = useMemo(() => {
    return olapData.filter(item => {
      // Phase Filter
      if (item.phase !== phase) return false;
      
      // Text Search (Fuzzy)
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matches = 
          item.primaryDimension.toLowerCase().includes(lowerSearch) || 
          item.secondaryDimension.toLowerCase().includes(lowerSearch) ||
          item.owner.toLowerCase().includes(lowerSearch);
        if (!matches) return false;
      }

      // Dropdown Filters
      if (selectedYear !== 'All' && !item.date.startsWith(selectedYear)) return false;
      if (selectedCountry !== 'All' && item.country !== selectedCountry) return false;
      if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [phase, searchTerm, selectedYear, selectedCountry, selectedCategory, sortConfig]);

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Chart Data Aggregation (Time Series)
  const chartData = useMemo(() => {
    // Aggregate by Month
    const agg: Record<string, { date: string; value: number; count: number }> = {};
    filteredData.forEach(item => {
      const month = item.date.substring(0, 7); // YYYY-MM
      if (!agg[month]) agg[month] = { date: month, value: 0, count: 0 };
      agg[month].value += item.value;
      agg[month].count += 1;
    });
    return Object.values(agg).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  const handleSort = (key: keyof HistoricalRecord) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleVendorClick = (vendorName: string) => {
    if (phase === 'SOURCE' && vendorRegistry[vendorName]) {
      setSelectedVendor(vendorRegistry[vendorName]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedYear('All');
    setSelectedCountry('All');
    setSelectedCategory('All');
    setCurrentPage(1);
  };

  // Helper: Timezone Formatting
  const formatTransactionTime = (isoString: string, recordTimezone: string) => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;

    if (timezoneMode === 'UTC') {
      return date.toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    } 
    
    if (timezoneMode === 'Local') {
      // Browser Local Time
      return date.toLocaleString(undefined, { 
        year: 'numeric', month: 'numeric', day: 'numeric', 
        hour: '2-digit', minute: '2-digit' 
      });
    }

    if (timezoneMode === 'Entity') {
      // Entity Location Time
      try {
        return date.toLocaleString('en-US', { 
          timeZone: recordTimezone, 
          year: 'numeric', month: 'numeric', day: 'numeric', 
          hour: '2-digit', minute: '2-digit',
          timeZoneName: 'short'
        });
      } catch (e) {
        return date.toISOString(); // Fallback
      }
    }
    return isoString;
  };

  const headers: { label: string; key: keyof HistoricalRecord }[] = [
    { label: 'Timestamp', key: 'date' },
    { label: phase === 'SOURCE' ? 'Vendor' : phase === 'DELIVER' ? 'Carrier' : 'Entity', key: 'primaryDimension' },
    { label: 'Category', key: 'category' },
    { label: 'Country', key: 'country' },
    { label: 'Metric', key: 'metricName' },
    { label: 'Value', key: 'value' },
    { label: 'Status', key: 'status' },
  ];

  return (
    <div className="bg-[#15151a] border border-[#27272a] rounded-xl overflow-hidden animate-slide-up mt-8 shadow-xl">
      
      {/* Header */}
      <div className="p-5 border-b border-[#27272a] flex justify-between items-center bg-[#1a1a20]">
        <div>
           <h3 className="text-white font-bold text-lg flex items-center">
             <FileText className="mr-2 text-[#ffe600]" size={20} />
             {title || 'Historical Data Explorer (OLAP)'}
           </h3>
           <p className="text-xs text-gray-400 mt-1">Deep dive into {phase} historical records, trends, and entity details.</p>
        </div>
        <div className="flex items-center space-x-3">
           
           {/* Timezone Toggles */}
           <div className="flex bg-[#101014] rounded-lg p-1 border border-[#3f3f46]">
              {['Entity', 'UTC', 'Local'].map((mode) => (
                 <button
                    key={mode}
                    onClick={() => setTimezoneMode(mode as TimezoneMode)}
                    className={`px-3 py-1 rounded text-[10px] font-bold uppercase transition-all flex items-center ${
                       timezoneMode === mode ? 'bg-[#ffe600] text-black' : 'text-gray-400 hover:text-white'
                    }`}
                 >
                    {mode === 'Entity' && <Building size={10} className="mr-1"/>}
                    {mode === 'UTC' && <Clock size={10} className="mr-1"/>}
                    {mode}
                 </button>
              ))}
           </div>

           <button className="flex items-center px-3 py-1.5 bg-[#2e2e36] text-white rounded-lg text-xs hover:bg-[#3f3f46] border border-[#3f3f46]">
               <Download size={14} className="mr-2" /> Export CSV
           </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Advanced Filters Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 bg-[#1e1e24] p-4 rounded-xl border border-[#27272a]">
           
           {/* Search */}
           <div className="relative col-span-1 md:col-span-2">
             <input 
                type="text" 
                placeholder={`Search ${phase === 'SOURCE' ? 'Vendor' : 'Items'}...`} 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#15151a] border border-[#3f3f46] rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:ring-1 focus:ring-[#ffe600]"
             />
             <Search size={14} className="absolute left-3 top-3 text-gray-500" />
           </div>

           {/* Year Dropdown */}
           <div>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#15151a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#ffe600]"
              >
                 <option value="All">All Years</option>
                 {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
           </div>

           {/* Country Dropdown */}
           <div>
              <select 
                value={selectedCountry} 
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#15151a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#ffe600]"
              >
                 <option value="All">All Countries</option>
                 {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>

           {/* Category Dropdown */}
           <div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-[#15151a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-white focus:ring-1 focus:ring-[#ffe600]"
              >
                 <option value="All">All Categories</option>
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {/* Active Filters & Reset */}
        {(selectedYear !== 'All' || selectedCountry !== 'All' || selectedCategory !== 'All' || searchTerm) && (
           <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 uppercase font-bold mr-2">Active Filters:</span>
              {selectedYear !== 'All' && <span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-900 flex items-center">Year: {selectedYear}</span>}
              {selectedCountry !== 'All' && <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-900 flex items-center">Country: {selectedCountry}</span>}
              {selectedCategory !== 'All' && <span className="px-2 py-1 bg-purple-900/30 text-purple-400 rounded text-xs border border-purple-900 flex items-center">Category: {selectedCategory}</span>}
              
              <button onClick={clearFilters} className="text-xs text-gray-400 hover:text-white flex items-center ml-auto">
                 <RefreshCw size={12} className="mr-1"/> Reset Filters
              </button>
           </div>
        )}

        {/* Analytics Graph */}
        <div className="bg-[#1e1e24] p-4 rounded-xl border border-[#27272a] h-64">
           <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              Trend Analysis ({filteredData[0]?.metricName || 'Value'})
           </h4>
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
               <XAxis dataKey="date" stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
               <YAxis stroke="#52525b" tick={{fill: '#9ca3af', fontSize: 10}} />
               <Tooltip contentStyle={{ backgroundColor: '#15151a', borderColor: '#3f3f46', color: '#fff' }} />
               <Line type="monotone" dataKey="value" stroke="#ffe600" strokeWidth={2} dot={{fill: '#ffe600', r: 3}} activeDot={{r: 6}} />
             </LineChart>
           </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-[#27272a]">
           <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-[#1e1e24] text-xs uppercase font-medium text-gray-500">
                 <tr>
                    {headers.map(header => (
                       <th 
                          key={header.key}
                          onClick={() => handleSort(header.key)}
                          className="px-6 py-3 cursor-pointer hover:text-white transition-colors"
                       >
                          <div className="flex items-center">
                             {header.label}
                             <ArrowUpDown size={12} className="ml-1 opacity-50" />
                          </div>
                       </th>
                    ))}
                 </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a] bg-[#15151a]">
                 {currentItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1e1e24] transition-colors">
                       <td className="px-6 py-4 font-mono text-xs">
                          {formatTransactionTime(item.date, item.timezone)}
                          <div className="text-[9px] text-gray-600 mt-0.5">{item.timezone}</div>
                       </td>
                       <td className="px-6 py-4 font-medium text-white">
                          {phase === 'SOURCE' && vendorRegistry[item.primaryDimension] ? (
                             <button 
                                onClick={() => handleVendorClick(item.primaryDimension)}
                                className="text-blue-400 hover:underline hover:text-blue-300 flex items-center"
                             >
                                <Building size={12} className="mr-1" />
                                {item.primaryDimension}
                             </button>
                          ) : (
                             item.primaryDimension
                          )}
                       </td>
                       <td className="px-6 py-4">{item.category}</td>
                       <td className="px-6 py-4">{item.country}</td>
                       <td className="px-6 py-4 text-xs">{item.metricName}</td>
                       <td className="px-6 py-4 text-white font-mono">{item.value.toLocaleString()}</td>
                       <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                             item.status === 'Completed' ? 'bg-green-900/30 text-green-400' :
                             item.status === 'Delayed' ? 'bg-red-900/30 text-red-400' :
                             'bg-blue-900/30 text-blue-400'
                          }`}>
                             {item.status}
                          </span>
                       </td>
                    </tr>
                 ))}
                 {currentItems.length === 0 && (
                    <tr>
                       <td colSpan={7} className="px-6 py-12 text-center text-gray-500 flex flex-col items-center justify-center">
                          <Filter size={24} className="mb-2 opacity-50"/>
                          <p>No records found matching these filters.</p>
                       </td>
                    </tr>
                 )}
              </tbody>
           </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center pt-2">
           <button 
             onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
             disabled={currentPage === 1}
             className="flex items-center px-3 py-1.5 bg-[#1e1e24] border border-[#3f3f46] rounded hover:bg-[#27272a] disabled:opacity-50 text-xs text-gray-300"
           >
              <ChevronLeft size={14} className="mr-1" /> Previous
           </button>
           <span className="text-xs text-gray-500">Page {currentPage} of {totalPages}</span>
           <button 
             onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
             disabled={currentPage === totalPages}
             className="flex items-center px-3 py-1.5 bg-[#1e1e24] border border-[#3f3f46] rounded hover:bg-[#27272a] disabled:opacity-50 text-xs text-gray-300"
           >
              Next <ChevronRight size={14} className="ml-1" />
           </button>
        </div>

      </div>

      {/* Vendor Details Modal */}
      {selectedVendor && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-[#1e1e24] border border-[#3f3f46] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in">
               <div className="p-6 border-b border-[#27272a] flex justify-between items-start bg-gradient-to-r from-[#1a1a20] to-[#27272a]">
                  <div>
                     <h2 className="text-xl font-bold text-white flex items-center">
                        <Building className="mr-2 text-blue-500" />
                        {selectedVendor.name}
                     </h2>
                     <p className="text-sm text-gray-400 mt-1">{selectedVendor.legalName}</p>
                  </div>
                  <button onClick={() => setSelectedVendor(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
               </div>
               
               <div className="p-6 space-y-6">
                  
                  {/* Key Stats */}
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-[#15151a] p-3 rounded border border-[#27272a]">
                        <div className="text-[10px] text-gray-500 uppercase">Risk Score</div>
                        <div className={`text-xl font-bold ${selectedVendor.riskScore > 20 ? 'text-red-500' : 'text-green-500'}`}>
                           {selectedVendor.riskScore}/100
                        </div>
                     </div>
                     <div className="bg-[#15151a] p-3 rounded border border-[#27272a]">
                        <div className="text-[10px] text-gray-500 uppercase">Inc. Date</div>
                        <div className="text-sm font-mono text-white mt-1">{selectedVendor.incorporationDate}</div>
                     </div>
                     <div className="bg-[#15151a] p-3 rounded border border-[#27272a]">
                        <div className="text-[10px] text-gray-500 uppercase">Country</div>
                        <div className="text-sm text-white mt-1">{selectedVendor.country}</div>
                     </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                     <div className="flex justify-between border-b border-[#27272a] pb-2">
                        <span className="text-gray-500">Tax ID</span>
                        <span className="text-white font-mono">{selectedVendor.taxId}</span>
                     </div>
                     <div className="flex justify-between border-b border-[#27272a] pb-2">
                        <span className="text-gray-500">Headquarters</span>
                        <span className="text-white text-right max-w-[200px]">{selectedVendor.address}</span>
                     </div>
                     <div className="flex justify-between items-center pt-1">
                        <span className="text-gray-500">Certifications</span>
                        <div className="flex space-x-1">
                           {selectedVendor.certifications.map(c => (
                              <span key={c} className="px-2 py-0.5 bg-green-900/20 text-green-400 border border-green-900 rounded text-xs flex items-center">
                                 <CheckCircle size={10} className="mr-1"/> {c}
                              </span>
                           ))}
                        </div>
                     </div>
                  </div>

                  {selectedVendor.riskScore > 20 && (
                     <div className="bg-red-900/20 border border-red-900/50 rounded p-3 flex items-start space-x-3">
                        <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                           <h4 className="text-red-400 font-bold text-xs">High Risk Entity</h4>
                           <p className="text-gray-400 text-xs mt-1">This vendor has an elevated risk score due to geopolitical location or recent financial alerts.</p>
                        </div>
                     </div>
                  )}

               </div>
               <div className="p-4 bg-[#15151a] border-t border-[#27272a] flex justify-end">
                  <button onClick={() => setSelectedVendor(null)} className="px-4 py-2 bg-[#ffe600] text-black font-bold text-sm rounded hover:bg-yellow-400">
                     Close Profile
                  </button>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};

export default OLAPExplorer;