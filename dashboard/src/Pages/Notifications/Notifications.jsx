import React, { useEffect, useState } from "react";
import { 
  Bell, 
  UserPlus, 
  MessageSquare, 
  Trash2, 
  CheckCheck, 
  HelpCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { adminApi } from "../../services/adminApi";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })} at ${date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "user_signup":
      return (
        <div className="bg-[#1E293B] border border-blue-500/20 p-3 rounded-xl text-blue-400">
          <UserPlus size={20} />
        </div>
      );
    case "support_message":
      return (
        <div className="bg-[#1E293B] border border-purple-500/20 p-3 rounded-xl text-purple-400">
          <MessageSquare size={20} />
        </div>
      );
    case "profile_report":
      return (
        <div className="bg-[#1E293B] border border-emerald-500/20 p-3 rounded-xl text-emerald-400">
          <HelpCircle size={20} />
        </div>
      );
    default:
      return (
        <div className="bg-[#1E293B] border border-amber-500/20 p-3 rounded-xl text-amber-400">
          <Bell size={20} />
        </div>
      );
  }
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminApi.getNotifications();
      setNotifications(res.notifications || []);
      // Custom event to update header notifications count
      window.dispatchEvent(
        new CustomEvent("notifications-updated", {
          detail: { 
            notifications: res.notifications || [],
            unreadCount: res.unread_count || 0 
          }
        })
      );
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, is_read: true } : item))
      );
      // Dispatch update to header
      const updatedList = notifications.map((item) => 
        item.id === id ? { ...item, is_read: true } : item
      );
      window.dispatchEvent(
        new CustomEvent("notifications-updated", {
          detail: { 
            notifications: updatedList,
            unreadCount: Math.max(0, updatedList.filter(n => !n.is_read).length)
          }
        })
      );
    } catch (err) {
      setError(err.message || "Failed to mark notification as read.");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
      window.dispatchEvent(
        new CustomEvent("notifications-updated", {
          detail: { 
            notifications: notifications.map((item) => ({ ...item, is_read: true })),
            unreadCount: 0
          }
        })
      );
    } catch (err) {
      setError(err.message || "Failed to mark all notifications as read.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteNotification(id);
      const updatedList = notifications.filter((item) => item.id !== id);
      setNotifications(updatedList);
      window.dispatchEvent(
        new CustomEvent("notifications-updated", {
          detail: { 
            notifications: updatedList,
            unreadCount: updatedList.filter(n => !n.is_read).length
          }
        })
      );
    } catch (err) {
      setError(err.message || "Failed to delete notification.");
    }
  };

  const filteredNotifications = notifications.filter((item) => {
    if (filter === "unread") return !item.is_read;
    if (filter === "read") return item.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1000px]">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Notifications</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Manage and view all activity logs and notifications for the system.
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10"
            >
              <CheckCheck size={16} />
              Mark All as Read
            </button>
          )}
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 border-b border-[#1E293B] pb-px">
          {["all", "unread", "read"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`pb-4 px-4 text-sm font-medium border-b-2 capitalize transition-all ${
                filter === tab
                  ? "border-blue-500 text-blue-500"
                  : "border-transparent text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab} {tab === "unread" && unreadCount > 0 && `(${unreadCount})`}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex h-64 items-center justify-between justify-center rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 text-center text-gray-400">
            <div className="mx-auto flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <p className="text-sm">Loading notifications...</p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8 text-center text-[#94A3B8]">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-[#1E293B] p-4 rounded-full text-gray-500 mb-2">
                <Bell size={32} />
              </div>
              <h3 className="text-base font-bold text-white">No notifications</h3>
              <p className="text-xs">There are no {filter !== "all" ? filter : ""} notifications at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`group flex items-start justify-between gap-4 rounded-2xl border p-5 transition-all ${
                  !item.is_read
                    ? "border-blue-500/20 bg-[#15203A] hover:bg-[#1A284A]"
                    : "border-[#1E293B] bg-[#131B2F] hover:bg-[#17223B]"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  {getNotificationIcon(item.type)}
                  <div className="space-y-1.5 flex-1">
                    <p className="text-[14px] font-medium text-gray-200 leading-tight">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDateTime(item.time)}
                      </span>
                      {!item.is_read && (
                        <span className="flex items-center gap-1 text-blue-400 font-medium">
                          <CheckCircle2 size={12} />
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  {!item.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="p-2 rounded-lg bg-[#1E293B] hover:bg-blue-600 text-[#94A3B8] hover:text-white transition-colors"
                      title="Mark as Read"
                    >
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-lg bg-[#1E293B] hover:bg-red-600/35 text-[#94A3B8] hover:text-red-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
