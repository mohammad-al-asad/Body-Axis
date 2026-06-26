import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell, Menu, UserPlus, MessageSquare, HelpCircle } from "lucide-react";
import adminImage from "../../assets/image/adminkickclick.jpg";
import { getStoredAdmin, adminApi } from "../../services/adminApi";

const formatShortTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const getNotificationIconMini = (type) => {
  switch (type) {
    case "user_signup":
      return (
        <div className="bg-[#1E293B] p-2.5 rounded-xl text-blue-400 border border-blue-500/10">
          <UserPlus size={18} />
        </div>
      );
    case "support_message":
      return (
        <div className="bg-[#1E293B] p-2.5 rounded-xl text-purple-400 border border-purple-500/10">
          <MessageSquare size={18} />
        </div>
      );
    case "profile_report":
      return (
        <div className="bg-[#1E293B] p-2.5 rounded-xl text-emerald-400 border border-emerald-500/10">
          <HelpCircle size={18} />
        </div>
      );
    default:
      return (
        <div className="bg-[#1E293B] p-2.5 rounded-xl text-amber-400 border border-amber-500/10">
          <Bell size={18} />
        </div>
      );
  }
};

const Header = ({ showDrawer }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const storedAdmin = getStoredAdmin();
  const [adminName, setAdminName] = useState(
    storedAdmin?.name || "Body Axis Admin",
  );
  const [adminAvatar, setAdminAvatar] = useState(storedAdmin?.avatar_url || null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await adminApi.getNotifications();
        setNotifications(res.notifications || []);
        setNotificationsCount(res.unread_count || 0);
      } catch (err) {
        console.error("Failed to fetch notifications in Header:", err);
      }
    };

    fetchNotifications();

    // Listen to updates from other pages
    const handleUpdate = (event) => {
      if (event.detail?.notifications) {
        setNotifications(event.detail.notifications);
        setNotificationsCount(event.detail.unreadCount || 0);
      }
    };

    // Listen to admin update
    const updateAdminName = (event) => {
      if (event.detail?.name) setAdminName(event.detail.name);
      setAdminAvatar(event.detail?.avatar_url || null);
    };

    window.addEventListener("notifications-updated", handleUpdate);
    window.addEventListener("admin-profile-updated", updateAdminName);
    
    return () => {
      window.removeEventListener("notifications-updated", handleUpdate);
      window.removeEventListener("admin-profile-updated", updateAdminName);
    };
  }, []);

  return (
    <div className="relative bg-[#0A0D14] h-[88px] flex items-center justify-between px-8 shadow-sm">
      <button
        onClick={showDrawer}
        className="rounded-lg p-2 text-[#94A3B8] hover:bg-[#1E293B] hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={22} />
      </button>

      {/* Right Side */}
      <div className="ml-auto flex items-center gap-8">
        {/* Notifications */}
        <button
          className="relative text-[#94A3B8] hover:text-white transition-colors"
          onClick={() => setShowNotifications((prev) => !prev)}
        >
          <Bell size={22} />
          {notificationsCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 h-2 w-2 rounded-full border border-[#0A0D14] animate-pulse"></span>
          )}
        </button>

        {/* Divider */}
        <div className="h-8 w-[1px] bg-[#1E293B]"></div>

        {/* User Profile */}
        <div className="flex items-center gap-4 cursor-pointer group">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[14px] font-bold text-white group-hover:text-gray-200 transition-colors">{adminName}</span>
            <span className="text-[10px] font-bold text-[#94A3B8] tracking-wider uppercase">ADMIN</span>
          </div>
          <div className="w-11 h-11 rounded-full border border-gray-600 overflow-hidden shadow-lg p-0.5">
            <img src={adminAvatar || adminImage} alt="User" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </div>

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="absolute right-8 top-[80px] z-[60] p-6 bg-[#131B2F] rounded-2xl shadow-2xl border border-[#1E293B] w-80 animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#1E293B]">
            <h2 className="text-lg font-bold text-white">Notifications</h2>
            {notificationsCount > 0 && (
              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                {notificationsCount} NEW
              </span>
            )}
          </div>
          <div className="space-y-6 max-h-72 overflow-y-auto no-scrollbar">
            {notifications.length === 0 ? (
              <p className="text-center text-xs text-[#94A3B8] py-4">No notifications yet</p>
            ) : (
              notifications.slice(0, 4).map((item, index) => (
                <div key={item.id || index} className="flex items-start gap-4">
                  {getNotificationIconMini(item.type)}
                  <div className="space-y-1">
                    <p className={`text-[13px] leading-tight font-medium ${!item.is_read ? 'text-white font-bold' : 'text-gray-400'}`}>
                      {item.message}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] font-medium">{formatShortTime(item.time)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link 
            to="/notifications" 
            onClick={() => setShowNotifications(false)}
            className="block text-center mt-6 w-full bg-blue-600 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-black/10"
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
};

export default Header;
