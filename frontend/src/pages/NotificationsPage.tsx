import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faBox, faTag, faCheckDouble, faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import AccountLayout from "../components/layout/AccountLayout";

const MOCK_NOTIFICATIONS = [
    {
        id: 1,
        title: "Đơn hàng #DH-827364 đang được giao",
        message: "Đơn hàng của bạn đã được giao cho đơn vị vận chuyển Giao Hàng Nhanh. Vui lòng giữ điện thoại để nhận hàng.",
        time: "2 giờ trước",
        type: "order",
        isRead: false
    },
    {
        id: 2,
        title: "Ưu đãi cực HOT tháng 11",
        message: "Nhập mã OLLANATURAL giảm ngay 50K cho đơn hàng từ 300K. Số lượng có hạn, mua ngay kẻo lỡ!",
        time: "1 ngày trước",
        type: "promo",
        isRead: false
    },
    {
        id: 3,
        title: "Giao hàng thành công",
        message: "Đơn hàng #DH-812345 đã được giao thành công. Hãy đánh giá sản phẩm để nhận được thêm điểm thưởng Olla Rewards nhé.",
        time: "3 ngày trước",
        type: "order",
        isRead: true
    },
    {
        id: 4,
        title: "Chào mừng bạn đến với Olla",
        message: "Cảm ơn bạn đã đăng ký tài khoản. Hãy khám phá thế giới hương thơm tinh tế và nhận ngay voucher giảm 10% cho đơn hàng đầu tiên.",
        time: "1 tuần trước",
        type: "system",
        isRead: true
    }
];

export default function NotificationsPage() {
    const getIconForType = (type: string) => {
        switch (type) {
            case 'order': return { icon: faBox, color: 'text-primary', bg: 'bg-primary' };
            case 'promo': return { icon: faTag, color: 'text-danger', bg: 'bg-danger' };
            case 'system': return { icon: faCircleInfo, color: 'text-info', bg: 'bg-info' };
            default: return { icon: faBell, color: 'text-secondary', bg: 'bg-secondary' };
        }
    }

    return (
        <AccountLayout breadcrumbCurrent="Thông báo">
            <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h1 className="h3 fw-bold text-dark mb-2">Thông báo của bạn</h1>
                        <p className="text-muted fs-7 mb-0">Cập nhật những thông tin mới nhất về đơn hàng và ưu đãi.</p>
                    </div>
                    <button className="btn btn-light fw-bold fs-7 d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faCheckDouble} className="text-primary" />
                        Đánh dấu đã đọc tất cả
                    </button>
                </div>

                <div className="d-flex flex-column gap-3">
                    {MOCK_NOTIFICATIONS.map((noti) => {
                        const style = getIconForType(noti.type);
                        return (
                            <div
                                key={noti.id}
                                className={`p-4 rounded-4 border transition-all d-flex gap-3 ${!noti.isRead ? 'bg-primary bg-opacity-10 border-primary border-opacity-25' : 'bg-white'}`}
                                style={{ cursor: "pointer" }}
                            >
                                <div className={`${style.bg} text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0`} style={{ width: "48px", height: "48px" }}>
                                    <FontAwesomeIcon icon={style.icon} className="fs-5" />
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h5 className={`fs-6 mb-0 ${!noti.isRead ? 'fw-bold text-dark' : 'fw-semibold text-dark'}`}>{noti.title}</h5>
                                        <span className="text-muted fs-8 text-nowrap ms-2">{noti.time}</span>
                                    </div>
                                    <p className={`mb-0 fs-7 ${!noti.isRead ? 'text-dark' : 'text-muted'}`}>{noti.message}</p>
                                </div>
                                {!noti.isRead && (
                                    <div className="d-flex align-items-center ms-2">
                                        <div className="bg-primary rounded-circle shadow-sm" style={{ width: "12px", height: "12px" }}></div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </AccountLayout>
    );
}
