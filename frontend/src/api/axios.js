import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "";
const cleanUrl = backendUrl.endsWith("/") ? backendUrl.slice(0, -1) : backendUrl;

const instance = axios.create({
    baseURL: `${cleanUrl}/api`,
    withCredentials: true,
});

export default instance;
