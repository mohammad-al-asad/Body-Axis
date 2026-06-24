import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const AddFAQ = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editFaq = location.state?.editFaq;

  const [question, setQuestion] = useState(editFaq ? editFaq.question : "");
  const [answer, setAnswer] = useState(editFaq ? editFaq.answer : "");
  const [category, setCategory] = useState(editFaq ? editFaq.category : "Subscription");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (status) => {
    if (!question.trim() || !answer.trim()) {
      setError("Please fill in both question and answer fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    const payload = {
      question: question.trim(),
      answer: answer.trim(),
      category,
      status,
    };

    try {
      if (editFaq) {
        await adminApi.updateFaq(editFaq.id, payload);
      } else {
        await adminApi.createFaq(payload);
      }
      navigate("/faq");
    } catch (err) {
      setError(err.message || "Failed to save FAQ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1000px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              onClick={() => navigate("/faq")}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#64748B] hover:text-white"
            >
              <ArrowLeft size={14} /> Back to FAQs
            </button>
            <h1 className="text-[28px] font-bold">
              {editFaq ? "Edit FAQ" : "Add New FAQ"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
              className="rounded-xl border border-[#334155] px-5 py-2.5 text-sm font-bold hover:bg-[#131B2F] disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("published")}
              className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
            >
              <Save size={16} /> {submitting ? "Saving..." : editFaq ? "Save Changes" : "Publish FAQ"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8">
          <div className="space-y-6">
            <div>
              <span className="mb-3 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Category
              </span>
              <div className="flex gap-4">
                {["Subscription", "App"].map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl border px-6 py-3 text-sm font-bold transition-all duration-300 ${
                        isSelected
                          ? "border-[#2DD4BF] bg-teal-500/10 text-[#2DD4BF]"
                          : "border-[#1E293B] bg-[#0A0D14] text-[#94A3B8] hover:border-[#334155] hover:text-white"
                      }`}
                    >
                      {cat} FAQ
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block">
              <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Question
              </span>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g., How do I reset my password?"
                className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-[#38BDF8]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Answer
              </span>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Provide the answer here..."
                className="min-h-[200px] w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4 text-sm text-white outline-none focus:border-[#38BDF8] custom-scrollbar"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFAQ;
