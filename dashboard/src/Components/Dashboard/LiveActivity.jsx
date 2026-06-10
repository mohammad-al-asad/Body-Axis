import React from 'react';

const activities = [
  {
    id: 1,
    name: 'Elena Rossi',
    type: 'NEW SUBSCRIPTION',
    action: 'Joined Pro Membership Plan',
    time: '2 minutes ago',
    badge: 'LONDON, UK',
    badgeColor: 'text-[#10B981]'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    type: 'ACTIVITY LOG',
    action: 'Completed "The Lumbar Deep Reset" Protocol',
    time: '15 minutes ago',
    badge: 'LEVEL UP',
    badgeColor: 'text-[#10B981]'
  }
];

const LiveActivity = () => {
  return (
    <div className="w-full mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2.5 h-2.5 bg-[#10B981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
        <h2 className="text-[18px] font-bold text-white">Live Activity</h2>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-center justify-between p-6 bg-[#131B2F] border border-[#1E293B] rounded-2xl hover:border-[#334155] transition-colors group"
          >
            <div className="flex items-center gap-6">
              {/* Avatar Placeholder */}
              <div className="w-12 h-12 rounded-full border border-[#334155] bg-[#0A0D14]/50 flex items-center justify-center relative overflow-hidden group-hover:border-[#475569] transition-colors">
                {/* Image would go here */}
              </div>

              <div>
                <h4 className="text-[15px] font-bold text-white">{activity.name}</h4>
                <p className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider mt-0.5">{activity.type}</p>
              </div>

              <div className="h-6 w-[1px] bg-[#1E293B] mx-2 hidden sm:block"></div>

              <p className="text-[14px] font-medium text-[#94A3B8] hidden sm:block">
                {activity.action}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 text-right">
              <span className="text-[12px] font-medium text-[#94A3B8]">{activity.time}</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${activity.badgeColor}`}>
                {activity.badge}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveActivity;
