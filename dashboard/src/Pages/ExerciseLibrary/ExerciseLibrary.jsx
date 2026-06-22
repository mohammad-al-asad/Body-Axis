import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell,
  Edit3,
  Package,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { ExerciseContext } from "../../context/ExerciseContext";

const phaseStyles = {
  reset: "bg-cyan-500/10 text-cyan-300",
  control: "bg-emerald-500/10 text-emerald-300",
  integrate: "bg-violet-500/10 text-violet-300",
};

const ExerciseLibrary = () => {
  const { exercises, loading, error, deleteExercise } =
    useContext(ExerciseContext);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [phase, setPhase] = useState("");
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return exercises.filter((exercise) => {
      const matchesQuery =
        !query ||
        exercise.exercise_name.toLowerCase().includes(query) ||
        exercise.exercise_id.toLowerCase().includes(query);
      return matchesQuery && (!phase || exercise.phase === phase);
    });
  }, [exercises, phase, search]);

  const handleDelete = async (exercise) => {
    if (!window.confirm(`Delete "${exercise.exercise_name}"?`)) return;
    setActionError("");
    try {
      await deleteExercise(exercise.exercise_id);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Exercise Management</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Manage exercise prescriptions and their tutorial and short-clip videos.
            </p>
          </div>
          <button
            onClick={() => navigate("/add-exercise")}
            className="flex items-center gap-2 self-start rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
          >
            Add New Exercise <PlusCircle size={18} />
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <Dumbbell className="mb-4 text-[#38BDF8]" size={22} />
            <div className="text-2xl font-bold">{exercises.length}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Total Exercises
            </div>
          </div>
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <Package className="mb-4 text-[#34D399]" size={22} />
            <div className="text-2xl font-bold">
              {
                exercises.filter((exercise) => exercise.status === "published")
                  .length
              }
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Published
            </div>
          </div>
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <div className="mb-4 text-xl font-bold text-violet-300">3</div>
            <div className="text-2xl font-bold">Reset · Control · Integrate</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Available Phases
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-3 rounded-2xl border border-[#1E293B] bg-[#131B2F] p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or Exercise ID"
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#38BDF8]"
            />
          </div>
          <select
            value={phase}
            onChange={(event) => setPhase(event.target.value)}
            className="rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-2.5 text-sm outline-none"
          >
            <option value="">All phases</option>
            <option value="reset">Reset</option>
            <option value="control">Control</option>
            <option value="integrate">Integrate</option>
          </select>
        </div>

        {(error || actionError) && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {actionError || error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-[#1E293B] bg-[#131B2F]">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#1E293B] bg-[#0A0D14]/50 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                  <th className="px-7 py-5">Exercise</th>
                  <th className="px-6 py-5">Sets / Reps</th>
                  <th className="px-6 py-5">Phase</th>
                  <th className="px-6 py-5">Equipment</th>
                  <th className="px-6 py-5">Videos</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-7 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-[#64748B]">
                      Loading exercises…
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((exercise) => (
                    <tr key={exercise.id} className="hover:bg-[#1E293B]/30">
                      <td className="px-7 py-5">
                        <div className="font-bold">{exercise.exercise_name}</div>
                        <div className="mt-1 text-xs text-[#64748B]">
                          {exercise.exercise_id}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#94A3B8]">
                        {exercise.sets} × {exercise.reps}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${phaseStyles[exercise.phase]}`}
                        >
                          {exercise.phase}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex max-w-[300px] flex-wrap gap-1.5">
                          {exercise.equipment_needed.length ? (
                            exercise.equipment_needed.map((item) => (
                              <span
                                key={item}
                                className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[10px] text-[#CBD5E1]"
                              >
                                {item}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-[#64748B]">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-[#94A3B8]">
                        <div>Tutorial: {exercise.tutorial_video.video_name}</div>
                        <div className="mt-1">
                          Clip: {exercise.short_clip_video.video_name}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={
                            exercise.status === "published"
                              ? "text-xs font-bold capitalize text-emerald-400"
                              : "text-xs font-bold capitalize text-amber-400"
                          }
                        >
                          {exercise.status}
                        </span>
                      </td>
                      <td className="px-7 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() =>
                              navigate(
                                `/exercise-library/${encodeURIComponent(exercise.exercise_id)}/edit`,
                              )
                            }
                            className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(exercise)}
                            className="rounded-lg p-2 text-[#64748B] hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-[#64748B]">
                      No exercises found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExerciseLibrary;
