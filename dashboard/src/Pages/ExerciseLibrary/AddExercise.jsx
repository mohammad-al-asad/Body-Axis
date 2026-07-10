import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Clock,
  Film,
  PlaySquare,
  Save,
  Search,
  X,
} from "lucide-react";
import { EQUIPMENT_OPTIONS } from "../../constants/management";
import { ExerciseContext } from "../../context/ExerciseContext";
import { VideoContext } from "../../context/VideoContext";

const emptyForm = {
  exerciseId: "",
  exerciseName: "",
  sets: "3",
  reps: "",
  primaryIntent: "",
  secondaryBenefits: "",
  equipmentNeeded: [],
  tutorialVideoId: "",
  shortClipVideoId: "",
};

const getValidDurationSeconds = (seconds) => {
  const value = Number(seconds);
  return Number.isFinite(value) && value > 0 ? value : null;
};

const readVideoUrlDurationSeconds = (url) =>
  new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const video = document.createElement("video");
    const timer = window.setTimeout(() => {
      cleanup();
      resolve(null);
    }, 8000);

    const cleanup = () => {
      window.clearTimeout(timer);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = getValidDurationSeconds(video.duration);
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
    video.src = url;
  });

const useVideoDuration = (video) => {
  const storedDuration = getValidDurationSeconds(video?.duration_seconds);
  const [duration, setDuration] = useState(storedDuration);

  useEffect(() => {
    if (storedDuration) {
      setDuration(storedDuration);
      return;
    }

    setDuration(null);
    if (!video?.video_url) return;

    let active = true;
    readVideoUrlDurationSeconds(video.video_url).then((resolvedDuration) => {
      if (active) setDuration(resolvedDuration);
    });

    return () => {
      active = false;
    };
  }, [storedDuration, video?.id, video?.video_url]);

  return duration;
};

