import React, { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import EngagementDataDetail from "./EngagementDataDetail";

const toApiDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const rangeFor = (tab) => {
  const end = new Date();
  const start = new Date(end);
  if (tab === "Monthly") start.setMonth(start.getMonth() - 11, 1);
  else if (tab === "Weekly") start.setDate(start.getDate() - 7 * 11);
  else start.setDate(start.getDate() - 13);
  return { start, end };
};

const EngagementVelocity = ({ data, loading, onQueryChange }) => {
  const [activeTab, setActiveTab] = useState("Daily");
  const initialRange = useMemo(() => rangeFor("Daily"), []);
  const [startDate, setStartDate] = useState(initialRange.start);
  const [endDate, setEndDate] = useState(initialRange.end);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    onQueryChange({
      granularity: activeTab.toLowerCase(),
      startDate: toApiDate(startDate),
      endDate: toApiDate(endDate),
    });
  }, [activeTab, endDate, onQueryChange, startDate]);

  const maxRegistrations = Math.max(
    1,
    ...data.map((item) => item.registrations),
  );
  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });

  const changeTab = (tab) => {
    const range = rangeFor(tab);
    setActiveTab(tab);
    setStartDate(range.start);
    setEndDate(range.end);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-3xl border border-[#1E293B] bg-[#131B2F] shadow-lg">
      <div className="flex flex-col justify-between gap-6 p-8 pb-4 lg:flex-row lg:items-start">
        <div>
          <h2 className="mb-1 text-[20px] font-bold text-white">
            User Growth
          </h2>
          <p className="text-[13px] text-[#94A3B8]">
            Registrations and active users from the Body Axis user database
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="flex items-center gap-3 rounded-xl border border-[#1E293B] bg-[#0A0D14]/50 px-4 py-2 text-[12px] font-medium text-[#94A3B8]">
            <div className="relative flex items-center gap-2">
              <CalendarIcon
                size={14}
                className="cursor-pointer text-teal-500"
                onClick={() => {
                  setShowStartCalendar((current) => !current);
                  setShowEndCalendar(false);
                }}
              />
              <span
                className="cursor-pointer"
                onClick={() => {
                  setShowStartCalendar((current) => !current);
                  setShowEndCalendar(false);
                }}
              >
                {formatDate(startDate)}
              </span>
              {showStartCalendar && (
                <div className="absolute left-0 top-full z-[100] mt-3 overflow-hidden rounded-2xl border border-[#1E293B] shadow-2xl">
                  <Calendar
                    onChange={(date) => {
                      setStartDate(date);
                      if (date > endDate) setEndDate(date);
                      setShowStartCalendar(false);
                    }}
                    value={startDate}
                    maxDate={new Date()}
                    className="premium-calendar !border-none !bg-[#131B2F] !text-white"
                  />
                </div>
              )}
            </div>
            <span className="text-[#475569]">to</span>
            <div className="relative flex items-center gap-2">
              <span
                className="cursor-pointer"
                onClick={() => {
                  setShowEndCalendar((current) => !current);
                  setShowStartCalendar(false);
                }}
              >
                {formatDate(endDate)}
              </span>
              <CalendarIcon
                size={14}
                className="cursor-pointer text-[#475569] transition-colors hover:text-gray-300"
                onClick={() => {
                  setShowEndCalendar((current) => !current);
                  setShowStartCalendar(false);
                }}
              />
              {showEndCalendar && (
                <div className="absolute right-0 top-full z-[100] mt-3 overflow-hidden rounded-2xl border border-[#1E293B] shadow-2xl">
                  <Calendar
                    onChange={(date) => {
                      setEndDate(date);
                      if (date < startDate) setStartDate(date);
                      setShowEndCalendar(false);
                    }}
                    value={endDate}
                    maxDate={new Date()}
                    className="premium-calendar !border-none !bg-[#131B2F] !text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-[#1E293B] bg-[#0A0D14]/50 p-1">
            {["Daily", "Weekly", "Monthly"].map((tab) => (
              <button
                key={tab}
                onClick={() => changeTab(tab)}
                className={`rounded-lg px-4 py-1.5 text-[12px] font-bold transition-all ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-[#94A3B8] hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex h-[280px] w-full items-end gap-2 overflow-x-auto px-8 py-6 sm:gap-4 lg:gap-6">
        {loading && !data.length ? (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#64748B]">
            Loading user growth…
          </div>
        ) : data.length ? (
          data.map((item, index) => {
            const height =
              item.registrations === 0
                ? 4
                : Math.max(12, (item.registrations / maxRegistrations) * 100);
            const active = index === data.length - 1;
            return (
              <div
                key={item.period_start}
                className="group flex h-full min-w-[42px] flex-1 flex-col items-center justify-end"
                title={`${item.registrations} registrations · ${item.active_users} active users`}
              >
                <div
                  className={`relative w-full max-w-[48px] rounded-t-sm transition-all duration-500 ${
                    active
                      ? "bg-gradient-to-b from-[#A855F7] to-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                      : "bg-gradient-to-b from-[#4C1D95]/60 to-[#065F46]/60 opacity-70 group-hover:from-[#6D28D9]/80 group-hover:to-[#059669]/80"
                  }`}
                  style={{ height: `${height}%` }}
                />
                <span
                  className={`mt-4 whitespace-nowrap text-[9px] font-bold uppercase tracking-wider ${
                    active ? "text-[#94A3B8]" : "text-[#475569]"
                  }`}
                >
                  {item.label}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[#64748B]">
            No user registrations in this date range.
          </div>
        )}
      </div>

      <div className="px-8 pb-8 pt-4">
        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0A0D14]/30">
          <EngagementDataDetail data={data.slice(-5).reverse()} />
        </div>
      </div>
    </div>
  );
};

export default EngagementVelocity;
