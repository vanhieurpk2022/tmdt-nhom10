import api from "./api";
import type { LoginResponse, UserResponse } from "./AuthContext";
import type { RegisterRequest } from "./UserDto";

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

// Share only an in-flight lookup. No cached session survives login/logout or later checks.
let currentUserRequest: Promise<ApiResponse<UserResponse>> | null = null;



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

    getCurrentUser: () => {
        if (!currentUserRequest) {
            currentUserRequest = api.get<ApiResponse<UserResponse>>("/auth/me")
                .then(response => response.data)
                .finally(() => { currentUserRequest = null; });
        }
        return currentUserRequest;
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
    },

    loginWithGoogle: async (credential: string, rememberMe: boolean = false) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/auth/google",
            { credential, rememberMe }
        );
        return response.data;
    },

    loginWithFacebook: async (accessToken: string, rememberMe: boolean = false) => {
        const response = await api.post<ApiResponse<LoginResponse>>(
            "/auth/facebook",
            { accessToken, rememberMe }
        );
        return response.data;
    },

    forgotPassword: async (email: string) => {
        const response = await api.post<ApiResponse<void>>(
            "/auth/forgot-password",
            { email }
        );
        return response.data;
    },

    verifyRecoveryCode: async (email: string, code: string) => {
        const response = await api.post<ApiResponse<void>>(
            "/auth/verify-recovery-code",
            { email, code }
        );
        return response.data;
    },

    resetPassword: async (data: { email: string; code: string; newPassword: string; confirmPassword: string }) => {
        const response = await api.post<ApiResponse<void>>(
            "/auth/reset-password",
            data
        );
        return response.data;
    }
};
