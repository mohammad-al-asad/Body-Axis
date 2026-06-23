import React from 'react';
import { ChevronDown, KeyRound, Store } from 'lucide-react';

const SubscriptionTable = ({
  subscriptions,
  total,
  loading,
  filterStatus,
  setFilterStatus,
  filterPlanType,
  setFilterPlanType,
  planOptions,
  onManageAccess,
}) => {
  const tabs = [
    'All Subs',
    'Active',
    'Trialing',
    'Cancelled',
    'Expired',
    'Billing Retry',
  ];
  const statusClass = {
    Active: 'border-[#064E3B] bg-[#022C22] text-[#34D399]',
    Trialing: 'border-sky-700/60 bg-sky-950/60 text-sky-300',
    'Grace Period': 'border-amber-700/60 bg-amber-950/60 text-amber-300',
    'Billing Retry': 'border-red-700/60 bg-red-950/60 text-red-300',
    Cancelled: 'border-orange-800 bg-orange-950/60 text-orange-300',
    Expired: 'border-[#7F1D1D] bg-[#450A0A] text-[#FCA5A5]',
    Paused: 'border-violet-700/60 bg-violet-950/60 text-violet-300',
    Incomplete: 'border-slate-600 bg-slate-900 text-slate-300',
    Unknown: 'border-slate-600 bg-slate-900 text-slate-300',
    Inactive: 'border-slate-700 bg-slate-900 text-slate-300',
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
      <div className="mb-4 flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex h-[44px] max-w-full items-center gap-1 overflow-x-auto rounded-full border border-[#1E293B] bg-[#131B2F] p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`h-full whitespace-nowrap rounded-full px-5 text-[13px] font-bold transition-all ${
                filterStatus === tab
                  ? 'bg-[#E2E8F0] text-[#0F172A] shadow-sm'
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
            className="h-full cursor-pointer appearance-none rounded-full border border-[#1E293B] bg-[#131B2F] pl-5 pr-10 text-[13px] font-medium text-[#94A3B8] outline-none transition-colors hover:border-[#38BDF8]"
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F]">
        <div className="flex-1 overflow-x-auto">
          <table className="min-w-[930px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#1E293B]">
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  User
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Plan
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Expiration
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Store
                </th>
                <th className="px-6 py-5 text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Access
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {subscriptions.length ? (
                subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="group transition-colors hover:bg-[#1E293B]/40"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#334155] bg-[#1E293B] text-sm font-bold text-[#94A3B8]">
                          {subscription.name.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-[14px] font-bold text-white">
                            {subscription.name}
                          </p>
                          <p className="text-[12px] text-[#64748B]">
                            {subscription.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-white">
                        {subscription.plan_name}
                      </p>
                      <p
                        className="max-w-[180px] truncate text-[11px] text-[#64748B]"
                        title={subscription.product_id || ''}
                      >
                        {subscription.product_id || 'Product unavailable'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[13px] font-medium text-white">
                        {subscription.expires_at
                          ? new Date(subscription.expires_at).toLocaleDateString()
                          : 'No expiration'}
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">
                        {subscription.auto_renewal_status
                          ? formatStore(subscription.auto_renewal_status)
                          : 'Renewal unavailable'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-[13px] font-medium text-[#94A3B8]">
                        <Store size={18} />
                        <div>
                          <p>{formatStore(subscription.store)}</p>
                          <p
                            className={`text-[9px] font-bold ${
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
                      <div className="space-y-2">
                        <div
                          className={`inline-flex items-center justify-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                            statusClass[subscription.status] ||
                            statusClass.Inactive
                          }`}
                        >
                          {subscription.status}
                        </div>
                        <p className="text-[10px] text-[#64748B]">
                          ${Number(subscription.total_revenue_usd || 0).toFixed(2)}
                          {' lifetime'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onManageAccess(subscription)}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#2563EB]/40 bg-[#2563EB]/10 px-3 py-2 text-xs font-bold text-[#93C5FD] hover:bg-[#2563EB]/20"
                      >
                        <KeyRound size={14} />
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-12 text-center text-[13px] text-[#64748B]"
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

        <div className="mt-auto border-t border-[#1E293B] px-6 py-4">
          <p className="text-[12px] font-bold text-[#64748B]">
            Showing {subscriptions.length} of {total} RevenueCat customers
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionTable;
