const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8000/api/v1";

const parseResponse = async (response) => {
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
    throw new Error(`HTTP ${response.status}: ${message}`);
  }
  return body;
};

const request = async (path, options = {}, authenticated = false) => {
  const headers = new Headers(options.headers || {});
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (authenticated) {
    const token = localStorage.getItem("admin_access_token");
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    return await parseResponse(response);
  } catch (error) {
    console.error("[Admin API] Request failed", {
      path,
      method: options.method || "GET",
      message: error.message,
      error,
    });
    throw error;
  }
};

export const adminApi = {
  login: (email, password) =>
    request("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => request("/admin/me", {}, true),
  getDashboard: ({ granularity, startDate, endDate }) => {
    const params = new URLSearchParams({
      granularity,
      start_date: startDate,
      end_date: endDate,
    });
    return request(`/admin/dashboard?${params}`, {}, true);
  },
  getSubscriptions: () => request("/admin/subscriptions", {}, true),
  getUsers: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/users${suffix}`, {}, true);
  },
  grantEntitlement: (payload) =>
    request(
      "/admin/subscriptions/entitlements/grant",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  revokeEntitlement: (payload) =>
    request(
      "/admin/subscriptions/entitlements/revoke",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  updateProfile: (payload) =>
    request(
      "/admin/me",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true,
    ),
  updatePassword: (payload) =>
    request(
      "/admin/password",
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true,
    ),
  updateAvatar: (file) => {
    const body = new FormData();
    body.append("avatar", file);
    return request(
      "/admin/avatar",
      {
        method: "PUT",
        body,
      },
      true,
    );
  },
};

export const storeAdminSession = (authResponse) => {
  localStorage.setItem("admin_access_token", authResponse.access_token);
  localStorage.setItem("admin", JSON.stringify(authResponse.admin));
};

export const clearAdminSession = () => {
  localStorage.removeItem("admin_access_token");
  localStorage.removeItem("admin");
  localStorage.removeItem("adminProfile");
};

export const getStoredAdmin = () => {
  try {
    return JSON.parse(localStorage.getItem("admin"));
  } catch {
    return null;
  }
};
