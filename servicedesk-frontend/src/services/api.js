import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            const currentPath = window.location.pathname;
            // Only redirect to login if we're not already on login or register
            if (currentPath !== "/login" && currentPath !== "/register") {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/login?sessionExpired=true";
            }
        }
        return Promise.reject(error);
    }
);

export default api;