import React, { useState } from 'react';

const RevenueGrowth = ({ data, loading }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  const maxRevenue = Math.max(
    ...data.map((point) => point.revenue_usd),
    0,
  );
  const hasRevenue = maxRevenue > 0;

  return (
    <div className="mb-6 flex flex-col rounded-2xl border border-[#1E293B]/60 bg-[#131b2f]/45 p-6 shadow-sm backdrop-blur-md">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Revenue Growth</h2>
          <p className="text-xs text-[#64748b]">
            {hoveredIndex !== null && data[hoveredIndex] ? (
              <span className="animate-in fade-in duration-200">
                <span className="font-extrabold text-teal-400">{data[hoveredIndex].label}:</span>
                <span className="font-bold text-white ml-1">
                  ${data[hoveredIndex].revenue_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </span>
            ) : (
              'Roll cursor over bars to view monthly revenue details'
            )}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-extrabold text-[#94A3B8] self-start sm:self-center bg-[#1e293b]/60 px-2.5 py-1 rounded-full ring-1 ring-inset ring-slate-800">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2DD4BF] animate-pulse" />
          PRODUCTION USD
        </div>
      </div>

      <div className="relative flex-1 min-h-[220px]">
        {loading && !data.length && (
          <div className="absolute inset-0 flex items-center justify-center text-xs text-[#64748B]">
            Loading RevenueCat revenue…
          </div>
        )}
        {!loading && !hasRevenue && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-xs text-[#64748B]">
            No paid production revenue was received in the last 12 months.
          </div>
        )}

        {/* Dashboard Gridlines */}
        {hasRevenue && (
          <div className="absolute inset-0 flex flex-col justify-between pb-8 pt-2 pointer-events-none opacity-20">
            <div className="border-t border-dashed border-[#64748b]/50 w-full" />
            <div className="border-t border-dashed border-[#64748b]/50 w-full" />
            <div className="border-t border-dashed border-[#64748b]/50 w-full" />
            <div className="border-t border-dashed border-[#64748b]/50 w-full" />
          </div>
        )}

        <div className="relative flex h-[220px] items-end justify-between gap-1.5 px-2 sm:gap-4 z-10">
          {data.map((point, index) => {
            const height = hasRevenue
              ? Math.max(
                  (point.revenue_usd / maxRevenue) * 100,
                  point.revenue_usd ? 8 : 2,
                )
              : 2;
            const isHovered = hoveredIndex === index;
            const isLast = index === data.length - 1;
            
            return (
              <div
                key={point.period_start}
                className="group flex h-[180px] w-full flex-col items-center justify-end cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isLast && point.revenue_usd > 0
                      ? 'bg-gradient-to-t from-[#2DD4BF] via-[#818cf8] to-[#c084fc] shadow-[0_0_20px_rgba(45,212,191,0.4)]'
                      : isHovered
                      ? 'bg-gradient-to-t from-teal-500/80 to-blue-500/80 opacity-100 shadow-[0_0_15px_rgba(45,212,191,0.2)]'
                      : 'bg-gradient-to-t from-slate-700/30 to-violet-600/35 opacity-60'
                  }`}
                  style={{ 
                    height: `${height}%`,
                    transform: isHovered ? 'scaleY(1.03)' : 'scaleY(1)',
                    transformOrigin: 'bottom'
                  }}
                />
                <span className={`mt-2.5 text-[8px] sm:block transition-colors duration-200 ${
                  isHovered ? 'text-white font-bold' : 'text-[#64748B]'
                }`}>
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
