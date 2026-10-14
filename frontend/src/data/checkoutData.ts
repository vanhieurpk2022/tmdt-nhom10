export interface ReceiverInfo {
    name: string;
    phone: string;
    address: string;
    note: string;
}

export interface PaymentMethod {
    id: "cod" | "vnpay";
    name: string;
    description: string;
    type: "cod" | "vnpay";
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
        id: "cod",
        name: "Thanh toán khi nhận hàng (COD)",
        description: "Kiểm tra hàng và thanh toán tiền mặt khi nhận hàng",
        type: "cod",
        selected: true,
    },
    {
        id: "vnpay",
        name: "Thanh toán qua VNPay",
        description: "Thanh toán online an toàn bằng thẻ ATM, Visa, Mastercard hoặc mã QR VNPay",
        type: "vnpay",
    },
];

export const checkoutTotals = {
    discount: 150000,
    shippingFee: 25000,
};
