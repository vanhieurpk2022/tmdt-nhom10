export interface ScentNoteOption {
    id: number;
    tier: 1 | 2 | 3; // 1: Tầng 1 (Top Note), 2: Tầng 2 (Heart Note), 3: Tầng 3 (Base Note)
    name: string;
    description: string;
    color: string; // Mã màu hiển thị hòa sắc trong chai
    defaultRatio: number;
    extraPrice: number; // Phụ phí nguyên liệu quý hiếm / cao cấp
    origin?: string;
}

export interface BottleDesignOption {
    id: number;
    name: string;
    styleCode: string;
    title: string;
    description: string;
    bottleShape: "square" | "cylinder" | "apothecary";
    glassStyle: "amber" | "matte-noir" | "crystal-frost";
    capStyle: "gold-dropper" | "wood-cylinder" | "wax-seal";
    labelStyle: "minimal-clean" | "vintage-border" | "luxury-gold";
    extraPrice: number;
}

export interface VolumeOption {
    ml: number;
    label: string;
    sublabel: string;
    basePrice: number;
}

export const SCENT_NOTE_OPTIONS: ScentNoteOption[] = [
    // TẦNG 1: NỐT ĐẦU (Top Notes) - Đánh thức giác quan, thanh mát, tươi tắn
    {
        id: 101,
        tier: 1,
        name: "Cam Bergamot Đồng Nai",
        description: "Thanh khiết, tươi mát, kích hoạt năng lượng",
        color: "#fef08a",
        defaultRatio: 30,
        extraPrice: 0,
        origin: "Đồng Nai",
    },
    {
        id: 102,
        tier: 1,
        name: "Bưởi Da Xanh Bến Tre",
        description: "Ngọt thanh tự nhiên, sảng khoái và thanh lọc",
        color: "#fed7aa",
        defaultRatio: 30,
        extraPrice: 15000,
        origin: "Bến Tre",
    },
    {
        id: 103,
        tier: 1,
        name: "Bạc Hà Âu Chân Mây",
        description: "The mát bừng tỉnh, xua tan căng thẳng mệt mỏi",
        color: "#a7f3d0",
        defaultRatio: 30,
        extraPrice: 0,
        origin: "Lâm Đồng",
    },
    {
        id: 104,
        tier: 1,
        name: "Chanh Vàng Đà Lạt",
        description: "Aroma tươi sáng, đánh thức khứu giác ngay tức khắc",
        color: "#fef9c3",
        defaultRatio: 30,
        extraPrice: 10000,
        origin: "Đà Lạt",
    },
    {
        id: 105,
        tier: 1,
        name: "Quýt Hồng Lai Vung",
        description: "Hương vị họ cam quýt chín mọng, ấm áp và vui tươi",
        color: "#fdba74",
        defaultRatio: 30,
        extraPrice: 20000,
        origin: "Đồng Tháp",
    },
    {
        id: 106,
        tier: 1,
        name: "Gừng Tươi Cao Bằng",
        description: "Cay the ấm nồng, kích thích tuần hoàn và tinh thần",
        color: "#fde68a",
        defaultRatio: 30,
        extraPrice: 25000,
        origin: "Cao Bằng",
    },
    {
        id: 107,
        tier: 1,
        name: "Lá Trà Xanh Cầu Đất",
        description: "Thanh tao mộc mạc, tĩnh lặng sương sớm cao nguyên",
        color: "#bbf7d0",
        defaultRatio: 30,
        extraPrice: 30000,
        origin: "Đà Lạt",
    },
    {
        id: 108,
        tier: 1,
        name: "Bạch Đàn Chanh Hàm Yên",
        description: "Hương the nhẹ tươi mát, thanh lọc không gian",
        color: "#cbd5e1",
        defaultRatio: 30,
        extraPrice: 15000,
        origin: "Tuyên Quang",
    },

    // TẦNG 2: NỐT GIỮA (Heart Notes) - Trái tim & linh hồn mùi hương, quyến rũ, nồng nàn
    {
        id: 201,
        tier: 2,
        name: "Oải Hương Mộc Châu",
        description: "Thư giãn, cân bằng nhịp sinh học, ngủ ngon sâu giấc",
        color: "#ddd6fe",
        defaultRatio: 50,
        extraPrice: 0,
        origin: "Sơn La",
    },
    {
        id: 202,
        tier: 2,
        name: "Hoa Hồng Damask Sa Pa",
        description: "Quý phái, ngọt ngào tinh khiết, dưỡng tâm êm dịu",
        color: "#fbcfe8",
        defaultRatio: 50,
        extraPrice: 45000,
        origin: "Lào Cai",
    },
    {
        id: 203,
        tier: 2,
        name: "Hoa Nhài Tây Hồ Thượng Hạng",
        description: "Thanh tao, sâu lắng, nét đẹp quý phái truyền thống",
        color: "#fef3c7",
        defaultRatio: 50,
        extraPrice: 50000,
        origin: "Hà Nội",
    },
    {
        id: 204,
        tier: 2,
        name: "Sả Chanh Hoàng Liên Sơn",
        description: "Thảo mộc thanh tẩy, chống muỗi và xông phòng",
        color: "#d9f99d",
        defaultRatio: 50,
        extraPrice: 10000,
        origin: "Lai Châu",
    },
    {
        id: 205,
        tier: 2,
        name: "Ngọc Lan Tây (Ylang Ylang) Cần Thơ",
        description: "Say đắm gợi cảm, xoa dịu lo âu, thăng hoa cảm xúc",
        color: "#fef08a",
        defaultRatio: 50,
        extraPrice: 40000,
        origin: "Cần Thơ",
    },
    {
        id: 206,
        tier: 2,
        name: "Phong Lữ Thảo (Geranium) Đà Lạt",
        description: "Hòa quyện giữa hoa hồng và thảo mộc the nhẹ cân bằng",
        color: "#f472b6",
        defaultRatio: 50,
        extraPrice: 35000,
        origin: "Lâm Đồng",
    },
    {
        id: 207,
        tier: 2,
        name: "Hoa Sen Trắng Đồng Tháp",
        description: "Thanh tịnh thiền định, an yên cõi lòng, thuần khiết",
        color: "#f1f5f9",
        defaultRatio: 50,
        extraPrice: 60000,
        origin: "Đồng Tháp",
    },
    {
        id: 208,
        tier: 2,
        name: "Hương Thảo (Rosemary) Bảo Lộc",
        description: "Tăng khả năng tập trung, ghi nhớ và tư duy sáng tạo",
        color: "#86efac",
        defaultRatio: 50,
        extraPrice: 20000,
        origin: "Lâm Đồng",
    },

    // TẦNG 3: NỐT ĐÁY (Base Notes) - Lưu hương lâu bền, định hình cốt cách trầm ấm
    {
        id: 301,
        tier: 3,
        name: "Hoàng Đàn Atlas Lâm Viên",
        description: "Gỗ rừng đằm thắm, định hình cấu trúc hương sâu sắc",
        color: "#fde68a",
        defaultRatio: 20,
        extraPrice: 20000,
        origin: "Lâm Đồng",
    },
    {
        id: 302,
        tier: 3,
        name: "Đàn Hương Mysore Tinh Khiết",
        description: "Sang trọng đẳng cấp, tĩnh lặng, ấm nồng vương giả",
        color: "#fed7aa",
        defaultRatio: 20,
        extraPrice: 85000,
        origin: "Nhập khẩu tuyển chọn",
    },
    {
        id: 303,
        tier: 3,
        name: "Trầm Hương Rừng Quảng Nam",
        description: "Bảo vật linh thiêng, huyền bí, lưu hương trên 48 giờ",
        color: "#cbd5e1",
        defaultRatio: 20,
        extraPrice: 120000,
        origin: "Quảng Nam",
    },
    {
        id: 304,
        tier: 3,
        name: "Vani Madagascar Hữu Cơ",
        description: "Hậu vị béo ngậy ngọt ngào, mềm mại, bền lâu dịu dàng",
        color: "#fef3c7",
        defaultRatio: 20,
        extraPrice: 35000,
        origin: "Madagascar",
    },
    {
        id: 305,
        tier: 3,
        name: "Hổ Phách Hoàng Gia (Amber)",
        description: "Ấm áp mật ong, bọc màng hương cổ điển lộng lẫy",
        color: "#fb923c",
        defaultRatio: 20,
        extraPrice: 55000,
        origin: "Chiết xuất độc quyền",
    },
    {
        id: 306,
        tier: 3,
        name: "Hoắc Hương (Patchouli) Tây Nguyên",
        description: "Đất ẩm sau mưa, thảo mộc nguyên bản đầy ma mị",
        color: "#ca8a04",
        defaultRatio: 20,
        extraPrice: 30000,
        origin: "Gia Lai",
    },
    {
        id: 307,
        tier: 3,
        name: "Xạ Hương Trắng (White Musk)",
        description: "Mùi hương da thịt quyến rũ, trong trẻo và sạch sẽ",
        color: "#f8fafc",
        defaultRatio: 20,
        extraPrice: 65000,
        origin: "Hương liệu Pháp",
    },
];

