import React from 'react';
import { BadgeCheck, LayoutGrid, AlertTriangle } from 'lucide-react';

const ActivePlans = ({ plans, loading }) => {
  const formatPrice = (plan) => {
    if (plan.price === null || plan.price === undefined) {
      return 'Price not synced';
    }
    return Number(plan.price).toLocaleString('en-US', {
      style: 'currency',
      currency: plan.price_currency || 'USD',
    });
  };

  const getStoreStyle = (store) => {
    const s = String(store || '').toLowerCase();
    if (s.includes('apple') || s.includes('app_store') || s.includes('appstore') || s.includes('ios')) {
      return {
        label: 'App Store',
        badgeClass: 'bg-blue-500/10 text-blue-400 ring-1 ring-inset ring-blue-500/20',
        glowClass: 'from-blue-600/15 to-[#131b2f]/5',
        borderClass: 'border-blue-500/20 hover:border-blue-500/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.1)]',
      };
    }
    if (s.includes('play') || s.includes('google') || s.includes('play_store') || s.includes('android')) {
      return {
        label: 'Play Store',
        badgeClass: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20',
        glowClass: 'from-emerald-600/15 to-[#131b2f]/5',
        borderClass: 'border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.1)]',
      };
    }
    return {
      label: store || 'Unknown Store',
      badgeClass: 'bg-slate-500/10 text-slate-400 ring-1 ring-inset ring-slate-500/20',
      glowClass: 'from-slate-600/10 to-[#131b2f]/5',
      borderClass: 'border-[#1E293B] hover:border-slate-500/30 hover:shadow-[0_0_25px_rgba(148,163,184,0.05)]',
    };
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#1e293b]/40 pb-2">
        <h2 className="text-lg font-bold text-white tracking-tight">Active Plans</h2>
        <span className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-bold text-[#94a3b8] ring-1 ring-inset ring-slate-700/50">
          {plans.length} total
        </span>
      </div>

      {loading && !plans.length && (
        <div className="h-52 animate-pulse rounded-2xl border border-[#1e293b]/60 bg-[#131b2f]/30" />
      )}

      {!loading && !plans.length && (
        <div className="rounded-2xl border border-[#1E293B]/60 bg-[#131b2f]/20 p-6 text-sm text-[#94A3B8] backdrop-blur-md">
          No active production plans were found.
        </div>
      )}

      {plans.map((plan, index) => {
        const Icon = index % 2 === 0 ? LayoutGrid : BadgeCheck;
        const styleInfo = getStoreStyle(plan.store);
        return (
          <div
            key={plan.product_id}
            className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br ${styleInfo.glowClass} p-6 transition-all duration-300 ${styleInfo.borderClass} hover:-translate-y-0.5`}
          >
            <div className="mb-4 flex items-start justify-between">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest ${styleInfo.badgeClass}`}>
                {styleInfo.label}
              </span>
              <Icon className="text-[#64748b] group-hover:text-white transition-colors duration-300" size={20} />
            </div>

            <h3 className="mb-1 text-xl font-bold text-white tracking-tight">{plan.name}</h3>
            
            {plan.app_name && (
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                {plan.app_name}
              </p>
            )}
            
            <p className="mb-4 break-all text-[11px] font-mono text-[#64748b]">
              {plan.product_id}
            </p>

            <div className="mb-5 flex items-baseline gap-1.5 border-b border-[#1e293b]/30 pb-4">
              <span className="text-2xl font-black text-white">
                {formatPrice(plan)}
              </span>
              {plan.interval !== 'unknown' && (
                <span className="text-xs font-bold text-[#94a3b8]">
                  / {plan.interval}
                </span>
              )}
            </div>

            <p className="mb-5 text-[10px] leading-relaxed text-[#64748b]">
              {plan.price_source === 'revenuecat_catalog' &&
                `Catalog price${plan.price_country ? ` · ${plan.price_country}` : ''}`}
              {plan.price_source === 'production_transaction' &&
                'Observed production store transaction'}
              {plan.price_source === 'sandbox_transaction' &&
                'Observed sandbox store transaction'}
              {plan.price_source === 'manual_env' &&
                'Configured package price'}
              {!plan.price_source &&
                'RevenueCat returned no store catalog price'}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-[#1e293b]/60 bg-[#07090e]/60 p-3 shadow-inner">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  Subscribers
                </p>
                <p className="text-base font-extrabold text-white">{plan.subscribers}</p>
              </div>
              <div className="rounded-xl border border-[#1e293b]/60 bg-[#07090e]/60 p-3 shadow-inner">
                <p className="mb-0.5 text-[9px] font-bold uppercase tracking-wider text-[#64748b]">
                  Duration
                </p>
                <p className="text-base font-extrabold text-white">
                  {plan.duration || 'Unavailable'}
                </p>
                {plan.interval === 'yearly' && plan.duration === 'P1M' && (
                  <div className="mt-1 flex items-center gap-1 text-[9px] font-bold text-amber-400">
                    <AlertTriangle size={10} />
                    <span>Duration conflict (1 Month vs Yearly)</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivePlans;
