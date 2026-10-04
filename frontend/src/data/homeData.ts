export interface HomeProduct {
    id: number;
    name: string;
    category: string;
    description: string;
    image: string;
    price: number;
    oldPrice?: number;
    unit: string;
    rating: number;
    reviews: number;
    tag?: string;
    soldPercent?: number;
}

export interface PromoBanner {
    title: string;
    eyebrow: string;
    description: string;
    image: string;
    actionLabel: string;
    accent: "gold" | "mint";
}

const imageBase = "/images/home";

export const searchSuggestions = [
    "Ngủ ngon",
    "Đuổi muỗi",
    "Trị liệu stress",
    "Sả Java",
    "Máy khuếch tán gốm",
];

export const flashSaleProducts: HomeProduct[] = [
    {
        id: 1,
        name: "Tinh Dầu Lavender Pháp",
        category: "Thảo mộc thư giãn",
        description: "Hương oải hương thanh dịu giúp thư giãn trước giấc ngủ.",
        image: `${imageBase}/lavender-france.png`,
        price: 132000,
        oldPrice: 220000,
        unit: "10ml",
        rating: 4.9,
        reviews: 128,
        soldPercent: 68,
    },
    {
        id: 2,
        name: "Tinh Dầu Vỏ Bưởi Ép Lạnh",
        category: "Hương cam chanh",
        description: "Mùi hương tươi sáng, nâng tinh thần và làm mới không gian.",
        image: `${imageBase}/grapefruit-cold-pressed.png`,
        price: 132000,
        oldPrice: 225000,
        unit: "10ml",
        rating: 4.8,
        reviews: 96,
        soldPercent: 54,
    },
    {
        id: 3,
        name: "Tinh Dầu Tràm Trà Úc",
        category: "Kháng khuẩn tự nhiên",
        description: "Thanh lọc không khí, phù hợp cho góc làm việc và phòng ngủ.",
        image: `${imageBase}/tea-tree-australia.png`,
        price: 146000,
        oldPrice: 250000,
        unit: "10ml",
        rating: 4.9,
        reviews: 84,
        soldPercent: 72,
    },
    {
        id: 4,
        name: "Bạc Hà Nhật Peppermint",
        category: "Hương mát tỉnh táo",
        description: "Cảm giác mát sạch, hỗ trợ tập trung khi học tập và làm việc.",
        image: `${imageBase}/ylang-ylang.png`,
        price: 126000,
        oldPrice: 190000,
        unit: "10ml",
        rating: 4.8,
        reviews: 73,
        soldPercent: 61,
    },
];

export const newestProducts: HomeProduct[] = [
    {
        id: 5,
        name: "Tinh Dầu Deep Sleep 10ml",
        category: "Blend thư giãn",
        description: "Hỗn hợp dịu nhẹ cho nghi thức ngủ sâu mỗi tối.",
        image: `${imageBase}/deep-sleep-blend.png`,
        price: 245000,
        unit: "10ml",
        rating: 4.9,
        reviews: 42,
        tag: "Mới",
    },
    {
        id: 6,
        name: "Nến Thơm Rừng Thông Đà Lạt",
        category: "Nến thơm thiên nhiên",
        description: "Sáp thực vật và hương gỗ thông ấm áp.",
        image: `${imageBase}/natural-wax-candle.png`,
        price: 430000,
        unit: "180g",
        rating: 4.7,
        reviews: 31,
        tag: "Mới",
    },
    {
        id: 7,
        name: "Tinh Dầu Hoa Nhài Sambac",
        category: "Hương hoa cao cấp",
        description: "Mùi hoa nhài sâu, mềm và sang trọng.",
        image: `${imageBase}/jasmine-sambac.png`,
        price: 290000,
        unit: "10ml",
        rating: 4.9,
        reviews: 64,
        tag: "Mới",
    },
    {
        id: 8,
        name: "Xịt Đuổi Muỗi Oải Hương",
        category: "Chăm sóc gia đình",
        description: "Hương thảo mộc dễ chịu cho không gian sinh hoạt.",
        image: `${imageBase}/lavender-france.png`,
        price: 185000,
        unit: "100ml",
        rating: 4.6,
        reviews: 28,
        tag: "Mới",
    },
];

export const bestSellerProducts: HomeProduct[] = [
    {
        id: 9,
        name: "Tinh Dầu Sả Chanh Lemongrass Ấn Độ",
        category: "Hương tươi mát",
        description: "Làm sạch mùi, tạo cảm giác thoáng đãng cho căn phòng.",
        image: `${imageBase}/jasmine-sambac.png`,
        price: 145000,
        unit: "10ml",
        rating: 4.9,
        reviews: 214,
    },
    {
        id: 10,
        name: "Tinh Dầu Bạc Hà Peppermint",
        category: "Hương mát tỉnh táo",
        description: "Lựa chọn bán chạy cho bàn học và phòng làm việc.",
        image: `${imageBase}/ylang-ylang.png`,
        price: 160000,
        unit: "10ml",
        rating: 5,
        reviews: 182,
    },
    {
        id: 11,
        name: "Tinh Dầu Tràm Gió Hội An",
        category: "Thảo mộc Việt Nam",
        description: "Nốt hương ấm, sạch và thân thuộc.",
        image: `${imageBase}/tea-tree-australia.png`,
        price: 125000,
        unit: "10ml",
        rating: 4.9,
        reviews: 156,
    },
    {
        id: 12,
        name: "Tinh Dầu Vỏ Quýt Mật Ong Yên Bái",
        category: "Hương cam chanh",
        description: "Ngọt nhẹ, tươi vui, phù hợp phòng khách.",
        image: `${imageBase}/grapefruit-cold-pressed.png`,
        price: 155000,
        unit: "10ml",
        rating: 4.8,
        reviews: 138,
    },
];

export const promoBanners: PromoBanner[] = [
    {
        eyebrow: "Tiết kiệm đến 35%",
        title: "Combo Máy Xông Siêu Âm & Tinh Dầu Trị Liệu",
        description: "Tặng kèm 2 chai tinh dầu tự chọn khi mua máy khuếch tán gốm mộc cao cấp.",
        image: `${imageBase}/diffuser-combo.png`,
        actionLabel: "Xem ưu đãi combo",
        accent: "gold",
    },
    {
        eyebrow: "Bộ quà tặng sang trọng",
        title: "Hộp Quà Thơm Chữa Lành Cho Người Thương",
        description: "Thiết kế hộp gỗ mộc tinh xảo, thiệp viết tay theo yêu cầu cá nhân.",
        image: `${imageBase}/relax-gift-box.png`,
        actionLabel: "Khám phá bộ sưu tập quà",
        accent: "mint",
    },
];

export const commitments = [
    {
        icon: "leaf",
        title: "100% Thuần Khiết",
        description: "Chuẩn organic tự nhiên có kiểm định COA",
    },
    {
        icon: "flask",
        title: "Không Hương Liệu Giả",
        description: "Không cồn, không paraben, không hóa chất",
    },
    {
        icon: "recycle",
        title: "Bảo Vệ Sinh Thái",
        description: "Bao bì thủy tinh tái chế và giấy kraft",
    },
    {
        icon: "shield",
        title: "Đổi Trả An Tâm",
        description: "Bảo hành 1 đổi 1 trong 14 ngày nếu không ưng ý",
    },
];
