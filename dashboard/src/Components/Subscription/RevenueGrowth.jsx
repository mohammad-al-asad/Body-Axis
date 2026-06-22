import React from 'react';

const RevenueGrowth = ({ data, loading }) => {
  const maxRevenue = Math.max(
    ...data.map((point) => point.revenue_usd),
    0,
  );
  const hasRevenue = maxRevenue > 0;

  return (
    <div className="mb-6 flex flex-col rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 shadow-sm">
      <div className="mb-10 flex items-center justify-between">
        <h2 className="text-xl font-medium text-white">Revenue Growth</h2>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#94A3B8]">
          <div className="h-2 w-2 rounded-full bg-[#2DD4BF]" />
          PRODUCTION USD
        </div>
      </div>

      <div className="relative flex-1">
        {loading && !data.length && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-[#64748B]">
            Loading RevenueCat revenue…
          </div>
        )}
        {!loading && !hasRevenue && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-[#64748B]">
            No paid production revenue was received in the last 12 months.
          </div>
        )}
        <div className="flex h-[220px] items-end justify-between gap-2 px-2 sm:gap-4">
          {data.map((point, index) => {
            const height = hasRevenue
              ? Math.max(
                  (point.revenue_usd / maxRevenue) * 100,
                  point.revenue_usd ? 8 : 2,
                )
              : 2;
            return (
              <div
                key={point.period_start}
                className="group flex h-[180px] w-full flex-col items-center justify-end"
              >
                <div
                  title={`${point.label}: $${point.revenue_usd.toFixed(2)}`}
                  className={`w-full rounded-sm transition-all duration-300 ${
                    index === data.length - 1 && point.revenue_usd > 0
                      ? 'bg-gradient-to-t from-[#2DD4BF] via-[#C084FC] to-[#FDF4FF] shadow-[0_0_30px_rgba(232,121,249,0.5)]'
                      : 'bg-gradient-to-t from-[#164E63] to-[#5B21B6] opacity-70 group-hover:opacity-100'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span className="mt-2 hidden text-[8px] text-[#64748B] sm:block">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RevenueGrowth;
