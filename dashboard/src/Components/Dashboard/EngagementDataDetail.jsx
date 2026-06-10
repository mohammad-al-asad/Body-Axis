import React from 'react';

const data = [
  { date: '14 Oct 2024', totalSessions: 152, activeSessions: 128, completion: 94 },
  { date: '13 Oct 2024', totalSessions: 114, activeSessions: 98, completion: 88 },
  { date: '12 Oct 2024', totalSessions: 108, activeSessions: 84, completion: 82 },
];

const EngagementDataDetail = ({ className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      {/* Title */}
      <div className="px-6 py-4 border-b border-[#1E293B]">
        <h3 className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">
          Engagement Data Detail
        </h3>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#1E293B]">
              <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Total Sessions</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Active Sessions</th>
              <th className="px-6 py-4 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">Avg. Completion %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-[#1E293B]/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[13px] font-medium text-[#94A3B8]">{row.date}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[14px] font-bold text-white">{row.totalSessions}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[13px] font-medium text-[#94A3B8]">{row.activeSessions}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-1.5 bg-[#1E293B] rounded-full overflow-hidden max-w-[120px]">
                      <div
                        className="h-full bg-[#10B981] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{ width: `${row.completion}%` }}
                      ></div>
                    </div>
                    <span className="text-[13px] font-bold text-[#10B981]">{row.completion}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EngagementDataDetail;
