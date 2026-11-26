import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import AccountLayout from '../components/layout/AccountLayout';
import { useAuth } from '../api/AuthContext';
import { orderService, type OrderResponse } from '../api/OrderService';

const labels: Record<string, string> = {
  PENDING_PAYMENT: 'chờ thanh toán', PENDING: 'chờ xác nhận', CONFIRMED: 'đã xác nhận',
  PROCESSING: 'đang chuẩn bị', SHIPPED: 'đã bàn giao vận chuyển', DELIVERING: 'đang giao',
  DELIVERED: 'đã giao thành công', CANCELLED: 'đã hủy', RETURNED: 'đã trả lại', REFUNDED: 'đã hoàn tiền',
};
export default function NotificationsPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [read, setRead] = useState<string[]>([]);
  const [error, setError] = useState('');
  const key = 'oilia_read_orders_' + userId;
  useEffect(() => {
    let active = true;
    setOrders([]); setRead([]); setError('');
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) setRead(saved.filter((id): id is string => typeof id === 'string'));
    } catch { /* Đọc lại trạng thái từ đầu khi bộ nhớ không hợp lệ. */ }
    if (userId) void orderService.listOrders().then(result => {
      if (active) setOrders(result.orders);
    }).catch(() => { if (active) setError('Chưa lấy được cập nhật đơn hàng.'); });
    return () => { active = false; };
  }, [key, userId]);
  const notificationId = (order: OrderResponse) => order.id + ':' + order.status + ':' + order.paymentStatus;
  const markRead = (ids: string[]) => {
    const next = [...new Set([...read, ...ids])].slice(-200);
    setRead(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* Vẫn cập nhật giao diện. */ }
  };
  return <AccountLayout breadcrumbCurrent="Thông báo">
    <div className="bg-white rounded-4 p-4">
      <div className="d-flex justify-content-between align-items-center mb-4 gap-3">
        <h1 className="h4 mb-0">Cập nhật đơn hàng</h1>
        <button className="btn btn-light btn-sm" onClick={() => markRead(orders.map(notificationId))}>Đánh dấu đã đọc</button>
      </div>
      {error && <p role="alert" className="text-danger">{error}</p>}
      {!orders.length && !error && <p className="text-muted">Chưa có cập nhật đơn hàng.</p>}
      {orders.map(order => <Link key={order.id} to={'/orders/' + order.id}
        onClick={() => markRead([notificationId(order)])}
        className={'d-block p-3 mb-2 border rounded-3 text-decoration-none ' + (read.includes(notificationId(order)) ? 'text-secondary' : 'text-dark bg-light')}>
        <strong>Đơn #{order.id}</strong> {labels[order.status] || order.status}.
        <small className="d-block mt-1">{order.totalPrice.toLocaleString('vi-VN')}đ · {new Date(order.createdAt).toLocaleDateString('vi-VN')}</small>
      </Link>)}
    </div>
  </AccountLayout>;
}
