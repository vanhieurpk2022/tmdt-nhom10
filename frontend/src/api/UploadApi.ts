// cloudinaryService.ts
import api from "./api";
import { type ApiResponse } from "./api";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB (khớp giới hạn gói free)
const ALLOWED = ["image/jpeg", "image/png", "application/pdf"];

interface UploadSignature {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
}

export interface UploadedAsset {
    url: string;
    publicId: string;
    resourceType: string; // "image" | "raw" | "video"
}

export const cloudinaryService = {
    // Xin chữ ký từ backend
    getSignature: async () => {
        const response = await api.get<ApiResponse<UploadSignature>>(
            "/uploads/signature"
        );

        return response.data;
    },

    // Upload thẳng lên Cloudinary (không đi qua axios nên dùng fetch)
    upload: async (file: File): Promise<UploadedAsset> => {
        if (file.size > MAX_SIZE) throw new Error(`"${file.name}" vượt quá 10MB`);
        if (!ALLOWED.includes(file.type)) throw new Error(`"${file.name}" sai định dạng`);

        const signatureRes = await cloudinaryService.getSignature();
        const sig = signatureRes.data;
        if (!sig) throw new Error("Không lấy được chữ ký upload");

        const fd = new FormData();
        fd.append("file", file);
        fd.append("api_key", sig.apiKey);
        fd.append("timestamp", String(sig.timestamp));
        fd.append("signature", sig.signature);
        fd.append("folder", sig.folder);

        const uploadRes = await fetch(
            `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
            { method: "POST", body: fd }
        );

        if (!uploadRes.ok) {
            const err = await uploadRes.json().catch(() => null);
            throw new Error(err?.error?.message ?? "Upload thất bại");
        }

        const json = await uploadRes.json();
        return {
            url: json.secure_url,
            publicId: json.public_id,
            resourceType: json.resource_type,
        };
    },

    // Xoá các file đã upload (backend giữ API Secret nên gọi qua backend)
    deleteUploads: async (assets: UploadedAsset[]) => {
        if (assets.length === 0) return;

        const response = await api.delete<ApiResponse<void>>(
            "/uploads/uploadsd",
            {
                data: assets.map(({ publicId, resourceType }) => ({
                    publicId,
                    resourceType,
                })),
            }
        );

        return response?.data;
    },
};