const formatVideoDuration = (seconds, fallback = "Duration unavailable") => {
  const value = getValidDurationSeconds(seconds);
  if (!value) return fallback;

  const totalSeconds = Math.round(value);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const VideoPickerItem = ({ video, onSelect }) => {
  const duration = useVideoDuration(video);

  return (
    <button
      type="button"
      onClick={() => onSelect(video)}
      className="flex items-center gap-4 rounded-xl border border-[#1E293B] bg-[#0A0D14]/70 p-3 text-left hover:border-[#38BDF8]"
    >
      <div className="relative shrink-0">
        <img
          src={video.thumbnail_url}
          alt=""
          className="h-16 w-24 rounded-lg object-cover"
        />
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {formatVideoDuration(duration, "--:--")}
        </span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold">{video.video_name}</div>
        <div className="mt-1 text-xs text-[#38BDF8]">
          {video.exercise_id}
        </div>
        <div className="mt-1 flex items-center gap-1 text-xs text-[#94A3B8]">
          <Clock size={12} />
          {formatVideoDuration(duration)}
        </div>
      </div>
    </button>
  );
};

const VideoPicker = ({ title, videos, excludedId, onClose, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = videos.filter((video) => {
    const query = search.toLowerCase();
    return (
      video.id !== excludedId &&
      (video.video_name.toLowerCase().includes(query) ||
        video.exercise_id.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5 backdrop-blur-sm">
      <div className="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#334155] bg-[#131B2F] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1E293B] p-5">
          <div>
            <h2 className="font-bold">{title}</h2>
            <p className="mt-1 text-xs text-[#64748B]">
              Selecting the first video populates the exercise&apos;s Exercise ID.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-[#1E293B]">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search video name or Exercise ID"
              className="w-full rounded-xl border border-[#334155] bg-[#0A0D14] py-3 pl-10 pr-4 text-sm outline-none focus:border-[#38BDF8]"
            />
          </div>
          <div className="grid max-h-[52vh] gap-3 overflow-y-auto md:grid-cols-2">
            {filtered.map((video) => (
              <VideoPickerItem
                key={video.id}
                video={video}
                onSelect={onSelect}
              />
            ))}
            {!filtered.length && (
              <div className="col-span-2 py-12 text-center text-sm text-[#64748B]">
                No matching videos.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoSlot = ({ label, video, onOpen }) => {
  const duration = useVideoDuration(video);

  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-h-[150px] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#334155] bg-[#0A0D14] hover:border-[#38BDF8]"
    >
      {video ? (
        <div className="flex w-full items-center gap-4 p-4 text-left">
          <img
            src={video.thumbnail_url}
            alt=""
            className="h-24 w-36 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <div className="truncate text-sm font-bold">{video.video_name}</div>
            <div className="mt-1 text-xs text-[#38BDF8]">{video.exercise_id}</div>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-[#94A3B8]">
              <Clock size={13} />
              {formatVideoDuration(duration)}
            </div>
            <div className="mt-3 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
              Click to change
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-[#64748B]">
          <PlaySquare size={26} className="mx-auto mb-3" />
          <div className="text-xs font-bold uppercase tracking-widest">{label}</div>
        </div>
      )}
    </button>
  );
};

const AddExercise = () => {
  const { exerciseId: routeExerciseId } = useParams();
  const editing = Boolean(routeExerciseId);
  const { exercises, createExercise, updateExercise } =
    useContext(ExerciseContext);
  const { videos } = useContext(VideoContext);
  const navigate = useNavigate();
  const existing = useMemo(
    () =>
      exercises.find((exercise) => exercise.exercise_id === routeExerciseId),
    [exercises, routeExerciseId],
  );
  const [form, setForm] = useState(emptyForm);
  const [picker, setPicker] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setForm({
      exerciseId: existing.exercise_id,
      exerciseName: existing.exercise_name,
      sets: String(existing.sets),
      reps: existing.reps,
      primaryIntent: existing.primary_intent,
      secondaryBenefits: existing.secondary_benefits,
      equipmentNeeded: existing.equipment_needed,
      tutorialVideoId: existing.tutorial_video_id,
      shortClipVideoId: existing.short_clip_video_id,
    });
  }, [existing]);

  const tutorialVideo = videos.find(
    (video) => video.id === form.tutorialVideoId,
  );
  const shortClipVideo = videos.find(
    (video) => video.id === form.shortClipVideoId,
  );

  const updateField = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));

  const toggleEquipment = (equipment) => {
    setForm((current) => ({
      ...current,
      equipmentNeeded: current.equipmentNeeded.includes(equipment)
        ? current.equipmentNeeded.filter((item) => item !== equipment)
        : [...current.equipmentNeeded, equipment],
    }));
  };

  const selectVideo = (video) => {
    const otherVideo =
      picker === "tutorial" ? shortClipVideo : tutorialVideo;
    const expectedExerciseId =
      otherVideo?.exercise_id || form.exerciseId.trim() || video.exercise_id;

    if (expectedExerciseId !== video.exercise_id) {
      setError(
        `Exercise ID doesn't match. This video belongs to ${video.exercise_id}, while the exercise is ${expectedExerciseId}.`,
      );
      setPicker("");
      return;
    }

    setError("");
    setForm((current) => ({
      ...current,
      exerciseId: video.exercise_id,
      [picker === "tutorial" ? "tutorialVideoId" : "shortClipVideoId"]:
        video.id,
    }));
    setPicker("");
  };

  const handleSubmit = async (status) => {
    setError("");
    if (!form.tutorialVideoId || !form.shortClipVideoId) {
      setError("Select both a tutorial video and a short clip video.");
      return;
    }

    const payload = {
      exercise_id: form.exerciseId.trim(),
      exercise_name: form.exerciseName.trim(),
      sets: Number(form.sets),
      reps: form.reps.trim(),
      primary_intent: form.primaryIntent.trim(),
      secondary_benefits: form.secondaryBenefits.trim(),
      equipment_needed: form.equipmentNeeded,
      tutorial_video_id: form.tutorialVideoId,
      short_clip_video_id: form.shortClipVideoId,
      status,
    };

    setSubmitting(true);
    try {
      if (editing) await updateExercise(routeExerciseId, payload);
      else await createExercise(payload);
      navigate("/exercise-library");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1250px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              onClick={() => navigate("/exercise-library")}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#64748B] hover:text-white"
            >
              <ArrowLeft size={14} /> Exercise Management
            </button>
            <h1 className="text-[28px] font-bold">
              {editing ? "Edit Exercise" : "Add New Exercise"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("draft")}
              className="rounded-xl border border-[#334155] px-5 py-2.5 text-sm font-bold hover:bg-[#131B2F]"
            >
              Save Draft
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("published")}
              className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
            >
              <Save size={16} /> {submitting ? "Saving…" : "Publish Exercise"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-7">
          <div className="grid gap-6 md:grid-cols-2">
            {[
              ["exerciseId", "Exercise ID", "EX-260001"],
              ["exerciseName", "Exercise Name", "Supine Pelvic Clocks"],
              ["sets", "Sets", "3"],
              ["reps", "Reps", "8 / side"],
              ["primaryIntent", "Primary Intent", "Restore thoracic rotation"],
              [
                "secondaryBenefits",
                "Secondary Benefits",
                "Reduce lumbar compensation",
              ],
            ].map(([field, label, placeholder]) => (
              <label key={field} className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  {label}
                </span>
                <input
                  required
                  type={field === "sets" ? "number" : "text"}
                  min={field === "sets" ? "1" : undefined}
                  value={form[field]}
                  onChange={(event) => updateField(field, event.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
            ))}

            <div>
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Equipment Needed
              </span>
              <div className="grid gap-2 sm:grid-cols-2">
                {EQUIPMENT_OPTIONS.map((equipment) => {
                  const selected = form.equipmentNeeded.includes(equipment);
                  return (
                    <button
                      type="button"
                      key={equipment}
                      onClick={() => toggleEquipment(equipment)}
                      className={`flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm ${
                        selected
                          ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300"
                          : "border-[#1E293B] bg-[#0A0D14] text-[#94A3B8]"
                      }`}
                    >
                      {equipment} {selected && <Check size={15} />}
                    </button>
                  );
                })}
              </div>
            </div>



            <div>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Tutorial Video
              </span>
              <VideoSlot
                label="Select Tutorial Video"
                video={tutorialVideo}
                onOpen={() => setPicker("tutorial")}
              />
            </div>
            <div>
              <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                Short Clip Video
              </span>
              <VideoSlot
                label="Select Short Clip Video"
                video={shortClipVideo}
                onOpen={() => setPicker("clip")}
              />
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/10 p-4 text-xs leading-5 text-[#93C5FD]">
            <Film size={17} className="mt-0.5 shrink-0" />
            Both selected videos must have exactly the same Exercise ID as this
            exercise. This rule is also enforced by the backend.
          </div>
        </div>
      </div>

      {picker && (
        <VideoPicker
          title={
            picker === "tutorial"
              ? "Select Tutorial Video"
              : "Select Short Clip Video"
          }
          videos={videos}
          excludedId={
            picker === "tutorial"
              ? form.shortClipVideoId
              : form.tutorialVideoId
          }
          onClose={() => setPicker("")}
          onSelect={selectVideo}
        />
      )}
    </div>
  );
};

export default AddExercise;
