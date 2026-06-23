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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-[#26344F] bg-[#131B2F] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#26344F] p-6">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[#2DD4BF]">
              <KeyRound size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">
                RevenueCat access
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">{customer.name}</h2>
            <p className="mt-1 text-xs text-[#94A3B8]">{customer.email}</p>
            <p className="mt-1 break-all text-[10px] text-[#475569]">
              {customer.customer_id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#64748B] hover:bg-white/5 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <section>
            <h3 className="mb-3 text-sm font-bold text-white">
              Customer information
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ['Status', customer.status],
                ['Platform', customer.platform || 'Unavailable'],
                ['Country', customer.country || 'Unavailable'],
                [
                  'Lifetime revenue',
                  `$${Number(customer.total_revenue_usd || 0).toFixed(2)}`,
                ],
                [
                  'First seen',
                  customer.first_seen_at
                    ? new Date(customer.first_seen_at).toLocaleDateString()
                    : 'Unavailable',
                ],
                [
                  'Last seen',
                  customer.last_seen_at
                    ? new Date(customer.last_seen_at).toLocaleDateString()
                    : 'Unavailable',
                ],
                ['Store', customer.store || 'Unavailable'],
                [
                  'Pending payment',
                  customer.pending_payment ? 'Yes' : 'No',
                ],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-[#0A0D14] p-3">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-[#64748B]">
                    {label}
                  </p>
                  <p className="mt-1 truncate text-xs font-bold text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-white">
              Active entitlements
            </h3>
            <div className="space-y-2">
              {!customer.entitlements.length && (
                <p className="rounded-xl bg-[#0A0D14] p-4 text-xs text-[#64748B]">
                  This customer has no active entitlement.
                </p>
              )}
              {customer.entitlements.map((entitlement) => (
                <div
                  key={entitlement.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#26344F] bg-[#0A0D14] p-4"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <ShieldCheck size={18} className="shrink-0 text-[#34D399]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">
                        {entitlement.display_name}
                      </p>
                      <p className="text-[10px] text-[#64748B]">
                        {entitlement.promotional ? 'Promotional' : 'Store purchase'}
                        {' · '}
                        {entitlement.expires_at
                          ? `Expires ${new Date(entitlement.expires_at).toLocaleDateString()}`
                          : 'No expiration'}
                      </p>
                    </div>
                  </div>
                  {entitlement.promotional && (
                    <button
                      type="button"
                      onClick={() => handleRevoke(entitlement)}
                      disabled={!!workingKey}
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      {workingKey === entitlement.id ? 'Revoking…' : 'Revoke'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-white">
              Grant promotional entitlement
            </h3>
            {!entitlementOptions.length ? (
              <p className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-xs text-amber-200">
                No RevenueCat entitlements are available. Check the V2 key’s
                entitlement read permission.
              </p>
            ) : !grantableOptions.length ? (
              <p className="rounded-xl bg-[#0A0D14] p-4 text-xs text-[#64748B]">
                All configured entitlements are already active.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-bold text-[#94A3B8]">
                  Entitlement
                  <select
                    value={
                      grantableOptions.some((option) => option.id === entitlementId)
                        ? entitlementId
                        : grantableOptions[0]?.id || ''
                    }
                    onChange={(event) => setEntitlementId(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-[#26344F] bg-[#0A0D14] px-3 text-sm text-white outline-none focus:border-[#2DD4BF]"
                  >
                    {grantableOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.display_name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-[#94A3B8]">
                  Expires on
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={expiresOn}
                    onChange={(event) => setExpiresOn(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-[#26344F] bg-[#0A0D14] px-3 text-sm text-white outline-none focus:border-[#2DD4BF]"
                  />
                </label>
              </div>
            )}
          </section>

          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-[#26344F] p-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#26344F] px-4 py-2.5 text-sm font-bold text-[#94A3B8] hover:text-white"
          >
            Close
          </button>
          {!!grantableOptions.length && (
            <button
              type="button"
              onClick={handleGrant}
              disabled={!!workingKey}
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#3B82F6] disabled:opacity-50"
            >
              {workingKey === 'grant' && (
                <Loader2 size={15} className="animate-spin" />
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
