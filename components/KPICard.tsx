import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPIMetric } from '../types';

interface KPICardProps {
  metric: KPIMetric;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({ metric, color = "blue" }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{metric.label}</h3>
        <span className={`p-1.5 rounded-full bg-${color}-50 text-${color}-600`}>
          {/* Icon placeholder based on generic logic, specific icons can be passed */}
        </span>
      </div>
      
      <div className="flex items-baseline mt-2">
        <span className="text-2xl font-bold text-slate-900">{metric.value}</span>
        {metric.unit && <span className="ml-1 text-sm text-slate-500 font-medium">{metric.unit}</span>}
      </div>

      <div className="mt-4 flex items-center">
        {metric.trend === 'up' && <ArrowUpRight size={16} className="text-green-500 mr-1" />}
        {metric.trend === 'down' && <ArrowDownRight size={16} className="text-red-500 mr-1" />}
        {metric.trend === 'neutral' && <Minus size={16} className="text-slate-400 mr-1" />}
        
        <span className={`text-sm font-medium ${
          metric.trend === 'up' ? 'text-green-600' : 
          metric.trend === 'down' ? 'text-red-600' : 'text-slate-500'
        }`}>
          {Math.abs(metric.change)}%
        </span>
        <span className="ml-2 text-xs text-slate-400">vs last period</span>
      </div>
    </div>
  );
};

export default KPICard;