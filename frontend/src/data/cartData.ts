export interface CartItem {
    id: number;
    name: string;
    variant: string;
    origin: string;
    price: number;
    quantity: number;
    selected: boolean;
    image: string;
}

export const cartItems: CartItem[] = [
    {
        id: 1,
        name: "Tinh dầu Lavender Nguyên Chất",
        variant: "Dung tích: 10ml",
        origin: "Xuất xứ: Pháp",
        price: 350000,
        quantity: 1,
        selected: true,
        image: "/images/home/lavender-france.png",
    },
    {
        id: 2,
        name: "Tinh dầu Tràm Trà Tea Tree",
        variant: "Dung tích: 40ml",
        origin: "Xuất xứ: Pháp",
        price: 450000,
        quantity: 1,
        selected: true,
        image: "/images/home/tea-tree-australia.png",
    },
    {
        id: 3,
        name: "Tinh dầu Ô liu",
        variant: "Dung tích: 20ml",
        origin: "Xuất xứ: Pháp",
        price: 750000,
        quantity: 1,
        selected: false,
        image: "/images/home/ylang-ylang.png",
    },
];
