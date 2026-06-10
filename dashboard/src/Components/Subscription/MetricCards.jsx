import React from 'react';
import { Users, Banknote, CalendarCheck, RefreshCcw, TrendingUp } from 'lucide-react';

const MetricCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Card 1: Total Subscribers */}
      <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm relative overflow-hidden group hover:border-[#1E3A8A] transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#1E293B] flex items-center justify-center text-[#94A3B8]">
            <Users size={20} />
          </div>
          <div className="flex items-center gap-1 text-[#34D399] text-[13px] font-bold">
            <TrendingUp size={14} strokeWidth={3} />
            <span>+12%</span>
          </div>
        </div>
        <p className="text-[#94A3B8] text-[12px] font-bold mb-1">Total Subscribers</p>
        <h3 className="text-white text-[28px] font-bold">12,458</h3>
      </div>

      {/* Card 2: Monthly Revenue */}
      <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm relative overflow-hidden group hover:border-[#0D9488]/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0D9488]/20 flex items-center justify-center text-[#2DD4BF]">
            <Banknote size={20} />
          </div>
          <div className="flex items-center gap-1 text-[#34D399] text-[13px] font-bold">
            <TrendingUp size={14} strokeWidth={3} />
            <span>+8.4%</span>
          </div>
        </div>
        <p className="text-[#94A3B8] text-[12px] font-bold mb-1">Monthly Revenue</p>
        <h3 className="text-white text-[28px] font-bold">$48,290</h3>
      </div>

      {/* Card 3: Yearly Members */}
      <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm relative overflow-hidden group hover:border-[#0284C7]/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0284C7]/20 flex items-center justify-center text-[#38BDF8]">
            <CalendarCheck size={20} />
          </div>
          <div className="text-[#94A3B8] text-[13px] font-bold">
            74% Target
          </div>
        </div>
        <p className="text-[#94A3B8] text-[12px] font-bold mb-1">Yearly Members</p>
        <h3 className="text-white text-[28px] font-bold">74%</h3>
      </div>

      {/* Card 4: Renewal Rate */}
      <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm relative overflow-hidden group hover:border-[#9F1239]/50 transition-colors">
        <div className="flex justify-between items-start mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#9F1239]/20 flex items-center justify-center text-[#FB7185]">
            <RefreshCcw size={20} />
          </div>
          <div className="text-[#2DD4BF] text-[13px] font-bold">
            Optimal
          </div>
        </div>
        <p className="text-[#94A3B8] text-[12px] font-bold mb-1">Renewal Rate</p>
        <h3 className="text-white text-[28px] font-bold">91%</h3>
      </div>
    </div>
  );
};

export default MetricCards;