export const BOTTLE_DESIGN_OPTIONS: BottleDesignOption[] = [
    {
        id: 1,
        name: "Mẫu 1",
        title: "Hổ Phách Hoàng Gia",
        styleCode: "BOTTLE-AMBER-DROP",
        description: "Chai thủy tinh màu mật ong ấm • Nắp vàng kim dropper cao cấp • Nhãn viền tối giản",
        bottleShape: "square",
        glassStyle: "amber",
        capStyle: "gold-dropper",
        labelStyle: "minimal-clean",
        extraPrice: 0,
    },
    {
        id: 2,
        name: "Mẫu 2",
        title: "Hắc Nguyệt Huyền Bí (Matte Noir)",
        styleCode: "BOTTLE-FROST-LUX",
        description: "Chai thủy tinh đen mờ khói lì sang trọng • Nắp vân gỗ mun sồi mộc • Nhãn ép kim vàng vương giả",
        bottleShape: "cylinder",
        glassStyle: "matte-noir",
        capStyle: "wood-cylinder",
        labelStyle: "luxury-gold",
        extraPrice: 35000,
    },
    {
        id: 3,
        name: "Mẫu 3",
        title: "Dược Liệu Cổ Điển (Apothecary)",
        styleCode: "BOTTLE-VINTAGE-SEAL",
        description: "Chai thủy tinh mờ sương cổ điển • Nắp triện sáp thủ công đỏ ruby • Nhãn phong cách cổ điển",
        bottleShape: "apothecary",
        glassStyle: "crystal-frost",
        capStyle: "wax-seal",
        labelStyle: "vintage-border",
        extraPrice: 50000,
    },
];

export const VOLUME_OPTIONS: VolumeOption[] = [
    { ml: 10, label: "10ml", sublabel: "Dùng thử", basePrice: 195000 },
    { ml: 30, label: "30ml", sublabel: "Tiêu chuẩn", basePrice: 385000 },
    { ml: 50, label: "50ml", sublabel: "Tiết kiệm", basePrice: 560000 },
];
