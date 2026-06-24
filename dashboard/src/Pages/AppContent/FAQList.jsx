import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, Search, Trash2, Edit3, HelpCircle } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const labelStatus = (status) =>
  status === "published" ? "Published" : status === "draft" ? "Draft" : status;

const FAQList = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      setError("");
      adminApi
        .getFaqs({ search })
        .then((data) => {
          setFaqs(data.items || []);
        })
        .catch((err) => {
          setError(err.message || "Failed to load FAQs.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 250);

    return () => clearTimeout(timeout);
  }, [search]);

  const groupedFaqs = useMemo(
    () => ({
      subscription: faqs.filter((faq) => faq.category === "Subscription"),
      app: faqs.filter((faq) => faq.category !== "Subscription"),
    }),
    [faqs],
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

    try {
      await adminApi.deleteFaq(id);
      setFaqs((current) => current.filter((faq) => faq.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete FAQ.");
    }
  };

  const handleEdit = (faq) => {
    navigate("/add-faq", { state: { editFaq: faq } });
  };

  const renderTable = (categoryFaqs, categoryName) => {
    return (
      <div className="mb-8 overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F]">
        <div className="border-b border-[#1E293B] bg-[#1E293B]/20 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-[#2DD4BF]">
            <HelpCircle size={18} />
            {categoryName}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#1E293B] bg-[#0A0D14]/50 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                <th className="px-6 py-5">Question</th>
                <th className="px-6 py-5">Answer</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {categoryFaqs.length > 0 ? (
                categoryFaqs.map((faq) => (
                  <tr key={faq.id} className="transition-colors hover:bg-[#1E293B]/30">
                    <td className="max-w-[250px] truncate px-6 py-5 font-bold text-white">
                      {faq.question}
                    </td>
                    <td className="max-w-[400px] truncate px-6 py-5 text-sm text-[#94A3B8]">
                      {faq.answer}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                          faq.status === "published"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-amber-500/10 text-amber-400"
                        }`}
                      >
                        {labelStatus(faq.status)}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(faq)}
                          className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                          title="Edit"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
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
                  <td colSpan="4" className="py-12 text-center text-sm text-[#64748B]">
                    {loading ? "Loading FAQs..." : "No FAQs found in this category."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Frequently Asked Questions</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Manage the FAQs that appear in the mobile application, grouped by category.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-faq")}
            className="flex items-center gap-2 self-start rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
          >
            Add New FAQ <PlusCircle size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap gap-3 rounded-2xl border border-[#1E293B] bg-[#131B2F] p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or answers..."
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#38BDF8]"
            />
          </div>
        </div>

        {renderTable(groupedFaqs.subscription, "Subscription FAQ")}
        {renderTable(groupedFaqs.app, "App FAQ")}
      </div>
    </div>
  );
};

export default FAQList;
