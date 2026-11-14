const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cleanBase = BASE_URL.replace(/\/+$/, "");
export const API_URL = cleanBase.endsWith("/api") ? cleanBase : `${cleanBase}/api`;

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || response.statusText || "Something went wrong");
  }

  return data;
}
