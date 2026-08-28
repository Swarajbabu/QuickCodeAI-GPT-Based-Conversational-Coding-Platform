const rawApiUrl = (import.meta.env.VITE_API_URL || "").trim();
export const API_BASE_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;
