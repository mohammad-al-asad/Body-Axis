import React, { useEffect, useRef, useState } from "react";
import { FileVideo, Image as ImageIcon, PlayCircle, Save, UploadCloud } from "lucide-react";
import { adminApi } from "../../services/adminApi";

const IntroductionContent = () => {
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [messageTitle, setMessageTitle] = useState("");
  const [messageQuote, setMessageQuote] = useState("");
  const [status, setStatus] = useState("published");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError("");

    adminApi
      .getIntroductionContent()
      .then((data) => {
        if (!mounted) return;
        setMessageTitle(data.message_title || "");
        setMessageQuote(data.message_quote || "");
        setStatus(data.status || "published");
        setVideoUrl(data.video_url || "");
        setThumbnailUrl(data.thumbnail_url || "");
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Failed to load introduction content.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(videoFile);
    setVideoPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [videoFile]);

  useEffect(() => {
    if (!thumbnailFile) {
      setThumbnailPreviewUrl("");
      return;
    }

    const url = URL.createObjectURL(thumbnailFile);
    setThumbnailPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [thumbnailFile]);

  const handleSelectVideo = (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Please choose a video file.");
      return;
    }
    setError("");
    setVideoFile(file);
  };

  const handleSelectThumbnail = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file for the thumbnail.");
      return;
    }
    setError("");
    setThumbnailFile(file);
  };

  const handleSave = async () => {
    if (!messageTitle.trim() || !messageQuote.trim()) {
      setError("Message title and quote are required.");
      return;
    }

    const body = new FormData();
    body.append("message_title", messageTitle.trim());
    body.append("message_quote", messageQuote.trim());
    body.append("status", status);
    if (videoFile) body.append("video_file", videoFile);
    if (thumbnailFile) body.append("thumbnail_file", thumbnailFile);

    setSaving(true);
    setError("");
    try {
      const updated = await adminApi.updateIntroductionContent(body);
      setMessageTitle(updated.message_title);
      setMessageQuote(updated.message_quote);
      setStatus(updated.status);
      setVideoUrl(updated.video_url);
      setThumbnailUrl(updated.thumbnail_url);
      setVideoFile(null);
      setThumbnailFile(null);
      alert("Introduction content saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save introduction content.");
    } finally {
      setSaving(false);
    }
  };

  const activeVideoUrl = videoPreviewUrl || videoUrl;
  const activeThumbnailUrl = thumbnailPreviewUrl || thumbnailUrl;

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Introduction Screen</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Manage the onboarding introduction video and message shown in the mobile app.
            </p>
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
            <div className="py-20 text-center text-[#94A3B8]">Loading introduction content...</div>
          ) : (
            <div className="grid gap-8 xl:grid-cols-[1fr_420px]">
              <div className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Message Title
                  </span>
                  <input
                    value={messageTitle}
                    onChange={(event) => setMessageTitle(event.target.value)}
                    className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-[#38BDF8]"
                    placeholder="Precision in every movement."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Message Quote
                  </span>
                  <textarea
                    value={messageQuote}
                    onChange={(event) => setMessageQuote(event.target.value)}
                    className="h-[220px] w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] p-4 text-sm text-white outline-none focus:border-[#38BDF8] custom-scrollbar"
                    placeholder="Enter the quote shown on the introduction screen..."
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Status
                  </span>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className="rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm text-white outline-none focus:border-[#38BDF8]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </label>

                <div>
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Video Thumbnail
                  </span>
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleSelectThumbnail(event.dataTransfer.files[0]);
                    }}
                    className="flex min-h-[160px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155] bg-[#0A0D14]/60 p-5 text-center hover:border-[#38BDF8]"
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(event) => handleSelectThumbnail(event.target.files[0])}
                    />
                    <div className="mb-4 rounded-full bg-[#1E293B] p-4">
                      <ImageIcon size={24} className={thumbnailFile ? "text-[#34D399]" : "text-[#94A3B8]"} />
                    </div>
                    <div className="text-sm font-bold">
                      {thumbnailFile?.name || "Click or drag an image for the video preview"}
                    </div>
                    <div className="mt-2 text-xs text-[#64748B]">
                      JPG, PNG, or WebP
                    </div>
                  </button>
                </div>

                <div>
                  <span className="mb-2 block text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                    Introduction Video
                  </span>
                  <button
                    type="button"
                    onClick={() => videoInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      handleSelectVideo(event.dataTransfer.files[0]);
                    }}
                    className="flex min-h-[170px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155] bg-[#0A0D14]/60 p-5 text-center hover:border-[#38BDF8]"
                  >
                    <input
                      ref={videoInputRef}
                      type="file"
                      accept="video/mp4,video/quicktime,video/webm"
                      className="hidden"
                      onChange={(event) => handleSelectVideo(event.target.files[0])}
                    />
                    <div className="mb-4 rounded-full bg-[#1E293B] p-4">
                      <UploadCloud size={24} className={videoFile ? "text-[#34D399]" : "text-[#94A3B8]"} />
                    </div>
                    <div className="text-sm font-bold">
                      {videoFile?.name || "Click or drag a video to replace the current introduction"}
                    </div>
                    <div className="mt-2 text-xs text-[#64748B]">
                      MP4, MOV, or WebM
                    </div>
                  </button>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  <PlayCircle size={16} className="text-[#38BDF8]" /> Preview
                </div>
                {activeThumbnailUrl ? (
                  <img
                    src={activeThumbnailUrl}
                    alt="Introduction thumbnail preview"
                    className="aspect-video w-full rounded-2xl bg-[#0A0D14] object-cover"
                  />
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-[#1E293B] bg-[#0A0D14] text-[#64748B]">
                    <ImageIcon size={28} className="mb-3" />
                    No thumbnail selected
                  </div>
                )}
                {activeVideoUrl ? (
                  <video
                    controls
                    src={activeVideoUrl}
                    className="aspect-video w-full rounded-2xl bg-black object-contain"
                  />
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border border-[#1E293B] bg-[#0A0D14] text-[#64748B]">
                    <FileVideo size={28} className="mb-3" />
                    No video selected
                  </div>
                )}

                <div className="rounded-2xl border border-[#1E293B] bg-[#0A0D14] p-5">
                  <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF]">
                    Message From Christina
                  </div>
                  <div className="text-lg font-bold">{messageTitle || "Message title"}</div>
                  <p className="mt-3 text-sm leading-6 text-[#94A3B8]">
                    {messageQuote || "Message quote"}
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroductionContent;
