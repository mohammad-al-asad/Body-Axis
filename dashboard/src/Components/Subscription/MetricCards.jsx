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
      iconClass: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
      hoverClass: 'hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      glowColor: 'bg-blue-500/5',
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
      iconClass: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
      hoverClass: 'hover:border-teal-500/40 hover:shadow-[0_0_30px_rgba(45,212,191,0.15)]',
      glowColor: 'bg-teal-500/5',
    },
    {
      title: 'Yearly Members',
      value: formatMetric(
        metrics?.yearly_members_percent,
        (value) => `${value}%`,
      ),
      note: 'Active plans',
      icon: CalendarCheck,
      iconClass: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
      hoverClass: 'hover:border-sky-500/40 hover:shadow-[0_0_30px_rgba(56,189,248,0.15)]',
      glowColor: 'bg-sky-500/5',
    },
    {
      title: 'Renewal Rate',
      value: formatMetric(
        metrics?.renewal_rate_percent,
        (value) => `${value}%`,
      ),
      note: metrics?.renewal_rate_percent?.available
        ? metrics?.renewal_rate_percent?.note || 'Current intent'
        : 'No recurring production data',
      icon: RefreshCcw,
      iconClass: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      hoverClass: 'hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(251,113,133,0.15)]',
      glowColor: 'bg-rose-500/5',
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`group relative overflow-hidden rounded-2xl border border-[#1E293B]/60 bg-[#131b2f]/45 p-6 shadow-sm backdrop-blur-md transition-all duration-300 ${card.hoverClass} hover:-translate-y-1`}
          >
            {/* Glowing Corner Background Blobs */}
            <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full blur-[30px] transition-all duration-300 group-hover:scale-150 ${card.glowColor}`} />
            
            <div className="mb-6 flex items-start justify-between">
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 ${card.iconClass}`}
              >
                <Icon size={20} />
              </div>
              <span className="rounded-full bg-[#1e293b]/60 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#94a3b8] ring-1 ring-inset ring-slate-800">
                {card.note}
              </span>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-widest text-[#64748b] mb-1">
              {card.title}
            </p>
            
            <h3
              className={`font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-[#cbd5e1] bg-clip-text text-transparent ${
                card.value === 'Not available' ? 'mt-2 text-lg' : 'text-3xl'
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
