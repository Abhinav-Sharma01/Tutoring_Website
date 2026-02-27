import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
const cleanUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

const instance = axios.create({
    baseURL: `${cleanUrl}/api`,
    withCredentials: true,
});

// Add a response interceptor to handle 401s globally
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't already retried this specific request
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // Optional: You can put a specific check here to avoid infinite loops if the refresh itself is 401
            if (originalRequest.url === '/auth/me') {
                // Return immediately if the initial check fails to let the frontend know we are truly logged out
                return Promise.reject(error);
            }

            try {
                // The backend auth.middleware.js automatically issues new accessTokens when the old one expires
                // as long as the strictly set refreshToken cookie is valid. 
                // By simply retrying the same original request, the backend middleware will dynamically re-mint 
                // the accessToken and attach it to the new response, keeping the user seamlessly logged in.

                // We just need to force the original request through one more time
                return instance(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default instance;
