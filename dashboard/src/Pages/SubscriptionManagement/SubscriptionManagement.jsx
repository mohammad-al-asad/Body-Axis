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

const SUBSCRIBERS_PER_PAGE = 10;

const SubscriptionManagement = () => {
  const [filterStatus, setFilterStatus] = useState('All Subs');
  const [filterPlanType, setFilterPlanType] = useState('Plan Type');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

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
  const pageCount = Math.max(
    1,
    Math.ceil(filteredSubscriptions.length / SUBSCRIBERS_PER_PAGE),
  );
  const paginatedSubscriptions = filteredSubscriptions.slice(
    (currentPage - 1) * SUBSCRIBERS_PER_PAGE,
    currentPage * SUBSCRIBERS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterPlanType, subscriptions.length]);

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
    <div className="min-h-screen bg-[#07090e] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f172a] via-[#07090e] to-[#07090e] p-6 sm:p-8 font-sans text-white">
      <div className="mx-auto max-w-[1600px] space-y-8 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center border-b border-[#1e293b]/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-[#cbd5e1] to-[#64748b] bg-clip-text text-transparent">
                Subscription Management
              </h1>
              <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
                Billing Admin
              </span>
            </div>
            <p className="text-sm font-medium text-[#94A3B8]">
              Live customer status and billing events from RevenueCat.
            </p>
            {analytics?.source?.customer_status && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2DD4BF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2DD4BF]"></span>
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#2DD4BF]">
                  Source: {analytics.source.customer_status}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleExportPDF}
            disabled={loading || !filteredSubscriptions.length}
            className="group flex items-center gap-2.5 whitespace-nowrap rounded-full border border-blue-500/30 bg-gradient-to-r from-blue-600/10 via-[#1e293b]/50 to-teal-500/10 px-6 py-3 text-sm font-bold text-white shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-blue-500/30"
          >
            <Download size={15} className="text-blue-400 group-hover:translate-y-[1px] transition-transform duration-200" />
            Export Report
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/5 px-5 py-4 text-sm text-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.05)] animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={loadSubscriptions}
              className="flex items-center gap-2 rounded-lg bg-rose-500/15 px-3 py-1.5 text-xs font-bold text-rose-200 transition-colors hover:bg-rose-500/25 hover:text-white"
            >
              <RefreshCw size={13} className="animate-spin-slow" />
              Retry
            </button>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 px-5 py-4 text-sm text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.05)] animate-in slide-in-from-top-2 duration-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>{success}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <MetricCards metrics={analytics?.metrics} loading={loading} />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sidebar Area */}
          <div className="flex flex-col gap-8 lg:col-span-4">
            <ActivePlans plans={analytics?.plans || []} loading={loading} />
            <RecentActivity
              activities={analytics?.recent_activity || []}
              loading={loading}
            />
          </div>

          {/* Main Area */}
          <div className="flex flex-col gap-8 lg:col-span-8">
            <RevenueGrowth
              data={analytics?.revenue_growth || []}
              loading={loading}
            />
            <SubscriptionTable
              subscriptions={paginatedSubscriptions}
              filteredTotal={filteredSubscriptions.length}
              total={subscriptions.length}
              loading={loading}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterPlanType={filterPlanType}
              setFilterPlanType={setFilterPlanType}
              planOptions={planOptions}
              onManageAccess={setSelectedCustomer}
              currentPage={currentPage}
              pageCount={pageCount}
              onPageChange={setCurrentPage}
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

