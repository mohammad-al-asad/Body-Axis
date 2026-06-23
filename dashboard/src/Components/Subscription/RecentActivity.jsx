import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const RecentActivity = ({ activities, loading }) => {
  const getAppearance = (eventType) => {
    if (['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE'].includes(eventType)) {
      return {
        Icon: CheckCircle2,
        iconClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10 border border-emerald-500/20 ring-4 ring-[#131b2f]',
      };
    }
    if (['RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'].includes(eventType)) {
      return {
        Icon: RefreshCw,
        iconClass: 'text-blue-400',
        bgClass: 'bg-blue-500/10 border border-blue-500/20 ring-4 ring-[#131b2f]',
      };
    }
    return {
      Icon: AlertCircle,
      iconClass: 'text-rose-400',
      bgClass: 'bg-rose-500/10 border border-rose-500/20 ring-4 ring-[#131b2f]',
    };
  };

  return (
    <div className="rounded-2xl border border-[#1E293B]/60 bg-[#131b2f]/45 p-6 shadow-sm backdrop-blur-md">
      <div className="mb-6 flex items-center justify-between border-b border-[#1e293b]/40 pb-3">
        <h3 className="text-md font-bold text-white tracking-tight">Recent Activity</h3>
        <span className="rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-bold text-[#94a3b8] ring-1 ring-inset ring-slate-700/50">
          Events
        </span>
      </div>

      <div className="relative">
        {loading && !activities.length && (
          <p className="text-xs text-[#64748B] py-4 text-center">Loading RevenueCat events…</p>
        )}
        {!loading && !activities.length && (
          <p className="text-xs text-[#64748B] py-4 text-center">
            No RevenueCat events received yet.
          </p>
        )}

        {activities.length > 0 && (
          <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-[#1e293b]/50" />
        )}

        <div className="space-y-6">
          {activities.map((activity) => {
            const { Icon, iconClass, bgClass } = getAppearance(activity.event_type);
            return (
              <div key={activity.id} className="relative flex gap-4 items-start">
                <div
                  className={`z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 hover:scale-105 ${bgClass}`}
                >
                  <Icon size={15} className={iconClass} />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                    <p className="text-[13px] font-extrabold text-white leading-tight">
                      {activity.title}
                    </p>
                    <span
                      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider ${
                        activity.environment === 'PRODUCTION'
                          ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-inset ring-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/20'
                      }`}
                    >
                      {activity.environment || 'UNKNOWN'}
                    </span>
                  </div>
                  
                  <p className="mt-1 text-[11px] font-medium text-[#94a3b8] leading-normal">
                    {activity.description}
                    {activity.amount_usd !== undefined && activity.amount_usd !== null ? (
                      <span className="font-bold text-emerald-400 font-mono">
                        {' · '}${activity.amount_usd.toFixed(2)}
                      </span>
                    ) : null}
                  </p>
                  
                  <p className="mt-1.5 text-[9px] font-semibold text-[#475569]">
                    {new Date(activity.occurred_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
