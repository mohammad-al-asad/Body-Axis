import React, { useEffect, useState } from "react";
import { Search, Eye, Trash2, X } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const SupportMessages = () => {
  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      adminApi
        .getSupportMessages({ search })
        .then((data) => {
          setMessages(data.items || []);
        })
        .catch((err) => {
          setError(err.message || "Failed to load support messages.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleView = async (message) => {
    setSelectedMessage(message);
    if (message.status === "Unread") {
      try {
        const updated = await adminApi.updateSupportMessage(message.id, { status: "Read" });
        setMessages((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
        setSelectedMessage(updated);
      } catch (err) {
        setError(err.message || "Failed to mark message as read.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      await adminApi.deleteSupportMessage(id);
      setMessages((current) => current.filter((msg) => msg.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      setError(err.message || "Failed to delete support message.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Support Messages</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              View and manage user support queries submitted from the mobile app.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-[#1E293B] bg-[#131B2F] p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, subject, category or message..."
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#38BDF8]"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0A0D14]/50 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">User Info</th>
                  <th className="px-6 py-5">Category</th>
                  <th className="px-6 py-5">Subject</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <tr key={msg.id} className="transition-colors hover:bg-[#1E293B]/30">
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-[#94A3B8]">
                        {formatDate(msg.created_at)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold">{msg.name}</div>
                        <div className="mt-1 text-xs text-[#64748B]">{msg.email}</div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#94A3B8]">{msg.category}</td>
                      <td className="px-6 py-5 text-sm text-white">{msg.subject}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                            msg.status === "Unread"
                              ? "bg-blue-500/10 text-blue-400"
                              : msg.status === "Archived"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {msg.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleView(msg)}
                            className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                            title="View Message"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(msg.id)}
                            className="rounded-lg p-2 text-[#64748B] hover:bg-red-500/10 hover:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[#64748B]">
                      {loading ? "Loading support messages..." : "No messages found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[680px] rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#2DD4BF]">
                  {selectedMessage.category}
                </div>
                <h2 className="mt-2 text-2xl font-bold">{selectedMessage.subject}</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">
                  {selectedMessage.name} · {selectedMessage.email} · {formatDate(selectedMessage.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4 text-sm leading-6 text-[#E2E8F0] custom-scrollbar">
              {selectedMessage.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportMessages;
