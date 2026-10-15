export interface ScentNoteOption {
    id: number;
    tier: 1 | 2 | 3; // 1: Tầng 1 (Top Note), 2: Tầng 2 (Heart Note), 3: Tầng 3 (Base Note)
    name: string;
    description: string;
    color: string; // Mã màu hiển thị hòa sắc trong chai
    defaultRatio: number;
}

export interface BottleDesignOption {
    id: number;
    name: string;
    styleCode: string;
    description: string;
    bottleShape: "square" | "cylinder" | "apothecary";
    previewUrl?: string;
}

export interface VolumeOption {
    ml: number;
    label: string;
    sublabel: string;
    basePrice: number;
}

export const SCENT_NOTE_OPTIONS: ScentNoteOption[] = [
    // TẦNG 1: NỐT ĐẦU (Top Notes) - Thanh khiết, sảng khoái, đánh thức khứu giác
    {
        id: 101,
        tier: 1,
        name: "Cam Bergamot Đồng Nai",
        description: "Thanh khiết, tươi mát, nâng mood tức thì",
        color: "#fef08a",
        defaultRatio: 30,
    },
    {
        id: 102,
        tier: 1,
        name: "Bưởi Da Xanh Bến Tre",
        description: "Ngọt thanh tự nhiên, sảng khoái tinh thần",
        color: "#fed7aa",
        defaultRatio: 30,
    },
    {
        id: 103,
        tier: 1,
        name: "Bạc Hà Âu Chân Mây",
        description: "The mát bừng tỉnh, xua tan căng thẳng",
        color: "#bbf7d0",
        defaultRatio: 30,
    },
    {
        id: 104,
        tier: 1,
        name: "Chanh Vàng Đà Lạt",
        description: "Aroma tươi sáng, lọc sạch không khí",
        color: "#fef9c3",
        defaultRatio: 30,
    },

    // TẦNG 2: NỐT GIỮA (Heart Notes) - Linh hồn mùi hương, thư giãn, đằm thắm
    {
        id: 201,
        tier: 2,
        name: "Oải Hương Mộc Châu",
        description: "Thư giãn, cân bằng nhịp sinh học, ngủ ngon",
        color: "#ddd6fe",
        defaultRatio: 50,
    },
    {
        id: 202,
        tier: 2,
        name: "Hoa Hồng Damask Sa Pa",
        description: "Quyến rũ, ngọt ngào, xoa dịu cảm xúc",
        color: "#fbcfe8",
        defaultRatio: 50,
    },
    {
        id: 203,
        tier: 2,
        name: "Hoa Nhài Tây Hồ",
        description: "Thanh tao, tinh tế, lưu luyến sâu sắc",
        color: "#fef3c7",
        defaultRatio: 50,
    },
    {
        id: 204,
        tier: 2,
        name: "Sả Chanh Hoàng Liên Sơn",
        description: "Thảo mộc thanh lọc, kháng khuẩn tự nhiên",
        color: "#d9f99d",
        defaultRatio: 50,
    },

    // TẦNG 3: NỐT ĐÁY (Base Notes) - Lưu hương lâu, định hình cấu trúc, trầm ấm
    {
        id: 301,
        tier: 3,
        name: "Hoàng Đàn Atlas Lâm Viên",
        description: "Trầm lắng, định hình cấu trúc hương",
        color: "#fde68a",
        defaultRatio: 20,
    },
    {
        id: 302,
        tier: 3,
        name: "Đàn Hương Mysore Tinh Khiết",
        description: "Ấm áp, sang trọng, chiều sâu tĩnh lặng",
        color: "#fed7aa",
        defaultRatio: 20,
    },
    {
        id: 303,
        tier: 3,
        name: "Trầm Hương Rừng Quảng Nam",
        description: "Huyền bí, quý phái, lưu hương trên 24 giờ",
        color: "#e2e8f0",
        defaultRatio: 20,
    },
    {
        id: 304,
        tier: 3,
        name: "Vani Madagascar Hữu Cơ",
        description: "Hậu vị ngọt ngào, mềm mại, bền lâu",
        color: "#fef3c7",
        defaultRatio: 20,
    },
];

export const BOTTLE_DESIGN_OPTIONS: BottleDesignOption[] = [
    {
        id: 1,
        name: "Mẫu 1",
        styleCode: "BOTTLE-AMBER-DROP",
        description: "Chai thủy tinh hổ phách nắp nhỏ giọt • Khắc laser độc bản",
        bottleShape: "square",
    },
    {
        id: 2,
        name: "Mẫu 2",
        styleCode: "BOTTLE-FROST-LUX",
        description: "Chai thủy tinh mờ sương tối giản • Nắp gỗ mun tự nhiên",
        bottleShape: "cylinder",
    },
    {
        id: 3,
        name: "Mẫu 3",
        styleCode: "BOTTLE-VINTAGE-SEAL",
        description: "Chai dược liệu cổ điển • Triện sáp thủ công truyền thống",
        bottleShape: "apothecary",
    },
];

export const VOLUME_OPTIONS: VolumeOption[] = [
    { ml: 10, label: "10ml", sublabel: "Dùng thử", basePrice: 195000 },
    { ml: 30, label: "30ml", sublabel: "Tiêu chuẩn", basePrice: 385000 },
    { ml: 50, label: "50ml", sublabel: "Tiết kiệm", basePrice: 560000 },
];
