const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.detail;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || "Something went wrong";
    throw new Error(message);
  }

  return body;
}

export const managementApi = {
  listVideos: (search = "") =>
    request(`/videos?limit=200&search=${encodeURIComponent(search)}`),
  getVideo: (id) => request(`/videos/${encodeURIComponent(id)}`),
  createVideo: (formData) =>
    request("/videos", { method: "POST", body: formData }),
  updateVideo: (id, formData) =>
    request(`/videos/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: formData,
    }),
  deleteVideo: (id) =>
    request(`/videos/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listExercises: (search = "", phase = "") => {
    const params = new URLSearchParams({ limit: "200", search });
    if (phase) params.set("phase", phase);
    return request(`/exercises?${params}`);
  },
  getExercise: (id) => request(`/exercises/${encodeURIComponent(id)}`),
  createExercise: (payload) =>
    request("/exercises", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateExercise: (id, payload) =>
    request(`/exercises/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteExercise: (id) =>
    request(`/exercises/${encodeURIComponent(id)}`, { method: "DELETE" }),

  listPlans: (search = "") =>
    request(`/plans?limit=200&search=${encodeURIComponent(search)}`),
  getPlan: (id) => request(`/plans/${encodeURIComponent(id)}`),
  createPlan: (payload) =>
    request("/plans", { method: "POST", body: JSON.stringify(payload) }),
  updatePlan: (id, payload) =>
    request(`/plans/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deletePlan: (id) =>
    request(`/plans/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
