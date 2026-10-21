import type { OrderStatus } from "../../enums/OrderStatus";

export interface FactoryOrderDashBoard {
    idOrder: number;       // 1. Mã đơn (VD: 1024 -> lên giao diện ghép thêm chữ #DH-)
    time: string;          // 2. Thời gian đặt (VD: "10 phút trước" hoặc "17/10/2026")
    userName: string;      // 3. Tên khách đặt / Tên Shop (VD: "Nguyễn Hoàng Nam")
    totalQuantity: number; // 4. [NÊN THÊM] Tổng số chai của cả đơn (VD: 200) -> Xưởng rất cần biết số lượng!
    price: number;         // 5. Tổng tiền đơn hàng (VD: 45000000)
    notes: string;         // 6. Ghi chú / Tóm tắt yêu cầu gia công (VD: "Làm gấp trước 25/10, 2 mùi gỗ & trà")
    status: OrderStatus;        // 7. [BẮT BUỘC THÊM] Trạng thái đơn (VD: "PENDING", "PROCESSING", "COMPLETED")
}