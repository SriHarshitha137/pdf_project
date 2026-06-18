
import axios from "axios";

const TOKEN_KEY = "pdfflow_token";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 responses — clear stale token
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      typeof window !== "undefined"
    ) {
      const token = localStorage.getItem(TOKEN_KEY);
      if (token) {
        localStorage.removeItem(TOKEN_KEY);
        // Redirect to signin if on a protected page
        if (
          !window.location.pathname.startsWith("/signin") &&
          !window.location.pathname.startsWith("/signup")
        ) {
          window.location.href = "/signin";
        }
      }
    }
    return Promise.reject(error);
  }
);