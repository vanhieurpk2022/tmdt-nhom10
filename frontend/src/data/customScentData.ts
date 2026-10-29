export interface ScentNoteOption {
    id: number;
    tier?: number | null;
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
