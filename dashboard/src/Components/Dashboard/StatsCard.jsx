import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ title, value, change, icon: Icon, bgIcon: BgIcon }) => {
  return (
    <div className="bg-[#131B2F] p-5 rounded-2xl shadow-sm border border-[#1E293B] flex flex-col justify-between h-[140px] relative overflow-hidden group hover:border-[#334155] transition-colors">
      {/* Background Watermark Icon */}
      {BgIcon && (
        <div className="absolute -bottom-6 -right-6 text-[#1E293B] opacity-40 pointer-events-none">
          <BgIcon size={100} strokeWidth={1} color="#00D4FF0A" />
        </div>
      )}

      {/* Top Row: Icon and Change Pill */}
      <div className="flex justify-between items-start relative z-10">
        <div className="p-2.5 bg-[#1E293B]/50 rounded-xl text-blue-400 backdrop-blur-sm border border-[#334155]/50">
          {React.isValidElement(Icon) ? Icon : Icon && <Icon size={20} strokeWidth={2} />}
        </div>
        {change && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#10B981]/15 border border-[#10B981]/25 text-[#10B981]">
            <TrendingUp size={12} strokeWidth={3} />
            <span className="text-[11px] font-bold">{change}</span>
          </div>
        )}
      </div>

      {/* Bottom Row: Title and Value */}
      <div className="relative z-10 mt-auto">
        <h4 className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">{title}</h4>
        <h3 className="text-[24px] font-bold text-white">{value}</h3>
      </div>
    </div>
  );
};

export default StatsCard;
