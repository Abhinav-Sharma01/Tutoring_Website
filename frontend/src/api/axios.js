import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
const cleanUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

const instance = axios.create({
    baseURL: `${cleanUrl}/api`,
    withCredentials: true,
});

instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            if (originalRequest.url === '/auth/me') {
                return Promise.reject(error);
            }

            try {
                return instance(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
