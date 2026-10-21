const statusViews: Record<string, { label: string; description: string }> = {
    PENDING_PAYMENT: { label: "Chờ thanh toán", description: "Đơn hàng đang chờ xác nhận thanh toán qua VNPay." },
    PENDING: { label: "Chờ xác nhận", description: "Oilia đã tiếp nhận đơn hàng và đang chờ cửa hàng xác nhận." },
    CONFIRMED: { label: "Đã xác nhận", description: "Cửa hàng đã xác nhận đơn hàng của bạn." },
    PROCESSING: { label: "Đang chuẩn bị", description: "Cửa hàng đang chuẩn bị sản phẩm để giao." },
    SHIPPED: { label: "Đã bàn giao vận chuyển", description: "Đơn hàng đã được bàn giao cho đơn vị vận chuyển." },
    DELIVERING: { label: "Đang giao hàng", description: "Đơn vị vận chuyển đang giao đơn hàng của bạn." },
    DELIVERED: { label: "Đã giao hàng", description: "Đơn hàng đã được giao thành công." },
    CANCELLED: { label: "Đã hủy đơn hàng", description: "Đơn hàng đã bị hủy. Vui lòng kiểm tra riêng trạng thái thanh toán nếu bạn đã trả tiền." },
    RETURNED: { label: "Đã hoàn trả", description: "Đơn hàng đã được hoàn trả. Kết quả hoàn tiền được thể hiện ở trạng thái thanh toán." },
    REFUNDED: { label: "Đã hoàn tiền", description: "Đơn hàng đã được ghi nhận hoàn tiền." },
};

export function getOrderStatusView(status: string) {
    return statusViews[status] ?? { label: "Đang cập nhật", description: "Vui lòng kiểm tra lại trạng thái đơn hàng sau." };
}

const progressIndex: Record<string, number> = {
    PENDING: 0, CONFIRMED: 1, PROCESSING: 2, SHIPPED: 3, DELIVERING: 3, DELIVERED: 4,
};
const progressSteps = [
    { title: "Đã tiếp nhận đơn hàng", description: "Thông tin đặt hàng đã được lưu." },
    { title: "Cửa hàng xác nhận", description: "Cửa hàng kiểm tra và xác nhận đơn." },
    { title: "Chuẩn bị sản phẩm", description: "Đóng gói sản phẩm để vận chuyển." },
    { title: "Vận chuyển", description: "Bàn giao và giao sản phẩm đến người nhận." },
    { title: "Giao hàng thành công", description: "Đơn hàng được giao đến người nhận." },
];

export function getOrderProgress(status: string) {
    const current = progressIndex[status];
    if (current === undefined) {
        const view = getOrderStatusView(status);
        return [{ title: view.label, description: view.description, active: true }];
    }
    return progressSteps.map((step, index) => ({ ...step, active: index <= current }));
}
