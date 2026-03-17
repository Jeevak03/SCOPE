import React, { useState } from 'react';
import { Box, Leaf, Globe, Grid, Truck, BarChart3, Layers, Settings, Filter } from 'lucide-react';
import { dataProducts } from '../mockData';

const AppStore: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Planning', 'Procurement', 'Manufacturing', 'Logistics', 'E2E Supply Chain', 'PLM & ESG'];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'box': return <Box size={24} />;
      case 'leaf': return <Leaf size={24} />;
      case 'globe': return <Globe size={24} />;
      case 'grid': return <Grid size={24} />;
      case 'truck': return <Truck size={24} />;
      case 'bar-chart': return <BarChart3 size={24} />;
      case 'layers': return <Layers size={24} />;
      case 'settings': return <Settings size={24} />;
      default: return <Box size={24} />;
    }
  };

  const filteredProducts = filter === 'All' 
    ? dataProducts 
    : dataProducts.filter(p => p.category === filter || (filter === 'PLM & ESG' && p.category === 'ESG'));

  return (
    <div className="space-y-6 animate-fade-in">
      
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-2xl font-bold text-white">Supply Chain Data Products</h2>
           <p className="text-gray-400 text-sm mt-1">Explore and deploy specialized agents and analytics modules.</p>
        </div>
        <div className="flex items-center space-x-2">
            <span className="h-8 w-8 rounded-full bg-gray-700 text-xs flex items-center justify-center text-white">IM</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 pb-4 border-b border-[#27272a]">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-full text-xs font-medium transition-all ${
              filter === f 
                ? 'bg-[#2e2e36] text-white border border-[#3f3f46]' 
                : 'bg-[#15151a] text-gray-500 border border-[#27272a] hover:bg-[#1e1e24] hover:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-[#15151a] border border-[#27272a] rounded-xl p-6 hover:border-[#ffe600] transition-colors group cursor-pointer flex flex-col h-full">
            <div className="mb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform">
                {getIcon(product.icon)}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{product.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>
            <div className="mt-auto pt-4 border-t border-[#27272a] flex justify-between items-center">
               <span className="text-xs text-gray-500 font-mono uppercase">{product.category}</span>
               <button className="text-[#ffe600] text-xs font-bold uppercase hover:underline">Deploy &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppStore;