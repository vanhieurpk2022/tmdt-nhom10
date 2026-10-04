export type OrderStatus = "processing" | "shipping" | "completed" | "cancelled";

export interface OrderHistoryProduct {
    id: number;
    name: string;
    variant: string;
    image: string;
    quantity: number;
    price: number;
}

export interface OrderHistoryItem {
    id: string;
    code: string;
    createdAt: string;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    deliveryAddress: string;
    products: OrderHistoryProduct[];
    subtotal: number;
    discount: number;
    shippingFee: number;
}

export const orderStatusLabels: Record<OrderStatus, string> = {
    processing: "Đang xử lý",
    shipping: "Đang giao",
    completed: "Đã giao",
    cancelled: "Đã hủy",
};

export const orderHistoryItems: OrderHistoryItem[] = [
    {
        id: "1",
        code: "OLIA-20261004-018",
        createdAt: "04/10/2026, 19:58",
        status: "processing",
        paymentMethod: "Ví Momo",
        paymentStatus: "Đã thanh toán",
        deliveryAddress: "Landmark 81, Bình Thạnh, TP. Hồ Chí Minh",
        products: [
            {
                id: 1,
                name: "Tinh dầu Lavender Nguyên Chất",
                variant: "Dung tích: 10ml",
                image: "/images/home/lavender-france.png",
                quantity: 1,
                price: 350000,
            },
            {
                id: 2,
                name: "Tinh dầu Tràm Trà Tea Tree",
                variant: "Dung tích: 40ml",
                image: "/images/home/tea-tree-australia.png",
                quantity: 1,
                price: 450000,
            },
        ],
        subtotal: 800000,
        discount: 150000,
        shippingFee: 25000,
    },
    {
        id: "2",
        code: "OLIA-20260928-012",
        createdAt: "28/09/2026, 10:12",
        status: "shipping",
        paymentMethod: "Thẻ ngân hàng",
        paymentStatus: "Đã thanh toán",
        deliveryAddress: "Quận 3, TP. Hồ Chí Minh",
        products: [
            {
                id: 3,
                name: "Bộ khuếch tán hương thư giãn",
                variant: "Bộ sản phẩm",
                image: "/images/home/diffuser-combo.png",
                quantity: 1,
                price: 520000,
            },
        ],
        subtotal: 520000,
        discount: 50000,
        shippingFee: 25000,
    },
    {
        id: "3",
        code: "OLIA-20260914-006",
        createdAt: "14/09/2026, 21:30",
        status: "completed",
        paymentMethod: "COD",
        paymentStatus: "Đã thanh toán",
        deliveryAddress: "Thủ Đức, TP. Hồ Chí Minh",
        products: [
            {
                id: 4,
                name: "Tinh dầu Bưởi ép lạnh",
                variant: "Dung tích: 30ml",
                image: "/images/home/grapefruit-cold-pressed.png",
                quantity: 2,
                price: 285000,
            },
            {
                id: 5,
                name: "Nến sáp thiên nhiên",
                variant: "Hương hoa nhài",
                image: "/images/home/natural-wax-candle.png",
                quantity: 1,
                price: 260000,
            },
        ],
        subtotal: 830000,
        discount: 100000,
        shippingFee: 0,
    },
    {
        id: "4",
        code: "OLIA-20260822-003",
        createdAt: "22/08/2026, 09:05",
        status: "cancelled",
        paymentMethod: "Ví Momo",
        paymentStatus: "Đã hoàn tiền",
        deliveryAddress: "Quận 7, TP. Hồ Chí Minh",
        products: [
            {
                id: 6,
                name: "Hộp quà thư giãn Oilia",
                variant: "Gift box",
                image: "/images/home/relax-gift-box.png",
                quantity: 1,
                price: 690000,
            },
        ],
        subtotal: 690000,
        discount: 0,
        shippingFee: 0,
    },
];
