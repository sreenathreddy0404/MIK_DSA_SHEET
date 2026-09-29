const API_BASE = import.meta.env.VITE_API_URL || "";

function getToken() {
  try {
    return localStorage.getItem("dsa-token");
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem("dsa-token", token);
    else localStorage.removeItem("dsa-token");
  } catch {
    /* storage unavailable */
  }
}

export async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function getGoogleAuthUrl() {
  return `${API_BASE}/api/auth/google`;
}
