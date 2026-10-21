import api from "./api";

// Kiểu dữ liệu của một địa chỉ người dùng
export interface AddressItem {
    id: number;
    recipentName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault: boolean;
}

// Kiểu dữ liệu gửi đi khi thêm hoặc sửa địa chỉ
export interface AddressPayload {
    recipentName: string;
    phoneNumber: string;
    street: string;
    ward: string;
    district: string;
    city: string;
    isDefault?: boolean;
}

interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}

// Dịch vụ gọi API quản lý sổ địa chỉ
export const addressService = {
    // Lấy danh sách địa chỉ của người dùng
    getAddresses: async (): Promise<AddressItem[]> => {
        const res = await api.get<ApiResponse<AddressItem[]>>("/user/addresses");
        return res.data.data;
    },

    // Thêm địa chỉ mới
    addAddress: async (payload: AddressPayload): Promise<AddressItem> => {
        const res = await api.post<ApiResponse<AddressItem>>("/user/addresses", payload);
        return res.data.data;
    },

    // Cập nhật địa chỉ theo ID
    updateAddress: async (id: number, payload: AddressPayload): Promise<AddressItem> => {
        const res = await api.put<ApiResponse<AddressItem>>(`/user/addresses/${id}`, payload);
        return res.data.data;
    },

    // Xóa địa chỉ theo ID
    deleteAddress: async (id: number): Promise<void> => {
        await api.delete<ApiResponse<void>>(`/user/addresses/${id}`);
    },

    // Đặt địa chỉ làm mặc định
    setDefaultAddress: async (id: number): Promise<void> => {
        await api.put<ApiResponse<void>>(`/user/addresses/${id}/default`);
    },
};
