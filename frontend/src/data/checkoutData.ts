export interface ReceiverInfo {
    name: string;
    phone: string;
    address: string;
    note: string;
}

export interface PaymentMethod {
    id: string;
    name: string;
    description: string;
    type: "momo" | "card" | "qr" | "cod";
    selected?: boolean;
}

export const receiverInfo: ReceiverInfo = {
    name: "Nguyễn Minh Hậu",
    phone: "0912 345 678",
    address: "Tầng 5, Tòa nhà Landmark 81, 720A Điện Biên Phủ, Phường 22, Quận Bình Thạnh, TP. Hồ Chí Minh",
    note: "Giao trong giờ hành chính, gọi trước khi đến",
};

export const paymentMethods: PaymentMethod[] = [
    {
        id: "momo",
        name: "Ví Momo",
        description: "Thanh toán nhanh chóng và an toàn qua ví điện tử Momo",
        type: "momo",
        selected: true,
    },
    {
        id: "bank-card",
        name: "Thẻ ngân hàng (ATM / Visa / Mastercard)",
        description: "Thẻ nội địa NAPAS và thẻ quốc tế Visa, Master",
        type: "card",
    },
    {
        id: "vietqr",
        name: "Chuyển khoản QR code (VietQR)",
        description: "Quét mã QR tự động xác nhận qua app ngân hàng",
        type: "qr",
    },
    {
        id: "cod",
        name: "Thanh toán khi nhận hàng (COD)",
        description: "Kiểm tra hàng và thanh toán tiền mặt cho bưu tá",
        type: "cod",
    },
];

export const checkoutTotals = {
    discount: 150000,
    shippingFee: 25000,
};
