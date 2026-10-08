import api from "./api";
import type { LoginResponse, UserResponse } from "./AuthContext";
import type { RegisterRequest, RegisterResponse } from "./UserDto";

interface LoginRequest {
  email: string;
  password?: string;
  rememberMe: boolean;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}



export const authService = {
    login: async (data: LoginRequest) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/auth/login",
            data
        );

        return response.data;
    },

    logout: async () => {
        const response = await api.post<ApiResponse<void>>(
            "/auth/logout"
        );
        return response.data;
    },

    getCurrentUser: async () => {
        const response = await api.get<ApiResponse<UserResponse>>(
            "/auth/me"
        );

        return response.data;
    },
     register: async (data:RegisterRequest) => {
        const response = await api.post<ApiResponse<void>>(
            "/auth/register", data
        );

        return response.data;
    },
      resendEmail: async (email:string) => {
        const response = await api.post<ApiResponse<void>>
            ("/auth/resend", {email});

        return response.data;
    },
     verifyEmail: async (email:string,code:string) => {
        const response = await api.get<ApiResponse<void>>
            ("/auth/verify-email", {params:{email,code}});

        return response.data;
    }
};