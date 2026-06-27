import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "https://stylehub-kveb.onrender.com/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends the refreshToken cookie
});

// Attach access token from memory/localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, try refreshing the access token once, then retry the original request
let isRefreshing = false;
let queue = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error;
    if (response?.status === 401 && !config._retry) {
      config._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, config });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", data.accessToken);
        queue.forEach((p) => {
          p.config.headers.Authorization = `Bearer ${data.accessToken}`;
          p.resolve(api(p.config));
        });
        queue = [];
        config.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(config);
      } catch (err) {
        localStorage.removeItem("accessToken");
        queue.forEach((p) => p.reject(err));
        queue = [];
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;
