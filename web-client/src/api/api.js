import axios from "axios";
import { store } from "../store";
import { logout } from "../store/authSlice";

export const api = axios.create({
  baseURL: "https://vistasplus-api.vercel.app/api/v1",
  // baseURL: "http://localhost:8000/api/v1",
  // baseURL: "http://localhost:7000/api/v1",
  withCredentials: true,
});

let refreshPromise = null;

function isAuthRefreshSkipped(config) {
  const url = config?.url || "";
  return (
    url.includes("/users/login") ||
    url.includes("/users/register") ||
    url.includes("/users/refresh-token") ||
    url.includes("/users/logout")
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    if (status !== 401 || !original) {
      return Promise.reject(error);
    }

    if (original.skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (isAuthRefreshSkipped(original)) {
      return Promise.reject(error);
    }

    if (original._authRetry) {
      return Promise.reject(error);
    }

    original._authRetry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api
          .post(
            "/users/refresh-token",
            {},
            {
              withCredentials: true,
              skipAuthRefresh: true,
            },
          )
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return api(original);
    } catch (refreshErr) {
      store.dispatch(logout());
      return Promise.reject(refreshErr);
    }
  },
);
