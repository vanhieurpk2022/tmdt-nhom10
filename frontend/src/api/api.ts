import axios from "axios";
import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";
 
const api: AxiosInstance = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});
 
// Các endpoint auth: 401 ở đây là bình thường (chưa đăng nhập / sai mật khẩu),
// KHÔNG được coi là "phiên hết hạn".
const AUTH_ENDPOINTS = [
    "/auth/me",
    "/auth/login",
    "/auth/logout",
    "/auth/register",
    "/auth/verify-email",
];
 
// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
 
    (error: AxiosError) => {
        const url = error.config?.url ?? "";
        const isAuthEndpoint = AUTH_ENDPOINTS.some((p) => url.includes(p));
 
        if (error.response?.status === 401 && !isAuthEndpoint) {
            // Chỉ báo cho app biết. AuthContext sẽ tự setUser(null).
            window.dispatchEvent(
                new CustomEvent("auth:session-expired", {
                    detail: {
                        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!",
                    },
                })
            );
        }
 
        return Promise.reject(error);
    }
);
 
export default api;