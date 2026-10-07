import axios from "axios";
import type {
    AxiosInstance,
    AxiosError,
    AxiosResponse
} from "axios";

const api: AxiosInstance = axios.create({
    baseURL: "/api",
    timeout: 10000,
    headers: {
         "Content-Type": "application/json",
    },
    withCredentials: true,
});


// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },

    (error: AxiosError) => {

        if (
            error.response?.status === 401 &&
            window.location.pathname !== "/login"
        ) {
            localStorage.removeItem("user_info");

            const sessionExpiredEvent = new CustomEvent(
                "auth:session-expired",
                {
                    detail: {
                        message:
                            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!"
                    }
                }
            );

            window.dispatchEvent(sessionExpiredEvent);

            setTimeout(() => {
                window.location.href = "/login";
            }, 2500);
        }

        return Promise.reject(error);
    }
);

export default api;