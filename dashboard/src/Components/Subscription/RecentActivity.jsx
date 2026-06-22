import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

const RecentActivity = ({ activities, loading }) => {
  const getAppearance = (eventType) => {
    if (['INITIAL_PURCHASE', 'NON_RENEWING_PURCHASE'].includes(eventType)) {
      return {
        Icon: CheckCircle2,
        iconClass: 'text-[#34D399]',
        bgClass: 'bg-[#112730]',
      };
    }
    if (['RENEWAL', 'UNCANCELLATION', 'PRODUCT_CHANGE'].includes(eventType)) {
      return {
        Icon: RefreshCw,
        iconClass: 'text-[#60A5FA]',
        bgClass: 'bg-[#1c223c]',
      };
    }
    return {
      Icon: AlertCircle,
      iconClass: 'text-[#FB7185]',
      bgClass: 'bg-[#271b2a]',
    };
  };

  return (
    <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 shadow-sm">
      <h3 className="mb-6 text-[15px] font-bold text-white">Recent Activity</h3>

      <div className="flex flex-col gap-6">
        {loading && !activities.length && (
          <p className="text-sm text-[#64748B]">Loading RevenueCat events…</p>
        )}
        {!loading && !activities.length && (
          <p className="text-sm text-[#64748B]">
            No RevenueCat events received yet.
          </p>
        )}
        {activities.map((activity) => {
          const { Icon, iconClass, bgClass } = getAppearance(activity.event_type);
          return (
            <div key={activity.id} className="flex items-center gap-4">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${bgClass}`}
              >
                <Icon size={16} className={iconClass} />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-bold text-white">
                    {activity.title}
                  </p>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${
                      activity.environment === 'PRODUCTION'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : 'bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {activity.environment || 'UNKNOWN'}
                  </span>
                </div>
                <p className="truncate text-[11px] font-medium text-[#64748B]">
                  {activity.description}
                  {activity.amount_usd
                    ? ` · $${activity.amount_usd.toFixed(2)}`
                    : ''}
                </p>
                <p className="mt-0.5 text-[10px] text-[#475569]">
                  {new Date(activity.occurred_at).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentActivity;
