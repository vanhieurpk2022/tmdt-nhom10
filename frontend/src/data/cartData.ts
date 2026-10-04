export interface CartItem {
    id: number;
    name: string;
    variant: string;
    origin: string;
    factoryName: string;
    factoryCode: string;
    price: number;
    quantity: number;
    selected: boolean;
    image: string;
    inStock: boolean;
}

export const cartItems: CartItem[] = [
    {
        id: 1,
        name: "Tinh dầu Lavender Nguyên Chất",
        variant: "Dung tích: 10ml",
        origin: "Xuất xứ: Pháp",
        factoryName: "Provence Botanicals (Pháp)",
        factoryCode: "PB-FR-02",
        price: 350000,
        quantity: 1,
        selected: true,
        image: "/images/home/lavender-france.png",
        inStock: true,
    },
    {
        id: 2,
        name: "Tinh dầu Tràm Trà Tea Tree",
        variant: "Dung tích: 40ml",
        origin: "Xuất xứ: Pháp",
        factoryName: "Dược liệu Organic Grasse",
        factoryCode: "OG-FR-11",
        price: 450000,
        quantity: 1,
        selected: true,
        image: "/images/home/tea-tree-australia.png",
        inStock: true,
    },
    {
        id: 3,
        name: "Tinh dầu Ô liu",
        variant: "Dung tích: 30ml",
        origin: "Xuất xứ: Pháp",
        factoryName: "Huilerie du Sud",
        factoryCode: "HS-FR-07",
        price: 750000,
        quantity: 1,
        selected: false,
        image: "/images/home/ylang-ylang.png",
        inStock: true,
    },
];
