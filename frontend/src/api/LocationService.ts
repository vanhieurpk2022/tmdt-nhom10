import api from "./api";

export interface LocationItem {
    code: number | string;
    name: string;
}

// Bộ nhớ cache tạm thời để tránh gọi API nhiều lần
const cache = {
    provinces: null as LocationItem[] | null,
    districts: new Map<string | number, LocationItem[]>(),
    wards: new Map<string | number, LocationItem[]>(),
};

/**
 * Chuẩn hóa tên địa danh: bỏ dấu tiếng Việt, chữ thường, loại bỏ tiền tố hành chính
 * (tỉnh, thành phố, quận, huyện, phường, xã,...) để so khớp chính xác với dữ liệu GHN
 */
export const normalizeLocationName = (value: string): string => {
    if (!value) return "";
    let str = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    str = str.replace(/đ/g, "d").replace(/Đ/g, "D");
    str = str.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
    const prefixes = [
        "thanh pho",
        "thi tran",
        "thi xa",
        "phuong",
        "huyen",
        "quan",
        "tinh",
        "xa",
        "tp",
    ];
    for (const prefix of prefixes) {
        const reg = new RegExp(`\\b${prefix}\\b`, "g");
        str = str.replace(reg, " ");
    }
    return str.replace(/\s+/g, " ").trim();
};

export const locationService = {
    /**
     * Lấy danh sách Tỉnh / Thành phố
     * Ưu tiên gọi backend (/shipping/provinces từ GHN). Nếu chưa cấu hình GHN token, tự động fallback sang Open API Việt Nam.
     */
    getProvinces: async (): Promise<LocationItem[]> => {
        if (cache.provinces && cache.provinces.length > 0) {
            return cache.provinces;
        }

        try {
            const res = await api.get<{ data: Array<{ provinceId?: number; ProvinceID?: number; provinceName?: string; ProvinceName?: string }> }>("/shipping/provinces");
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const list = res.data.data.map((p) => ({
                    code: p.provinceId ?? p.ProvinceID ?? 0,
                    name: p.provinceName ?? p.ProvinceName ?? "",
                }));
                cache.provinces = list;
                return list;
            }
        } catch {
            // Fallback sang API hành chính chuẩn Việt Nam nếu chưa cấu hình GHN Token
        }

        try {
            const response = await fetch("https://provinces.open-api.vn/api/p/");
            const data: Array<{ code: number; name: string }> = await response.json();
            const list = data.map((p) => ({
                code: p.code,
                name: p.name,
            }));
            cache.provinces = list;
            return list;
        } catch (error) {
            console.error("Lỗi khi tải danh sách Tỉnh / Thành phố:", error);
            return [];
        }
    },

    /**
     * Lấy danh sách Quận / Huyện theo Tỉnh / Thành phố
     */
    getDistricts: async (provinceCode: number | string): Promise<LocationItem[]> => {
        if (cache.districts.has(provinceCode)) {
            return cache.districts.get(provinceCode)!;
        }

        // Thử gọi backend GHN trước nếu code là số của GHN
        try {
            const res = await api.get<{ data: Array<{ districtId?: number; DistrictID?: number; districtName?: string; DistrictName?: string }> }>(
                `/shipping/districts?provinceId=${provinceCode}`
            );
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const list = res.data.data.map((d) => ({
                    code: d.districtId ?? d.DistrictID ?? 0,
                    name: d.districtName ?? d.DistrictName ?? "",
                }));
                cache.districts.set(provinceCode, list);
                return list;
            }
        } catch {
            // Fallback
        }

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
            const data: { districts?: Array<{ code: number; name: string }> } = await response.json();
            const list = (data.districts || []).map((d) => ({
                code: d.code,
                name: d.name,
            }));
            cache.districts.set(provinceCode, list);
            return list;
        } catch (error) {
            console.error("Lỗi khi tải danh sách Quận / Huyện:", error);
            return [];
        }
    },

    /**
     * Lấy danh sách Phường / Xã theo Quận / Huyện
     */
    getWards: async (districtCode: number | string): Promise<LocationItem[]> => {
        if (cache.wards.has(districtCode)) {
            return cache.wards.get(districtCode)!;
        }

        // Thử gọi backend GHN trước
        try {
            const res = await api.get<{ data: Array<{ wardCode?: string; WardCode?: string; wardName?: string; WardName?: string }> }>(
                `/shipping/wards?districtId=${districtCode}`
            );
            if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
                const list = res.data.data.map((w) => ({
                    code: w.wardCode ?? w.WardCode ?? "",
                    name: w.wardName ?? w.WardName ?? "",
                }));
                cache.wards.set(districtCode, list);
                return list;
            }
        } catch {
            // Fallback
        }

        try {
            const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
            const data: { wards?: Array<{ code: number; name: string }> } = await response.json();
            const list = (data.wards || []).map((w) => ({
                code: w.code,
                name: w.name,
            }));
            cache.wards.set(districtCode, list);
            return list;
        } catch (error) {
            console.error("Lỗi khi tải danh sách Phường / Xã:", error);
            return [];
        }
    },

    /**
     * Tìm item trong danh sách khớp nhất với tên (dùng khi nạp địa chỉ cũ để sửa)
     */
    findMatchingLocation: (items: LocationItem[], targetName: string): LocationItem | undefined => {
        if (!targetName || items.length === 0) return undefined;
        const normTarget = normalizeLocationName(targetName);
        if (!normTarget) return undefined;

        // Khớp tuyệt đối trước
        const exact = items.find((it) => normalizeLocationName(it.name) === normTarget);
        if (exact) return exact;

        // Khớp chứa nhau
        return items.find((it) => {
            const normCandidate = normalizeLocationName(it.name);
            return normCandidate.includes(normTarget) || normTarget.includes(normCandidate);
        });
    },
};
