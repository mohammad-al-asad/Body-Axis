import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  Film,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { VideoContext } from "../../context/VideoContext";
import { managementApi } from "../../services/managementApi";

const formatBytes = (bytes) => {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`;
};

const VideoManager = () => {
  const { deleteVideo } = useContext(VideoContext);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [videos, setVideos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();
  const pageSize = 8;

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const skip = (currentPage - 1) * pageSize;
      const data = await managementApi.listVideos({
        search: debouncedSearch,
        skip,
        limit: pageSize,
      });
      setVideos(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load videos.");
      setVideos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentPage, pageSize]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const handleDelete = async (video) => {
    if (!window.confirm(`Delete "${video.video_name}"?`)) return;
    setActionError("");
    try {
      await deleteVideo(video.id);
      fetchVideos();
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold tracking-tight">Video Manager</h1>
            <p className="mt-1 text-[13px] font-medium text-[#94A3B8]">
              Upload and manage tutorial and short-clip assets stored in S3.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search videos..."
                className="w-[240px] rounded-xl border border-[#1E293B] bg-[#131B2F] py-2.5 pl-10 pr-4 text-[13px] outline-none focus:border-[#3B82F6]"
              />
            </div>
            <button
              onClick={() => navigate("/upload-video")}
              className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
            >
              Upload New Video <PlusCircle size={18} />
            </button>
          </div>
        </div>

        {(error || actionError) && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {actionError || error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0A0D14]/50 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  <th className="px-7 py-5">Thumbnail</th>
                  <th className="px-6 py-5">Exercise ID</th>
                  <th className="px-6 py-5">Video Name</th>
                  <th className="px-6 py-5">File</th>
                  <th className="px-6 py-5">Uploaded</th>
                  <th className="px-7 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-20 text-center text-[#64748B]">
                      Loading videos…
                    </td>
                  </tr>
                ) : videos.length ? (
                  videos.map((video) => (
                    <tr key={video.id} className="hover:bg-[#1E293B]/30">
                      <td className="px-7 py-4">
                        <img
                          src={video.thumbnail_url}
                          alt=""
                          className="h-12 w-20 rounded-lg border border-[#1E293B] object-cover"
                        />
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#94A3B8]">
                        {video.exercise_id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold">{video.video_name}</div>
                        <div className="mt-1 max-w-[360px] truncate text-xs text-[#64748B]">
                          {video.video_description}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#94A3B8]">
                        <div className="flex items-center gap-2">
                          <Film size={16} className="text-[#38BDF8]" />
                          {formatBytes(video.video_file_size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-[#64748B]">
                        {new Date(video.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-7 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => navigate(`/video-manager/${video.id}/edit`)}
                            className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                            aria-label={`Edit ${video.video_name}`}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(video)}
                            className="rounded-lg p-2 text-[#64748B] hover:bg-red-500/10 hover:text-red-400"
                            aria-label={`Delete ${video.video_name}`}
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
                      No videos found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-[#1E293B] px-7 py-5">
            <span className="text-xs text-[#64748B]">
              {total} video{total === 1 ? "" : "s"}
            </span>
            <div className="flex items-center gap-3">
              <button
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-lg p-2 text-[#94A3B8] disabled:opacity-30"
              >
                <ArrowLeft size={16} />
              </button>
              <span className="text-xs font-bold text-[#94A3B8]">
                {safePage} / {totalPages}
              </span>
              <button
                disabled={safePage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-lg p-2 text-[#94A3B8] disabled:opacity-30"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoManager;
