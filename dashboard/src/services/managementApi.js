const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

const formatBytes = (bytes) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), 3);
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
};

const describeBody = (body) => {
  if (!(body instanceof FormData)) {
    return body ? { type: "json" } : { type: "none" };
  }

  const files = [];
  const fields = [];
  let totalFileBytes = 0;

  for (const [key, value] of body.entries()) {
    if (value instanceof File) {
      totalFileBytes += value.size;
      files.push({
        field: key,
        name: value.name,
        type: value.type || "unknown",
        sizeBytes: value.size,
        size: formatBytes(value.size),
      });
    } else {
      fields.push(key);
    }
  }

  return {
    type: "multipart/form-data",
    fields,
    files,
    totalFileBytes,
    totalFileSize: formatBytes(totalFileBytes),
  };
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;
  const url = `${API_BASE_URL}${path}`;
  const method = options.method || "GET";
  const requestBody = describeBody(options.body);

  if (options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }
  const adminToken = localStorage.getItem("admin_access_token");
  if (adminToken) {
    headers.set("Authorization", `Bearer ${adminToken}`);
  }

  console.info("[Management API] Request started", {
    url,
    method,
    requestBody,
  });

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    console.error("[Management API] Network request failed", {
      url,
      method,
      online: navigator.onLine,
      requestBody,
      likelyCause,
      errorName: networkError.name,
      errorMessage: networkError.message,
      error: networkError,
    });

    throw new Error(
      `Network request failed: See the browser console for full diagnostics.`,
      { cause: networkError },
    );
  }

  if (response.status === 204) return null;

  const rawBody = await response.text();
  let body = null;
  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    body = rawBody;
  }

  if (!response.ok) {
    const detail =
      typeof body === "object" && body !== null ? body.detail : body;
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(", ")
      : detail || response.statusText || "Request failed";
    const vercelError = response.headers.get("x-vercel-error");

    console.error("[Management API] HTTP request failed", {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      vercelError,
      vercelRequestId: response.headers.get("x-vercel-id"),
      contentType: response.headers.get("content-type"),
      requestBody,
      responseBody: body,
    });

    if (response.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin");
      if (window.location.pathname !== "/sign-in") {
        window.location.assign("/sign-in");
      }
    }

    throw new Error(
      `HTTP ${response.status}${vercelError ? ` ${vercelError}` : ""}: ${message}`,
    );
  }

  console.info("[Management API] Request completed", {
    url,
    method,
    status: response.status,
    vercelRequestId: response.headers.get("x-vercel-id"),
  });

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
