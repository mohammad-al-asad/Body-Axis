import React, { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock3,
  Edit3,
  Layers3,
  PlusCircle,
  Search,
  Trash2,
} from "lucide-react";
import { PlanContext } from "../../context/PlanContext";

const PlanManager = () => {
  const { plans, loading, error, deletePlan } = useContext(PlanContext);
  const [search, setSearch] = useState("");
  const [actionError, setActionError] = useState("");
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return plans;
    return plans.filter(
      (plan) =>
        plan.plan_name.toLowerCase().includes(query) ||
        plan.plan_id.toLowerCase().includes(query),
    );
  }, [plans, search]);

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete "${plan.plan_name}"?`)) return;
    setActionError("");
    try {
      await deletePlan(plan.plan_id);
    } catch (requestError) {
      setActionError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] p-8 text-white">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-[28px] font-bold">Plan Manager</h1>
            <p className="mt-1 text-[13px] text-[#94A3B8]">
              Build phase-based plans from the exercise library.
            </p>
          </div>
          <button
            onClick={() => navigate("/create-plan")}
            className="flex items-center gap-2 self-start rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold hover:bg-blue-600"
          >
            Create New Plan <PlusCircle size={18} />
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <Layers3 size={22} className="mb-4 text-[#38BDF8]" />
            <div className="text-2xl font-bold">{plans.length}</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Total Plans
            </div>
          </div>
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <Clock3 size={22} className="mb-4 text-[#34D399]" />
            <div className="text-2xl font-bold">
              {plans.filter((plan) => plan.status === "published").length}
            </div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Published Plans
            </div>
          </div>
          <div className="rounded-2xl border border-[#1E293B] bg-[#131B2F] p-5">
            <div className="mb-4 text-xl font-bold text-violet-300">3</div>
            <div className="text-2xl font-bold">Phase Builder</div>
            <div className="mt-1 text-xs uppercase tracking-widest text-[#64748B]">
              Reset · Control · Integrate
            </div>
          </div>
        </div>

        <div className="mb-5 rounded-2xl border border-[#1E293B] bg-[#131B2F] p-4">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plans..."
              className="w-full rounded-xl border border-[#1E293B] bg-[#0A0D14] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#38BDF8]"
            />
          </div>
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
                  <th className="px-7 py-5">Plan</th>
                  <th className="px-6 py-5">Target / Use Case</th>
                  <th className="px-6 py-5">Exercises</th>
                  <th className="px-6 py-5">Equipment</th>
                  <th className="px-6 py-5">Duration</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-7 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-[#64748B]">
                      Loading plans…
                    </td>
                  </tr>
                ) : filtered.length ? (
                  filtered.map((plan) => {
                    const count =
                      plan.phases.reset.length +
                      plan.phases.control.length +
                      plan.phases.integrate.length;
                    return (
                      <tr key={plan.id} className="hover:bg-[#1E293B]/30">
                        <td className="px-7 py-5">
                          <div className="font-bold">{plan.plan_name}</div>
                          <div className="mt-1 text-xs text-[#64748B]">
                            {plan.plan_id}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm">{plan.target_area}</div>
                          <div className="mt-1 text-xs text-[#64748B]">
                            {plan.use_case}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#94A3B8]">
                          {count}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex max-w-[280px] flex-wrap gap-1.5">
                            {plan.equipment_needed.length ? (
                              plan.equipment_needed.map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full bg-[#1E293B] px-2.5 py-1 text-[10px]"
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-[#64748B]">None</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-[#94A3B8]">
                          {plan.duration}
                        </td>
                        <td className="px-6 py-5 text-xs font-bold capitalize text-emerald-400">
                          {plan.status}
                        </td>
                        <td className="px-7 py-5">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() =>
                                navigate(
                                  `/plan-manager/${encodeURIComponent(plan.plan_id)}/edit`,
                                )
                              }
                              className="rounded-lg p-2 text-[#64748B] hover:bg-[#1E293B] hover:text-white"
                            >
                              <Edit3 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(plan)}
                              className="rounded-lg p-2 text-[#64748B] hover:bg-red-500/10 hover:text-red-400"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="py-20 text-center text-[#64748B]">
                      No plans found.
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

export default PlanManager;
