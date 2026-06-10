import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Activity,
  Dumbbell,
  Video,
  Users,
  CreditCard,
  LineChart,
  Settings,
  PanelLeftClose
} from "lucide-react";
import adminlogo from "../../assets/image/Body-Axis.png";

const Sidebar = ({ closeDrawer }) => {
  const location = useLocation();

  const menuItems = [
    { icon: <LayoutGrid size={22} />, label: "Dashboard", Link: "/" },
    { icon: <Activity size={22} />, label: "Protocol Manager", Link: "/protocol-manager" },
    { icon: <Dumbbell size={22} />, label: "Exercise Library", Link: "/exercise-library" },
    { icon: <Video size={22} />, label: "Video Manager", Link: "/video-manager" },
    { icon: <Users size={22} />, label: "Users Management", Link: "/user-management" },
    { icon: <CreditCard size={22} />, label: "Subscription", Link: "/subscription" },
    { icon: <Settings size={22} />, label: "Settings", Link: "/settings" },
  ];

  return (
    <div className="w-72 bg-[#0A0D14] h-screen flex flex-col shadow-2xl">
      {/* Sidebar Header */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={adminlogo} alt="Body-Axis" className="w-32 h-auto" />
        </div>
      </div>

      {/* Colored Line Under Logo */}
      <div className="h-[1px] w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-blue-500/10"></div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.Link ||
            (item.Link !== '/' && location.pathname.startsWith(item.Link));

          return (
            <Link
              key={item.label}
              to={item.Link}
              onClick={closeDrawer}
              className={`flex items-center gap-4 px-5 py-3.5 mr-1.5 rounded-[18px] transition-all duration-300 group ${isActive
                ? "bg-[#1E2E50] text-[#2563EB] shadow-[4px_0_0_0_#2563EB]"
                : "text-[#94A3B8] hover:text-white hover:bg-white/5"
                }`}
            >
              <span className={`${isActive ? "text-[#2563EB]" : "text-[#94A3B8] group-hover:text-white"} transition-colors`}>
                {item.icon}
              </span>
              <span className="text-[15px] font-medium tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;

