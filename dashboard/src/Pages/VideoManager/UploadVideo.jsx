import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CloudUpload,
  FileVideo,
  Image as ImageIcon,
  Save,
} from "lucide-react";
import { VideoContext } from "../../context/VideoContext";
import { uploadVideoMultipart } from "../../services/videoUpload";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const FileDrop = ({ accept, file, existingUrl, icon: Icon, label, onSelect }) => {
  const inputRef = useRef(null);
  const name = file?.name || (existingUrl ? "Current file" : "");

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.files[0]) onSelect(event.dataTransfer.files[0]);
      }}
      className="flex min-h-[220px] w-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#334155] bg-[#0A0D14]/60 p-5 text-center hover:border-[#38BDF8]"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => onSelect(event.target.files[0] || null)}
      />
      <div className="mb-4 rounded-full bg-[#1E293B] p-4">
        {React.createElement(Icon, {
          size: 24,
          className: name ? "text-[#34D399]" : "text-[#94A3B8]",
        })}
      </div>
      <div className="text-sm font-bold">{name || label}</div>
      <div className="mt-2 text-xs text-[#64748B]">
        {name ? "Click or drop to replace" : "Click or drag and drop"}
      </div>
    </button>
  );
};

const UploadVideo = () => {
  const { videoId } = useParams();
  const editing = Boolean(videoId);
  const { videos, createVideo, updateVideo } = useContext(VideoContext);
  const navigate = useNavigate();
  const existing = useMemo(
    () => videos.find((video) => video.id === videoId),
    [videoId, videos],
  );
  const [form, setForm] = useState({
    exerciseId: "",
    videoName: "",
    videoDescription: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!existing) return;
    setForm({
      exerciseId: existing.exercise_id,
      videoName: existing.video_name,
      videoDescription: existing.video_description,
    });
  }, [existing]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!editing && (!thumbnail || !videoFile)) {
      setError("A thumbnail and video file are required.");
      return;
    }

    const body = new FormData();
    body.append("exercise_id", form.exerciseId.trim());
    body.append("video_name", form.videoName.trim());
    body.append("video_description", form.videoDescription.trim());
    if (thumbnail) body.append("thumbnail", thumbnail);

    setSubmitting(true);
    try {
      if (videoFile) {
        setUploadProgress({
          stage: "uploading",
          uploadedBytes: 0,
          totalBytes: videoFile.size,
          percent: 0,
        });
        const uploadFields = await uploadVideoMultipart(videoFile, {
          onProgress: ({ uploadedBytes, totalBytes, percent }) => {
            setUploadProgress({
              stage: "uploading",
              uploadedBytes,
              totalBytes,
              percent,
            });
          },
        });
        Object.entries(uploadFields).forEach(([key, value]) => {
          body.append(key, value);
        });
        setUploadProgress({
          stage: "finalizing",
          uploadedBytes: videoFile.size,
          totalBytes: videoFile.size,
          percent: 100,
        });
      }

      if (editing) await updateVideo(videoId, body);
      else await createVideo(body);
      navigate("/video-manager");
    } catch (requestError) {
      console.error("[Video Upload] Publish failed", {
        mode: editing ? "update" : "create",
        exerciseId: form.exerciseId.trim(),
        video: videoFile
          ? {
              name: videoFile.name,
              type: videoFile.type || "unknown",
              sizeBytes: videoFile.size,
            }
          : null,
        thumbnail: thumbnail
          ? {
              name: thumbnail.name,
              type: thumbnail.type || "unknown",
              sizeBytes: thumbnail.size,
            }
          : null,
        errorName: requestError.name,
        errorMessage: requestError.message,
        error: requestError,
      });
      setError(requestError.message);
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <form onSubmit={handleSubmit} className="mx-auto max-w-[1450px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              type="button"
              onClick={() => navigate("/video-manager")}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#64748B] hover:text-white"
            >
              <ArrowLeft size={14} /> Video Manager
            </button>
            <h1 className="text-[28px] font-bold">
              {editing ? "Edit Video Asset" : "Upload Video Asset"}
            </h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Video files upload directly from the browser to S3 in multipart
              chunks, then the dashboard saves the finished asset metadata.
            </p>
          </div>
          <button
            disabled={submitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#3B82F6] px-6 py-3 text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
          >
            <Save size={17} />
            {submitting ? "Saving…" : editing ? "Update Video" : "Publish Video"}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {uploadProgress && (
          <div className="mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-[#BFDBFE]">
            <div className="flex items-center justify-between gap-4">
              <span>
                {uploadProgress.stage === "finalizing"
                  ? "Finalizing uploaded video…"
                  : `Uploading video to S3: ${uploadProgress.percent}%`}
              </span>
              <span>
                {formatBytes(uploadProgress.uploadedBytes)} /{" "}
                {formatBytes(uploadProgress.totalBytes)}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#0A0D14]">
              <div
                className="h-full rounded-full bg-[#38BDF8] transition-all"
                style={{ width: `${uploadProgress.percent}%` }}
              />
            </div>
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          <div className="grid gap-6 md:grid-cols-2 xl:col-span-8">
            <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6">
              <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                <CloudUpload size={17} className="text-[#38BDF8]" /> Video File
              </div>
              <FileDrop
                accept="video/mp4,video/quicktime,video/webm"
                file={videoFile}
                existingUrl={existing?.video_url}
                icon={FileVideo}
                label="Choose MP4, MOV, or WEBM"
                onSelect={setVideoFile}
              />
            </div>
            <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6">
              <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
                <ImageIcon size={17} className="text-[#38BDF8]" /> Thumbnail
              </div>
              <FileDrop
                accept="image/png,image/jpeg,image/webp"
                file={thumbnail}
                existingUrl={existing?.thumbnail_url}
                icon={ImageIcon}
                label="Choose PNG, JPG, or WEBP"
                onSelect={setThumbnail}
              />
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 md:col-span-2">
              <div className="mx-auto max-w-[640px]">
                {videoFile ? (
                  <video
                    controls
                    src={URL.createObjectURL(videoFile)}
                    className="aspect-video w-full rounded-xl bg-black object-contain"
                  />
                ) : existing?.video_url ? (
                  <video
                    controls
                    src={existing.video_url}
                    className="aspect-video w-full rounded-xl bg-black object-contain"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl border border-[#1E293B] bg-[#0A0D14] text-[#475569]">
                    Video preview
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="h-fit rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 xl:col-span-4">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Video Details
            </h2>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Exercise ID
                </span>
                <input
                  required
                  value={form.exerciseId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      exerciseId: event.target.value,
                    }))
                  }
                  placeholder="EX-260001"
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Video Name
                </span>
                <input
                  required
                  value={form.videoName}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      videoName: event.target.value,
                    }))
                  }
                  placeholder="Supine Pelvic Clocks Tutorial"
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Video Description
                </span>
                <textarea
                  required
                  rows="8"
                  value={form.videoDescription}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      videoDescription: event.target.value,
                    }))
                  }
                  placeholder="Describe the movement and coaching cues."
                  className="w-full resize-none rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
              <p className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs leading-5 text-[#93C5FD]">
                Target Area has been removed from video assets. Exercise associations
                are validated using Exercise ID.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UploadVideo;
