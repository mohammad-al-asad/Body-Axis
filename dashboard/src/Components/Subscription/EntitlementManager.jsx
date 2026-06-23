import React, { useMemo, useState } from 'react';
import { KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';

import { adminApi } from '../../services/adminApi';

const defaultExpiration = () => {
  const value = new Date();
  value.setDate(value.getDate() + 30);
  return value.toISOString().slice(0, 10);
};

const EntitlementManager = ({
  customer,
  entitlementOptions,
  onClose,
  onChanged,
}) => {
  const [entitlementId, setEntitlementId] = useState(
    entitlementOptions[0]?.id || '',
  );
  const [expiresOn, setExpiresOn] = useState(defaultExpiration);
  const [workingKey, setWorkingKey] = useState('');
  const [error, setError] = useState('');

  const activeIds = useMemo(
    () => new Set(customer.entitlements.map((item) => item.id)),
    [customer.entitlements],
  );
  const grantableOptions = entitlementOptions.filter(
    (option) => !activeIds.has(option.id),
  );

  const handleGrant = async () => {
    const selectedId = entitlementId || grantableOptions[0]?.id;
    if (!selectedId || !expiresOn) return;
    setWorkingKey('grant');
    setError('');
    try {
      await adminApi.grantEntitlement({
        customer_id: customer.customer_id,
        entitlement_id: selectedId,
        expires_at: new Date(`${expiresOn}T23:59:59`).toISOString(),
      });
      await onChanged('Entitlement granted successfully.');
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingKey('');
    }
  };

  const handleRevoke = async (entitlement) => {
    if (
      !window.confirm(
        `Revoke ${entitlement.display_name} from ${customer.name}?`,
      )
    ) {
      return;
    }
    setWorkingKey(entitlement.id);
    setError('');
    try {
      await adminApi.revokeEntitlement({
        customer_id: customer.customer_id,
        entitlement_id: entitlement.id,
      });
      await onChanged('Promotional entitlement revoked.');
      onClose();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setWorkingKey('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl rounded-3xl border border-[#1E293B]/60 bg-[#131b2f]/95 shadow-2xl backdrop-blur-lg animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-[#26344F]/40 p-6">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[#2DD4BF]">
              <KeyRound size={16} />
              <span className="text-[10px] font-extrabold uppercase tracking-widest">
                RevenueCat Access Control
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{customer.name}</h2>
            <p className="text-xs text-[#94A3B8]">{customer.email}</p>
            <p className="break-all font-mono text-[9px] text-[#475569]">
              ID: {customer.customer_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#64748B] transition-colors hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="max-h-[70vh] overflow-y-auto space-y-6 p-6">
          
          {/* Customer Metadata Grid */}
          <section>
            <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Customer Profile
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Status', customer.status],
                ['Platform', customer.platform || 'Unavailable'],
                ['Country', customer.country || 'Unavailable'],
                [
                  'Lifetime Revenue',
                  `$${Number(customer.total_revenue_usd || 0).toFixed(2)}`,
                ],
                [
                  'First Seen',
                  customer.first_seen_at
                    ? new Date(customer.first_seen_at).toLocaleDateString()
                    : 'Unavailable',
                ],
                [
                  'Last Seen',
                  customer.last_seen_at
                    ? new Date(customer.last_seen_at).toLocaleDateString()
                    : 'Unavailable',
                ],
                ['Store', customer.store || 'Unavailable'],
                [
                  'Pending Payment',
                  customer.pending_payment ? 'Yes' : 'No',
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-[#1e293b]/40 bg-[#07090e]/60 p-3 shadow-inner">
                  <p className="text-[9px] font-extrabold uppercase tracking-wider text-[#64748B]">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Active Entitlements List */}
          <section>
            <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Active Entitlements
            </h3>
            <div className="space-y-2">
              {!customer.entitlements.length && (
                <p className="rounded-xl border border-[#1e293b]/30 bg-[#07090e]/40 p-4 text-xs text-[#64748B] text-center font-medium">
                  This customer has no active entitlement.
                </p>
              )}
              {customer.entitlements.map((entitlement) => (
                <div
                  key={entitlement.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#2DD4BF]/20 bg-[#0a2e26]/10 p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ShieldCheck size={18} className="shrink-0 text-[#34D399]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {entitlement.display_name}
                      </p>
                      <p className="text-[10px] text-[#64748B] mt-0.5 leading-normal">
                        {entitlement.promotional ? 'Promotional grant' : 'App Store / Play Store purchase'}
                        {' · '}
                        {entitlement.expires_at
                          ? `Expires ${new Date(entitlement.expires_at).toLocaleDateString()}`
                          : 'Lifetime access'}
                      </p>
                    </div>
                  </div>
                  {entitlement.promotional && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(entitlement)}
                      disabled={!!workingKey}
                      className="rounded-xl border border-rose-500/20 bg-rose-500/5 px-3 py-1.5 text-xs font-bold text-rose-300 transition-all hover:bg-rose-500/15 disabled:opacity-40"
                    >
                      {workingKey === entitlement.id ? 'Revoking…' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Grant Promotional Section */}
          <section className="border-t border-[#26344F]/40 pt-5">
            <h3 className="mb-4 text-[11px] font-extrabold uppercase tracking-widest text-[#64748b]">
              Grant Promotional Entitlement
            </h3>
            {!entitlementOptions.length ? (
              <p className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-200">
                No RevenueCat entitlements are available. Check your api credentials.
              </p>
            ) : !grantableOptions.length ? (
              <p className="rounded-xl border border-[#1e293b]/30 bg-[#07090e]/40 p-4 text-xs text-[#64748B] text-center font-medium">
                All configured entitlements are already active.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Entitlement Name
                  <select
                    value={
                      grantableOptions.some((option) => option.id === entitlementId)
                        ? entitlementId
                        : grantableOptions[0]?.id || ''
                    }
                    onChange={(event) => setEntitlementId(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-[#1e293b]/60 bg-[#07090e]/60 px-3 text-sm text-white outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  >
                    {grantableOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.display_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-extrabold uppercase tracking-wider text-[#94A3B8]">
                  Expires On
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={expiresOn}
                    onChange={(event) => setExpiresOn(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-[#1e293b]/60 bg-[#07090e]/60 px-3 text-sm text-white outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </label>
              </div>
            )}
          </section>

          {error && (
            <p className="rounded-xl border border-rose-500/25 bg-rose-500/5 p-4 text-xs text-rose-300">
              {error}
            </p>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="flex justify-end gap-3 border-t border-[#26344F]/40 p-6 bg-[#07090e]/20 rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 bg-transparent px-4 py-2.5 text-sm font-bold text-[#94A3B8] transition-colors hover:bg-slate-800/40 hover:text-white"
          >
            Close
          </button>
          {!!grantableOptions.length && (
            <button
              type="button"
              onClick={handleGrant}
              disabled={!!workingKey}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_20px_rgba(37,99,235,0.35)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
            >
              {workingKey === 'grant' && (
                <Loader2 size={14} className="animate-spin" />
              )}
              Grant access
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EntitlementManager;
