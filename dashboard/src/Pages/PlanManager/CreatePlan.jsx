import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Layers3,
  PlusCircle,
  Save,
  Trash2,
} from "lucide-react";
import {
  PHASE_OPTIONS,
  TARGET_AREA_OPTIONS,
  USE_CASE_OPTIONS,
  normalizeUseCaseLabel,
} from "../../constants/management";
import { ExerciseContext } from "../../context/ExerciseContext";
import { PlanContext } from "../../context/PlanContext";

const phaseColors = {
  reset: "text-cyan-300",
  control: "text-emerald-300",
  integrate: "text-violet-300",
};

const emptyPhases = { reset: [], control: [], integrate: [] };

const CreatePlan = () => {
  const { planId: routePlanId } = useParams();
  const editing = Boolean(routePlanId);
  const { plans, createPlan, updatePlan } = useContext(PlanContext);
  const { exercises } = useContext(ExerciseContext);
  const navigate = useNavigate();
  const existing = useMemo(
    () => plans.find((plan) => plan.plan_id === routePlanId),
    [plans, routePlanId],
  );
  const [metadata, setMetadata] = useState({
    planId: "",
    planName: "",
    targetArea: TARGET_AREA_OPTIONS[0],
    useCase: USE_CASE_OPTIONS[0],
    duration: "30 Minutes",
  });
  const [phases, setPhases] = useState(emptyPhases);
  const [pending, setPending] = useState({
    reset: "",
    control: "",
    integrate: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setMetadata({
      planId: existing.plan_id,
      planName: existing.plan_name,
      targetArea: existing.target_area,
      useCase: normalizeUseCaseLabel(existing.use_case),
      duration: existing.duration,
    });
    setPhases({
      reset: existing.phases.reset.map((item) => ({ ...item })),
      control: existing.phases.control.map((item) => ({ ...item })),
      integrate: existing.phases.integrate.map((item) => ({ ...item })),
    });
  }, [existing]);

  const selectedIds = useMemo(
    () =>
      new Set(
        PHASE_OPTIONS.flatMap((phase) =>
          phases[phase].map((item) => item.exercise_id),
        ),
      ),
    [phases],
  );

  const equipmentNeeded = useMemo(() => {
    const equipment = PHASE_OPTIONS.flatMap((phase) =>
      phases[phase].flatMap((item) => item.equipment_needed || []),
    );
    return [...new Set(equipment)];
  }, [phases]);

  const addExercise = (phase) => {
    const exercise = exercises.find(
      (item) => item.exercise_id === pending[phase],
    );
    if (!exercise) return;
    setPhases((current) => ({
      ...current,
      [phase]: [
        ...current[phase],
        {
          exercise_id: exercise.exercise_id,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          equipment_needed: exercise.equipment_needed,
        },
      ],
    }));
    setPending((current) => ({ ...current, [phase]: "" }));
  };

  const removeExercise = (phase, exerciseId) => {
    setPhases((current) => ({
      ...current,
      [phase]: current[phase].filter(
        (item) => item.exercise_id !== exerciseId,
      ),
    }));
  };

  const updateExercise = (phase, exerciseId, field, value) => {
    setPhases((current) => ({
      ...current,
      [phase]: current[phase].map((item) =>
        item.exercise_id === exerciseId ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const handleSubmit = async (status) => {
    setError("");
    const totalExercises = PHASE_OPTIONS.reduce(
      (total, phase) => total + phases[phase].length,
      0,
    );
    if (!totalExercises) {
      setError("Add at least one exercise to the plan.");
      return;
    }

    const payload = {
      plan_id: metadata.planId.trim(),
      plan_name: metadata.planName.trim(),
      target_area: metadata.targetArea,
      use_case: metadata.useCase,
      duration: metadata.duration,
      phases: Object.fromEntries(
        PHASE_OPTIONS.map((phase) => [
          phase,
          phases[phase].map((item) => ({
            exercise_id: item.exercise_id,
            sets: Number(item.sets),
            reps: item.reps,
          })),
        ]),
      ),
      status,
    };

    setSubmitting(true);
    try {
      if (editing) await updatePlan(routePlanId, payload);
      else await createPlan(payload);
      navigate("/plan-manager");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1550px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <button
              onClick={() => navigate("/plan-manager")}
              className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#64748B] hover:text-white"
            >
              <ArrowLeft size={14} /> Plan Manager
            </button>
            <h1 className="text-[28px] font-bold">
              {editing ? "Edit Performance Plan" : "New Performance Plan"}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={submitting}
              className="rounded-xl border border-[#334155] px-5 py-2.5 text-sm font-bold hover:bg-[#131B2F]"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
            >
              <Save size={16} /> {submitting ? "Saving…" : "Publish Plan"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="grid gap-7 xl:grid-cols-12">
          <div className="h-fit rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 xl:col-span-4">
            <div className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              <Layers3 size={18} className="text-[#38BDF8]" /> Plan Metadata
            </div>
            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Plan ID
                </span>
                <input
                  value={metadata.planId}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      planId: event.target.value,
                    }))
                  }
                  placeholder="PL-001"
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Plan Name
                </span>
                <input
                  value={metadata.planName}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      planName: event.target.value,
                    }))
                  }
                  placeholder="The Lumbar Full Reset"
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none focus:border-[#38BDF8]"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Target Area
                </span>
                <select
                  value={metadata.targetArea}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      targetArea: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none"
                >
                  {TARGET_AREA_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  User Case
                </span>
                <select
                  value={metadata.useCase}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      useCase: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none"
                >
                  {USE_CASE_OPTIONS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Duration
                </span>
                <select
                  value={metadata.duration}
                  onChange={(event) =>
                    setMetadata((current) => ({
                      ...current,
                      duration: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none"
                >
                  {["15 Minutes", "30 Minutes", "45 Minutes", "60 Minutes"].map(
                    (duration) => (
                      <option key={duration}>{duration}</option>
                    ),
                  )}
                </select>
              </label>
              <div>
                <span className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-[#94A3B8]">
                  Equipment Needed
                </span>
                <div className="flex min-h-12 flex-wrap gap-2 rounded-xl border border-[#1E293B] bg-[#0A0D14] p-3">
                  {equipmentNeeded.length ? (
                    equipmentNeeded.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#64748B]">
                      Populated from selected exercises
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-6 xl:col-span-8">
            <div className="mb-6 text-xs font-bold uppercase tracking-widest text-[#94A3B8]">
              Phase-Based Session Builder
            </div>
            <div className="space-y-10">
              {PHASE_OPTIONS.map((phase, phaseIndex) => {
                const available = exercises.filter(
                  (exercise) =>
                    !selectedIds.has(exercise.exercise_id),
                );
                return (
                  <section key={phase}>
                    <div
                      className={`mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${phaseColors[phase]}`}
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5">
                        0{phaseIndex + 1}
                      </span>
                      {phase} Phase
                    </div>

                    <div className="space-y-3">
                      {phases[phase].map((exercise) => (
                        <div
                          key={exercise.exercise_id}
                          className="grid items-center gap-3 rounded-xl border border-[#1E293B] bg-[#0A0D14]/70 p-3 md:grid-cols-[1fr_90px_120px_40px]"
                        >
                          <div>
                            <div className="text-sm font-bold">
                              {exercise.exercise_name}
                            </div>
                            <div className="mt-1 text-xs text-[#64748B]">
                              {exercise.exercise_id}
                            </div>
                          </div>
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(event) =>
                              updateExercise(
                                phase,
                                exercise.exercise_id,
                                "sets",
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-[#1E293B] bg-[#131B2F] px-3 py-2 text-center text-sm outline-none"
                          />
                          <input
                            value={exercise.reps}
                            onChange={(event) =>
                              updateExercise(
                                phase,
                                exercise.exercise_id,
                                "reps",
                                event.target.value,
                              )
                            }
                            className="rounded-lg border border-[#1E293B] bg-[#131B2F] px-3 py-2 text-center text-sm outline-none"
                          />
                          <button
                            onClick={() =>
                              removeExercise(phase, exercise.exercise_id)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-3">
                      <select
                        value={pending[phase]}
                        onChange={(event) =>
                          setPending((current) => ({
                            ...current,
                            [phase]: event.target.value,
                          }))
                        }
                        className="min-w-0 flex-1 rounded-xl border border-[#1E293B] bg-[#0A0D14] px-4 py-3 text-sm outline-none"
                      >
                        <option value="">Select a {phase} exercise…</option>
                        {available.map((exercise) => (
                          <option
                            key={exercise.exercise_id}
                            value={exercise.exercise_id}
                          >
                            {exercise.exercise_name} ({exercise.exercise_id})
                          </option>
                        ))}
                      </select>
                      <button
                        disabled={!pending[phase]}
                        onClick={() => addExercise(phase)}
                        className="flex items-center gap-2 rounded-xl border border-[#3B82F6] px-4 py-3 text-xs font-bold text-[#60A5FA] hover:bg-[#3B82F6] hover:text-white disabled:opacity-40"
                      >
                        Add Exercise <PlusCircle size={15} />
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePlan;
