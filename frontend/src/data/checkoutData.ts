export interface PaymentMethod {
    id: "cod" | "vnpay";
    name: string;
    description: string;
    type: "cod" | "vnpay";
    selected?: boolean;
}

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
