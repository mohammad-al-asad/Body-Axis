import React from "react";

const EngagementDataDetail = ({ data = [], className = "" }) => (
  <div className={`w-full ${className}`}>
    <div className="border-b border-[#1E293B] px-6 py-4">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-300">
        User Growth Detail
      </h3>
    </div>

    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-[#1E293B]">
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Period
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Registrations
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Active Users
            </th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Intake Completed
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E293B]">
          {data.length ? (
            data.map((row) => (
              <tr
                key={row.period_start}
                className="transition-colors hover:bg-[#1E293B]/30"
              >
                <td className="px-6 py-4 text-[13px] font-medium text-[#94A3B8]">
                  {row.label}
                </td>
                <td className="px-6 py-4 text-[14px] font-bold text-white">
                  {row.registrations}
                </td>
                <td className="px-6 py-4 text-[13px] font-medium text-[#94A3B8]">
                  {row.active_users}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="h-1.5 max-w-[120px] flex-1 overflow-hidden rounded-full bg-[#1E293B]">
                      <div
                        className="h-full rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                        style={{
                          width: `${row.intake_completion_percent}%`,
                        }}
                      />
                    </div>
                    <span className="text-[13px] font-bold text-[#10B981]">
                      {row.intake_completion_percent}%
                    </span>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                className="px-6 py-10 text-center text-sm text-[#64748B]"
              >
                No user data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default EngagementDataDetail;
