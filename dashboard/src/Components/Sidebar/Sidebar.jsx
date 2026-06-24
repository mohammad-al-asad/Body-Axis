import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Activity,
  Dumbbell,
  Video,
  Users,
  CreditCard,
  Settings,
  ShieldCheck,
  FileText,
  Info,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  User,
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
  ];

  const settingsSubItems = [
    { icon: <User size={18} />, label: "Edit Profile", Link: "/settings" },
    { icon: <HelpCircle size={18} />, label: "FAQ", Link: "/faq" },
    { icon: <MessageSquare size={18} />, label: "Support", Link: "/support-messages" },
    { icon: <Info size={18} />, label: "About App", Link: "/about-app" },
    { icon: <FileText size={18} />, label: "Terms & Conditions", Link: "/terms-and-conditions" },
    { icon: <ShieldCheck size={18} />, label: "Privacy Policy", Link: "/privacy-policy" },
  ];

  // Check if current route is a settings sub-item path (including add-faq or edit-faq paths)
  const isSettingsActive = [
    "/settings",
    "/faq",
    "/add-faq",
    "/support-messages",
    "/about-app",
    "/terms-and-conditions",
    "/privacy-policy",
  ].some((path) => 
    location.pathname === path || 
    (path !== "/" && location.pathname.startsWith(path))
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsActive);

  // Auto-expand Settings menu when navigate to any settings sub-path
  useEffect(() => {
    if (isSettingsActive) {
      setIsSettingsOpen(true);
    }
  }, [location.pathname, isSettingsActive]);

  return (
    <div className="flex h-screen w-72 flex-col bg-[#0A0D14] shadow-2xl">
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <img src={adminlogo} alt="Body-Axis" className="h-auto w-32" />
        </div>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-blue-500/10" />

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-5 py-6">
        {/* Main Menu Items */}
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

        {/* Collapsible Settings Menu Item */}
        <div className="mr-1.5">
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`group flex w-full items-center justify-between rounded-[18px] px-5 py-3.5 transition-all duration-300 ${
              isSettingsActive
                ? "bg-[#1E2E50] text-[#2563EB] shadow-[4px_0_0_0_#2563EB]"
                : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <span
                className={`transition-colors ${
                  isSettingsActive
                    ? "text-[#2563EB]"
                    : "text-[#94A3B8] group-hover:text-white"
                }`}
              >
                <Settings size={22} />
              </span>
              <span className="text-[15px] font-medium tracking-wide">
                Settings
              </span>
            </div>
            <span
              className={`text-[#94A3B8] transition-transform duration-300 group-hover:text-white ${
                isSettingsOpen ? "rotate-180 text-[#2563EB]" : ""
              }`}
            >
              <ChevronDown size={18} />
            </span>
          </button>

          {/* Sub-menu Items */}
          {isSettingsOpen && (
            <div className="mt-2 ml-6 space-y-1.5 border-l border-[#1E293B] pl-4 animate-in slide-in-from-top-2 duration-200">
              {settingsSubItems.map((subItem) => {
                const isSubActive =
                  location.pathname === subItem.Link ||
                  (subItem.Link !== "/" && location.pathname.startsWith(subItem.Link));

                return (
                  <Link
                    key={subItem.label}
                    to={subItem.Link}
                    onClick={closeDrawer}
                    className={`flex items-center gap-3.5 rounded-[12px] px-4 py-2.5 transition-all duration-300 ${
                      isSubActive
                        ? "bg-[#1E2E50]/60 text-white font-semibold"
                        : "text-[#64748B] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span
                      className={`transition-colors ${
                        isSubActive ? "text-[#2DD4BF]" : "text-[#64748B]"
                      }`}
                    >
                      {subItem.icon}
                    </span>
                    <span className="text-[13.5px] tracking-wide">
                      {subItem.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
