import React from 'react';
import { CreditCard, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const SubscriptionTable = ({ subscriptions, filterStatus, setFilterStatus, filterPlanType, setFilterPlanType }) => {
  const tabs = ['All Subs', 'Active', 'Expiring', 'Cancelled'];

  return (
    <div className="flex flex-col flex-1">
      {/* Table Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
        {/* Pills */}
        <div className="flex items-center gap-1 bg-[#131B2F] p-1 rounded-full border border-[#1E293B] h-[44px]">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`px-5 h-full rounded-full text-[13px] font-bold transition-all ${
                filterStatus === tab 
                  ? 'bg-[#E2E8F0] text-[#0F172A] shadow-sm' 
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex items-center gap-3">
          <div className="relative h-[44px]">
            <select 
              value={filterPlanType}
              onChange={(e) => setFilterPlanType(e.target.value)}
              className="bg-[#131B2F] border border-[#1E293B] rounded-full pl-5 pr-10 h-full text-[13px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors"
            >
              <option>Plan Type</option>
              <option>Monthly Elite</option>
              <option>Yearly Elite</option>
              <option>Monthly Basic</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
          </div>
          <div className="relative h-[44px]">
            <select className="bg-[#131B2F] border border-[#1E293B] rounded-full pl-5 pr-10 h-full text-[13px] font-medium text-[#94A3B8] outline-none appearance-none cursor-pointer hover:border-[#38BDF8] transition-colors">
              <option>Revenue Range</option>
              <option>$0 - $50</option>
              <option>$50 - $200</option>
              <option>$200+</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#131B2F] rounded-2xl border border-[#1E293B] overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="px-6 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">USER</th>
                <th className="px-6 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">PLAN TYPE</th>
                <th className="px-6 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">RENEWAL DATE</th>
                <th className="px-6 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">PAYMENT</th>
                <th className="px-6 py-5 text-[11px] font-bold text-[#94A3B8] uppercase tracking-widest">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {subscriptions.length > 0 ? subscriptions.map(sub => (
                <tr key={sub.id} className="hover:bg-[#1E293B]/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#1E293B] border border-[#334155] shrink-0"></div>
                      <div>
                        <p className="text-white text-[14px] font-bold">{sub.name}</p>
                        <p className="text-[#64748B] text-[12px]">{sub.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-[13px] font-medium">{sub.plan.split(' ')[0]}</p>
                    <p className="text-[#94A3B8] text-[13px]">{sub.plan.split(' ')[1]}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-[13px] font-medium">{sub.date.split(',')[0]}</p>
                    <p className="text-[#94A3B8] text-[13px]">{sub.date.split(',')[1]}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#94A3B8] text-[13px] font-medium">
                      {sub.payment.includes('PayPal') ? (
                        <>
                          <div className="w-5 h-5 rounded flex items-center justify-center bg-white/10 text-white text-[10px] font-bold">P</div>
                          <span className="font-bold">PayPal</span>
                        </>
                      ) : (
                        <>
                          <CreditCard size={18} />
                          {sub.payment}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center justify-center px-3 py-1 rounded-full border text-[11px] font-bold uppercase tracking-wider ${
                      sub.status === 'Active' 
                        ? 'border-[#064E3B] bg-[#022C22] text-[#34D399]' 
                        : 'border-[#7F1D1D] bg-[#450A0A] text-[#FCA5A5]'
                    }`}>
                      {sub.status}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#64748B] text-[13px]">
                    No subscriptions found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="mt-auto px-6 py-4 border-t border-[#1E293B] flex items-center justify-between">
          <p className="text-[#64748B] text-[12px] font-bold">Showing {subscriptions.length} of 12,458 subscribers</p>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#1E293B] hover:text-white transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1E293B] text-white text-[13px] font-bold">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white text-[13px] font-bold transition-colors">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:bg-[#1E293B] hover:text-white text-[13px] font-bold transition-colors">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#64748B] hover:bg-[#1E293B] hover:text-white transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTable;
