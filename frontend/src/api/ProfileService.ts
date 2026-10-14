import api from "./api";

// Kiểu dữ liệu hồ sơ cá nhân người dùng
export interface UserProfile {
    id: number;
    fullname: string;
    email: string;
    phone: string | null;
    birthday: string | null;
    gender: string | null;
    preferredArea: string | null;
    avatarUrl: string | null;
    isVerify: boolean;
}

// Kiểu dữ liệu gửi đi khi cập nhật hồ sơ
export interface UpdateProfileRequest {
    fullname?: string;
    phone?: string;
    birthday?: string;
    gender?: string;
    preferredArea?: string;
    avatarUrl?: string;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// Dịch vụ gọi API quản lý hồ sơ người dùng
export const profileService = {
    /** Lấy thông tin hồ sơ của tài khoản đang đăng nhập */
    getProfile: async (): Promise<UserProfile> => {
        const res = await api.get<ApiResponse<UserProfile>>("/user/profile");
        return res.data.data;
    },

    /** Cập nhật thông tin hồ sơ người dùng */
    updateProfile: async (request: UpdateProfileRequest): Promise<UserProfile> => {
        const res = await api.put<ApiResponse<UserProfile>>("/user/profile", request);
        return res.data.data;
    },
};
