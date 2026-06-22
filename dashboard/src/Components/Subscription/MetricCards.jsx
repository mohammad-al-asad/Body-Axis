import React from 'react';
import { Banknote, CalendarCheck, RefreshCcw, Users } from 'lucide-react';

const MetricCards = ({ metrics, loading }) => {
  const formatMetric = (metric, formatter) => {
    if (loading && !metrics) return '—';
    if (!metric?.available || metric.value === null || metric.value === undefined) {
      return 'Not available';
    }
    return formatter(metric.value);
  };

  const cards = [
    {
      title: 'Active Subscribers',
      value: formatMetric(
        metrics?.active_subscribers,
        (value) => Number(value).toLocaleString(),
      ),
      note: 'Production',
      icon: Users,
      iconClass: 'bg-[#1E293B] text-[#94A3B8]',
      hoverClass: 'hover:border-[#1E3A8A]',
    },
    {
      title: 'Monthly Revenue',
      value: formatMetric(metrics?.monthly_revenue_usd, (value) =>
        Number(value).toLocaleString('en-US', {
          style: 'currency',
          currency: 'USD',
        })),
      note: 'Production USD',
      icon: Banknote,
      iconClass: 'bg-[#0D9488]/20 text-[#2DD4BF]',
      hoverClass: 'hover:border-[#0D9488]/50',
    },
    {
      title: 'Yearly Members',
      value: formatMetric(
        metrics?.yearly_members_percent,
        (value) => `${value}%`,
      ),
      note: 'Active plans',
      icon: CalendarCheck,
      iconClass: 'bg-[#0284C7]/20 text-[#38BDF8]',
      hoverClass: 'hover:border-[#0284C7]/50',
    },
    {
      title: 'Renewal Rate',
      value: formatMetric(
        metrics?.renewal_rate_percent,
        (value) => `${value}%`,
      ),
      note: metrics?.renewal_rate_percent?.available
        ? 'Current intent'
        : 'No recurring production data',
      icon: RefreshCcw,
      iconClass: 'bg-[#9F1239]/20 text-[#FB7185]',
      hoverClass: 'hover:border-[#9F1239]/50',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 shadow-sm transition-colors ${card.hoverClass}`}
          >
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}
              >
                <Icon size={20} />
              </div>
              <div className="max-w-[140px] text-right text-[10px] font-bold uppercase tracking-wide text-[#64748B]">
                {card.note}
              </div>
            </div>
            <p className="mb-1 text-[12px] font-bold text-[#94A3B8]">
              {card.title}
            </p>
            <h3
              className={`font-bold text-white ${
                card.value === 'Not available' ? 'mt-2 text-lg' : 'text-[28px]'
              }`}
            >
              {card.value}
            </h3>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;
