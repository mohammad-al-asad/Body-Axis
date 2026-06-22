import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Activity,
  Dumbbell,
  Video,
  Users,
  CreditCard,
  Settings,
} from "lucide-react";
import adminlogo from "../../assets/image/Body-Axis.png";

const Sidebar = ({ closeDrawer }) => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutGrid size={22} />, label: "Dashboard", Link: "/" },
    {
      icon: <Activity size={22} />,
      label: "Plan Manager",
      Link: "/plan-manager",
    },
    {
      icon: <Dumbbell size={22} />,
      label: "Exercise Management",
      Link: "/exercise-library",
    },
    {
      icon: <Video size={22} />,
      label: "Video Manager",
      Link: "/video-manager",
    },
    {
      icon: <Users size={22} />,
      label: "Users Management",
      Link: "/user-management",
    },
    {
      icon: <CreditCard size={22} />,
      label: "Subscription",
      Link: "/subscription",
    },
    { icon: <Settings size={22} />, label: "Settings", Link: "/settings" },
  ];

  return (
    <div className="flex h-screen w-72 flex-col bg-[#0A0D14] shadow-2xl">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img src={adminlogo} alt="Body-Axis" className="h-auto w-32" />
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-blue-500/10" />

      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-5 py-6">
        {menuItems.map((item) => {
          const isActive =
            location.pathname === item.Link ||
            (item.Link !== "/" && location.pathname.startsWith(item.Link));

          return (
            <Link
              key={item.label}
              to={item.Link}
              onClick={closeDrawer}
              className={`group mr-1.5 flex items-center gap-4 rounded-[18px] px-5 py-3.5 transition-all duration-300 ${
                isActive
                  ? "bg-[#1E2E50] text-[#2563EB] shadow-[4px_0_0_0_#2563EB]"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <span
                className={`transition-colors ${
                  isActive
                    ? "text-[#2563EB]"
                    : "text-[#94A3B8] group-hover:text-white"
                }`}
              >
                {item.icon}
              </span>
              <span className="text-[15px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
