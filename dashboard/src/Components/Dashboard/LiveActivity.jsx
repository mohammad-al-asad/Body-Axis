import React from "react";

const relativeTime = (value) => {
  const seconds = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const LiveActivity = ({ users = [], loading = false }) => (
  <div className="mt-8 w-full">
    <div className="mb-6 flex items-center gap-3">
      <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
      <h2 className="text-[18px] font-bold text-white">
        Recent User Registrations
      </h2>
    </div>

    <div className="space-y-4">
      {loading && !users.length ? (
        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 text-center text-sm text-[#64748B]">
          Loading recent users…
        </div>
      ) : users.length ? (
        users.map((user) => (
          <div
            key={user.id}
            className="group flex items-center justify-between rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 transition-colors hover:border-[#334155]"
          >
            <div className="flex min-w-0 items-center gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-[#334155] bg-[#0A0D14]/50 text-sm font-bold text-[#94A3B8] transition-colors group-hover:border-[#475569]">
                {user.name
                  .split(" ")
                  .slice(0, 2)
                  .map((part) => part[0])
                  .join("")
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-[15px] font-bold text-white">
                  {user.name}
                </h4>
                <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                  {user.email}
                </p>
              </div>

              <div className="mx-2 hidden h-6 w-px bg-[#1E293B] sm:block" />

              <p className="hidden text-[14px] font-medium text-[#94A3B8] sm:block">
                Joined using {user.auth_provider}
              </p>
            </div>

            <div className="ml-4 flex shrink-0 flex-col items-end gap-1 text-right">
              <span className="text-[12px] font-medium text-[#94A3B8]">
                {relativeTime(user.created_at)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  user.active ? "text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                {user.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 text-center text-sm text-[#64748B]">
          No registered users yet.
        </div>
      )}
    </div>
  </div>
);

export default LiveActivity;
