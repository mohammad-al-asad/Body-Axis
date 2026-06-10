import React from 'react';
import { CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'success',
      title: 'Payment Successful',
      desc: 'Elena G. • $249.00',
      icon: <CheckCircle2 size={16} className="text-[#34D399]" />
    },
    {
      id: 2,
      type: 'renewed',
      title: 'Plan Renewed',
      desc: 'David K. • Monthly Elite',
      icon: <RefreshCw size={16} className="text-[#60A5FA]" />
    },
    {
      id: 3,
      type: 'failed',
      title: 'Failed Attempt',
      desc: 'Sarah M. • Expired Card',
      icon: <AlertCircle size={16} className="text-[#FB7185]" />
    }
  ];

  return (
    <div className="bg-[#131B2F] rounded-2xl p-6 border border-[#1E293B] shadow-sm">
      <h3 className="text-white text-[15px] font-bold mb-6">Recent Activity</h3>

      <div className="flex flex-col gap-6">
        {activities.map(activity => (
          <div key={activity.id} className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${activity.type === 'success' ? 'bg-[#112730]' :
              activity.type === 'renewed' ? 'bg-[#1c223c]' :
                'bg-[#271b2a]'
              }`}>
              {activity.icon}
            </div>
            <div>
              <p className="text-white text-[13px] font-bold mb-0.5">{activity.title}</p>
              <p className="text-[#64748B] text-[11px] font-medium">{activity.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
