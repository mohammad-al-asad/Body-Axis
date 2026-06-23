import React from 'react';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Store,
} from 'lucide-react';

const SubscriptionTable = ({
  subscriptions,
  filteredTotal,
  total,
  loading,
  filterStatus,
  setFilterStatus,
  filterPlanType,
  setFilterPlanType,
  planOptions,
  onManageAccess,
  currentPage,
  pageCount,
  onPageChange,
}) => {
  const tabs = [
    'All Subs',
    'Active',
    'Trialing',
    'Cancelled',
    'Expired',
    'Billing Retry',
  ];

  const statusConfig = {
    Active: { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400 animate-pulse' },
    Trialing: { badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20', dot: 'bg-sky-400' },
    'Grace Period': { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20', dot: 'bg-amber-400' },
    'Billing Retry': { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20', dot: 'bg-rose-400' },
    Cancelled: { badge: 'bg-orange-500/10 text-orange-400 border-orange-500/20', dot: 'bg-orange-400' },
    Expired: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
    Paused: { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
    Incomplete: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
    Unknown: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
    Inactive: { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20', dot: 'bg-slate-400' },
  };

  const getAvatarStyle = (name) => {
    const charCode = name ? name.charCodeAt(0) : 65;
    const index = charCode % 5;
    const styles = [
      'bg-blue-500/10 text-blue-400 border-blue-500/25',
      'bg-teal-500/10 text-teal-400 border-teal-500/25',
      'bg-purple-500/10 text-purple-400 border-purple-500/25',
      'bg-rose-500/10 text-rose-400 border-rose-500/25',
      'bg-sky-500/10 text-sky-400 border-sky-500/25',
    ];
    return styles[index];
  };

  const formatStore = (value) =>
    value
      ? value
          .replaceAll('_', ' ')
          .toLowerCase()
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : 'Unavailable';

  return (
    <div className="flex flex-1 flex-col">
      <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex h-[44px] max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#1E293B]/60 bg-[#131b2f]/45 p-1 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`h-full whitespace-nowrap rounded-full px-5 text-[13px] font-bold transition-all duration-200 ${
                filterStatus === tab
                  ? 'bg-white text-[#0f172a] shadow-sm'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative h-[44px]">
          <select
            value={filterPlanType}
            onChange={(event) => setFilterPlanType(event.target.value)}
            className="h-full cursor-pointer appearance-none rounded-full border border-[#1E293B]/60 bg-[#131b2f]/45 pl-5 pr-10 text-[13px] font-bold text-[#94A3B8] outline-none backdrop-blur-md transition-colors hover:border-blue-500/40 hover:text-white"
          >
            <option>Plan Type</option>
            {planOptions.map((plan) => (
              <option key={plan}>{plan}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#475569]"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#1E293B]/60 bg-[#131b2f]/45 shadow-sm backdrop-blur-md">
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-[930px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1E293B]/60 bg-[#07090e]/20">
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  User
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  Plan
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  Expiration
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  Store
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-[#64748b]">
                  Access
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]/40">
              {subscriptions.length ? (
                subscriptions.map((subscription) => {
                  const avatarClass = getAvatarStyle(subscription.name);
                  const statusInfo = statusConfig[subscription.status] || statusConfig.Inactive;
                  return (
                    <tr
                      key={subscription.id}
                      className="group transition-all duration-200 hover:bg-[#1E293B]/20"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold shadow-inner ${avatarClass}`}>
                            {subscription.name.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[14px] font-extrabold text-white leading-tight">
                              {subscription.name}
                            </p>
                            <p className="text-[11px] text-[#64748B] mt-0.5">
                              {subscription.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-white leading-tight">
                          {subscription.plan_name}
                        </p>
                        <p
                          className="max-w-[180px] truncate text-[11px] text-[#64748b] mt-0.5 font-mono"
                          title={subscription.product_id || ''}
                        >
                          {subscription.product_id || 'Product unavailable'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[13px] font-bold text-white leading-tight">
                          {subscription.expires_at
                            ? new Date(subscription.expires_at).toLocaleDateString()
                            : 'No expiration'}
                        </p>
                        <p className="text-[11px] text-[#64748b] mt-0.5">
                          {subscription.auto_renewal_status
                            ? formatStore(subscription.auto_renewal_status)
                            : 'Renewal unavailable'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5 text-[13px] font-medium text-[#94A3B8]">
                          <Store size={16} className="text-[#64748b]" />
                          <div>
                            <p className="font-bold text-white/90 leading-tight">{formatStore(subscription.store)}</p>
                            <p
                              className={`text-[9px] font-extrabold mt-0.5 ${
                                subscription.environment === 'PRODUCTION'
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {subscription.environment || 'UNKNOWN'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div
                            className={`inline-flex items-center gap-1.5 justify-center rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-widest ${statusInfo.badge}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                            {subscription.status}
                          </div>
                          <p className="text-[10px] text-[#64748B] font-medium pl-1">
                            ${Number(subscription.total_revenue_usd || 0).toFixed(2)}
                            {' LTV'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => onManageAccess(subscription)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/40 px-3.5 py-2 text-xs font-bold text-[#cbd5e1] shadow-sm transition-all hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-400 active:scale-[0.97]"
                        >
                          <KeyRound size={13} className="text-[#64748b] group-hover:text-blue-400" />
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-xs text-[#64748B]"
                  >
                    {loading
                      ? 'Loading RevenueCat subscriptions…'
                      : 'No subscriptions found matching your filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto flex items-center justify-between gap-4 border-t border-[#1E293B]/60 bg-[#07090e]/10 px-6 py-4">
          <p className="text-xs font-bold text-[#64748B]">
            Showing {subscriptions.length} of {filteredTotal} filtered subscribers
            {filteredTotal !== total ? ` (${total} total)` : ''}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#1E293B]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => onPageChange(page)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-[12px] font-extrabold transition-all duration-200 ${
                    currentPage === page
                      ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-500/50'
                      : 'text-[#94A3B8] hover:bg-[#1E293B]/60 hover:text-white'
                  }`}
                >
                  {page}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
              disabled={currentPage === pageCount}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#64748B] transition-colors hover:bg-[#1E293B]/60 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTable;
