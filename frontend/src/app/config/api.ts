/**
 * API configuration - all backend URLs from env for easy deployment changes.
 * VITE_API_BASE_URL: backend base (e.g. https://hackmined.onrender.com or http://localhost:8000)
 * VITE_API_URL: full auth path (e.g. http://localhost:8000/api/auth) - used if VITE_API_BASE_URL not set
 */
const envBase = import.meta.env.VITE_API_BASE_URL;
const envAuth = import.meta.env.VITE_API_URL;

export const API_BASE_URL =
  (envBase && envBase.trim()) ||
  (envAuth ? envAuth.replace(/\/api\/auth\/?$/, "") : "") ||
  "http://localhost:8000";

export const API_AUTH_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/auth`;
export const API_ANALYZE_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/analyze`;
export const API_CHAT_URL = `${API_BASE_URL.replace(/\/$/, "")}/api/chat`;
