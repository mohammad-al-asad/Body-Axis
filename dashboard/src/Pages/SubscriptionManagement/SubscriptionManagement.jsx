import React, { useEffect, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

import ActivePlans from '../../Components/Subscription/ActivePlans';
import EntitlementManager from '../../Components/Subscription/EntitlementManager';
import MetricCards from '../../Components/Subscription/MetricCards';
import RecentActivity from '../../Components/Subscription/RecentActivity';
import RevenueGrowth from '../../Components/Subscription/RevenueGrowth';
import SubscriptionTable from '../../Components/Subscription/SubscriptionTable';
import { adminApi } from '../../services/adminApi';

const SubscriptionManagement = () => {
  const [filterStatus, setFilterStatus] = useState('All Subs');
  const [filterPlanType, setFilterPlanType] = useState('Plan Type');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const loadSubscriptions = async () => {
    setLoading(true);
    setError('');
    try {
      setAnalytics(await adminApi.getSubscriptions());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEntitlementChanged = async (message) => {
    setSuccess(message);
    await loadSubscriptions();
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const subscriptions = analytics?.subscriptions || [];
  const planOptions = [
    ...new Set(
      subscriptions
        .map((subscription) => subscription.plan_name)
        .filter(Boolean),
    ),
  ];
  const filteredSubscriptions = subscriptions.filter((subscription) => {
    const statusMatches =
      filterStatus === 'All Subs' ||
      subscription.status.toLowerCase() === filterStatus.toLowerCase();
    const planMatches =
      filterPlanType === 'Plan Type' ||
      subscription.plan_name === filterPlanType;
    return statusMatches && planMatches;
  });

  const handleExportPDF = () => {
    if (!filteredSubscriptions.length) {
      alert('No RevenueCat subscription data to export.');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('RevenueCat Subscription Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    const columns = [
      'User',
      'Email',
      'Product',
      'Expiration',
      'Store',
      'Environment',
      'Status',
      'Lifetime Revenue',
      'Entitlements',
    ];
    const rows = filteredSubscriptions.map((subscription) => [
      subscription.name,
      subscription.email,
      subscription.product_id || 'Unavailable',
      subscription.expires_at
        ? new Date(subscription.expires_at).toLocaleDateString()
        : 'No expiration',
      subscription.store || 'Unavailable',
      subscription.environment || 'Unavailable',
      subscription.status,
      `$${Number(subscription.total_revenue_usd || 0).toFixed(2)}`,
      subscription.entitlements
        .map((entitlement) => entitlement.display_name)
        .join(', ') || 'None',
    ]);

    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });
    doc.save(`revenuecat_subscriptions_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 font-sans text-white">
      <div className="mx-auto max-w-[1600px] animate-in fade-in duration-500">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-1 text-[28px] font-bold tracking-tight">
              Subscription Management
            </h1>
            <p className="text-[13px] font-medium text-[#94A3B8]">
              Live customer status and billing events from RevenueCat.
            </p>
            {analytics?.source?.customer_status && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                Source: {analytics.source.customer_status}
              </p>
            )}
          </div>
          <button
            onClick={handleExportPDF}
            disabled={loading || !filteredSubscriptions.length}
            className="flex items-center gap-2 whitespace-nowrap rounded-full border border-[#1E293B] bg-[#131B2F] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            Export Report
          </button>
        </div>

        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            <button
              type="button"
              onClick={loadSubscriptions}
              className="flex items-center gap-2 font-bold text-red-200 hover:text-white"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <MetricCards metrics={analytics?.metrics} loading={loading} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-4">
            <ActivePlans plans={analytics?.plans || []} loading={loading} />
            <RecentActivity
              activities={analytics?.recent_activity || []}
              loading={loading}
            />
          </div>

          <div className="flex h-full flex-col lg:col-span-8">
            <RevenueGrowth
              data={analytics?.revenue_growth || []}
              loading={loading}
            />
            <SubscriptionTable
              subscriptions={filteredSubscriptions}
              total={subscriptions.length}
              loading={loading}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPlanType={filterPlanType}
              setFilterPlanType={setFilterPlanType}
              planOptions={planOptions}
              onManageAccess={setSelectedCustomer}
            />
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <EntitlementManager
          customer={selectedCustomer}
          entitlementOptions={analytics?.entitlements || []}
          onClose={() => setSelectedCustomer(null)}
          onChanged={handleEntitlementChanged}
        />
      )}
    </div>
  );
};

export default SubscriptionManagement;
