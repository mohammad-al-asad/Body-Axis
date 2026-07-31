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
  verifyLogin2fa: (payload) =>
    request("/admin/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify(payload),
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
  getContent: (slug) => request(`/admin/content/${slug}`, {}, true),
  updateContent: (slug, payload) =>
    request(
      `/admin/content/${slug}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true,
    ),
  getIntroductionContent: () =>
    request("/admin/content/introduction", {}, true),
  initiateIntroductionVideoMultipartUpload: (payload) =>
    request(
      "/admin/content/introduction/uploads/multipart/initiate",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  abortIntroductionVideoMultipartUpload: (payload) =>
    request(
      "/admin/content/introduction/uploads/multipart/abort",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  updateIntroductionContent: (payload) =>
    request(
      "/admin/content/introduction",
      {
        method: "PUT",
        body: payload,
      },
      true,
    ),
  getFaqs: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/faqs${suffix}`, {}, true);
  },
  createFaq: (payload) =>
    request(
      "/admin/faqs",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  updateFaq: (faqId, payload) =>
    request(
      `/admin/faqs/${faqId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true,
    ),
  deleteFaq: (faqId) =>
    request(
      `/admin/faqs/${faqId}`,
      {
        method: "DELETE",
      },
      true,
    ),
  getSupportMessages: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, value);
      }
    });
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return request(`/admin/support/messages${suffix}`, {}, true);
  },
  updateSupportMessage: (messageId, payload) =>
    request(
      `/admin/support/messages/${messageId}`,
      {
        method: "PUT",
        body: JSON.stringify(payload),
      },
      true,
    ),
  deleteSupportMessage: (messageId) =>
    request(
      `/admin/support/messages/${messageId}`,
      {
        method: "DELETE",
      },
      true,
    ),
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
  requestEnable2fa: () =>
    request(
      "/admin/2fa/setup/request",
      {
        method: "POST",
      },
      true,
    ),
  verifyEnable2fa: (payload) =>
    request(
      "/admin/2fa/setup/verify",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      true,
    ),
  requestDisable2fa: () =>
    request(
      "/admin/2fa/disable/request",
      {
        method: "POST",
      },
      true,
    ),
  verifyDisable2fa: (payload) =>
    request(
      "/admin/2fa/disable/verify",
      {
        method: "POST",
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
  getNotifications: () => request("/admin/notifications", {}, true),
  markNotificationRead: (id) =>
    request(`/admin/notifications/${id}/read`, { method: "PUT" }, true),
  markAllNotificationsRead: () =>
    request("/admin/notifications/read-all", { method: "PUT" }, true),
  deleteNotification: (id) =>
    request(`/admin/notifications/${id}`, { method: "DELETE" }, true),
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
