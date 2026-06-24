import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const ContentEditor = ({ slug, heading, description, placeholder }) => {
  const [title, setTitle] = useState(heading);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("published");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    adminApi
      .getContent(slug)
      .then((data) => {
        if (!mounted) return;
        setTitle(data.title || heading);
        setContent(data.content || "");
        setStatus(data.status || "published");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load content.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [slug, heading]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const updated = await adminApi.updateContent(slug, {
        title: title.trim(),
        content: content.trim(),
        status,
      });
      setTitle(updated.title);
      setContent(updated.content);
      setStatus(updated.status);
      alert(`${heading} saved successfully!`);
    } catch (err) {
      setError(err.message || "Failed to save content.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">{heading}</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">{description}</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-[13px] font-bold hover:bg-blue-600 disabled:opacity-50"
          >
            <Save size={17} /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-8">
          {loading ? (
            <div className="py-20 text-center text-[#94A3B8]">Loading content...</div>
          ) : (
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Title
                </span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-[#38BDF8]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Status
                </span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-[#38BDF8]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Content
                </span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="h-[500px] w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4 text-sm text-white outline-none focus:border-[#38BDF8] custom-scrollbar"
                  placeholder={placeholder}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;
