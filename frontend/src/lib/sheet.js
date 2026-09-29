import { apiFetch } from "./api.js";

/** Pull the 11-character video id out of any common YouTube URL form. */
export function extractYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1] ?? null;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return null;
}

export const topicsQuery = (includeInactive = false) => ({
  queryKey: ["topics", includeInactive],
  queryFn: async () => {
    const qs = includeInactive ? "?includeInactive=true" : "";
    return apiFetch(`/api/topics${qs}`);
  },
});

export const questionsQuery = (includeInactive = false) => ({
  queryKey: ["questions", includeInactive],
  queryFn: async () => {
    const qs = includeInactive ? "?includeInactive=true" : "";
    return apiFetch(`/api/questions${qs}`);
  },
});

export const progressQuery = (userId) => ({
  queryKey: ["progress", userId],
  queryFn: async () => {
    if (!userId) return new Set();
    const rows = await apiFetch("/api/progress");
    return new Set(rows.filter((row) => row.completed).map((row) => row.question_id));
  },
});

export async function setProgress(_userId, questionId, completed) {
  await apiFetch("/api/progress", {
    method: "PUT",
    body: JSON.stringify({ question_id: questionId, completed }),
  });
}

export async function fetchQuestion(questionId) {
  return apiFetch(`/api/questions/${questionId}`);
}

export async function createTopic(payload) {
  return apiFetch("/api/topics", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateTopic(id, payload) {
  return apiFetch(`/api/topics/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteTopic(id) {
  return apiFetch(`/api/topics/${id}`, { method: "DELETE" });
}

export async function createQuestion(payload) {
  return apiFetch("/api/questions", { method: "POST", body: JSON.stringify(payload) });
}

export async function updateQuestion(id, payload) {
  return apiFetch(`/api/questions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
}

export async function deleteQuestion(id) {
  return apiFetch(`/api/questions/${id}`, { method: "DELETE" });
}

export async function fetchAdminUsers() {
  return apiFetch("/api/admin/users");
}
