import React from 'react';
import { LayoutGrid, BadgeCheck } from 'lucide-react';

const ActivePlans = () => {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-white text-lg font-medium mb-1">Active Plans</h2>
      
      {/* Monthly Membership */}
      <div className="bg-[rgba(11,40,89,1)] rounded-2xl p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(11,40,89,0.5)] transition-all border border-[#1E2E5C]">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Popular
          </div>
          <LayoutGrid className="text-white/40" size={24} />
        </div>
        
        <h3 className="text-white text-xl font-bold mb-2">Monthly Membership</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-white text-4xl font-bold">$29</span>
          <span className="text-white/70 text-sm font-medium">/mo</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0E1736] rounded-xl p-3">
            <p className="text-white/70 text-[10px] font-bold mb-1">Subscribers</p>
            <p className="text-white font-bold text-sm">8,420</p>
          </div>
          <div className="bg-[#0E1736] rounded-xl p-3">
            <p className="text-white/70 text-[10px] font-bold mb-1">Conversion</p>
            <p className="text-white font-bold text-sm">12%</p>
          </div>
        </div>
      </div>

      {/* Yearly Membership */}
      <div className="bg-[rgba(11,40,89,1)] rounded-2xl p-6 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(11,40,89,0.5)] transition-all border border-[#1E2E5C]">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white/5 text-white/80 border border-white/10 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
            Best Value
          </div>
          <BadgeCheck className="text-white/40" size={24} />
        </div>
        
        <h3 className="text-white text-xl font-bold mb-2">Yearly Membership</h3>
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-white text-4xl font-bold">$249</span>
          <span className="text-white/70 text-sm font-medium">/yr</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#0E1736] rounded-xl p-3">
            <p className="text-white/70 text-[10px] font-bold mb-1">Subscribers</p>
            <p className="text-white font-bold text-sm">4,038</p>
          </div>
          <div className="bg-[#0E1736] rounded-xl p-3">
            <p className="text-white/70 text-[10px] font-bold mb-1">Conversion</p>
            <p className="text-white font-bold text-sm">28%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivePlans;
