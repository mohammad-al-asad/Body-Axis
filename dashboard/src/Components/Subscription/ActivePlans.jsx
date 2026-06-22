import React from 'react';
import { BadgeCheck, LayoutGrid } from 'lucide-react';

const ActivePlans = ({ plans, loading }) => {
  const formatPrice = (plan) => {
    if (
      plan.observed_price_usd === null ||
      plan.observed_price_usd === undefined
    ) {
      return 'Price unavailable';
    }
    if (plan.observed_price_usd === 0) return 'Promotional';
    return Number(plan.observed_price_usd).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-1 text-lg font-medium text-white">Active Plans</h2>

      {loading && !plans.length && (
        <div className="h-52 animate-pulse rounded-2xl border border-[#1E2E5C] bg-[#0B2859]" />
      )}

      {!loading && !plans.length && (
        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 text-sm text-[#94A3B8]">
          No active production plans were found.
        </div>
      )}

      {plans.map((plan, index) => {
        const Icon = index % 2 === 0 ? LayoutGrid : BadgeCheck;
        return (
          <div
            key={plan.product_id}
            className="group relative overflow-hidden rounded-2xl border border-[#1E2E5C] bg-[rgba(11,40,89,1)] p-6 transition-all hover:shadow-[0_0_20px_rgba(11,40,89,0.5)]"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {plan.environment}
              </div>
              <Icon className="text-white/40" size={24} />
            </div>

            <h3 className="mb-1 text-xl font-bold text-white">{plan.name}</h3>
            <p className="mb-4 break-all text-[11px] text-white/45">
              {plan.product_id}
            </p>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-white">
                {formatPrice(plan)}
              </span>
              {plan.interval !== 'unknown' && (
                <span className="text-sm font-medium text-white/70">
                  /{plan.interval}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#0E1736] p-3">
                <p className="mb-1 text-[10px] font-bold text-white/70">
                  Subscribers
                </p>
                <p className="text-sm font-bold text-white">{plan.subscribers}</p>
              </div>
              <div className="rounded-xl bg-[#0E1736] p-3">
                <p className="mb-1 text-[10px] font-bold text-white/70">
                  Conversion
                </p>
                <p className="text-sm font-bold text-white">
                  {plan.conversion_percent === null
                    ? 'Unavailable'
                    : `${plan.conversion_percent}%`}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivePlans;
