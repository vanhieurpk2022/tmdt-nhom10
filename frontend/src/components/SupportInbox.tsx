import { useEffect, useState, type FormEvent } from 'react';
import api from '../api/api';
import { getPurchaseErrorMessage } from '../api/CheckoutSelection';

interface Ticket {
  id: number; orderId: number; title: string; message: string; reply: string | null;
  customerName: string; factoryName: string; status: string; createdAt: string;
}
const labels: Record<string, string> = { PENDING: 'Chờ xử lý', PROCESSING: 'Đang xử lý', RESOLVED: 'Đã giải quyết', CLOSED: 'Đã đóng' };

export default function SupportInbox({ mode }: { mode: 'customer' | 'admin' | 'factory' }) {
  const endpoint = mode === 'customer' ? '/support/tickets' : mode === 'admin' ? '/admin/support/tickets' : '/manager/support/tickets';
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('PROCESSING');
  useEffect(() => {
    let active = true;
    void api.get<{ data: Ticket[] }>(endpoint).then(r => { if (active) setTickets(r.data.data); })
      .catch(() => { if (active) setError('Chưa tải được yêu cầu hỗ trợ.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    const form = event.currentTarget;
    try {
      if (mode === 'customer') {
        const values = new FormData(form);
        await api.post('/support/tickets', { orderId: Number(values.get('orderId')), title: values.get('title'), message: values.get('message') });
        form.reset();
      } else if (selected) {
        await api.patch(endpoint + '/' + selected.id, { reply, status });
        setSelected(null);
      }
      const response = await api.get<{ data: Ticket[] }>(endpoint);
      setTickets(response.data.data);
    } catch (error) { setError(getPurchaseErrorMessage(error, 'Chưa lưu được yêu cầu.')); }
    finally { setBusy(false); }
  };
  return <section className="bg-white rounded-4 p-4">
    <h1 className="h4 mb-4">Hỗ trợ đơn hàng</h1>
    {error && <p role="alert" className="text-danger">{error}</p>}
    {mode === 'customer' && <form onSubmit={submit} className="mb-4 d-grid gap-2">
      <input className="form-control" name="orderId" type="number" min="1" placeholder="Mã đơn hàng của bạn" required aria-label="Mã đơn hàng" />
      <input className="form-control" name="title" minLength={3} maxLength={150} placeholder="Tiêu đề" required aria-label="Tiêu đề" />
      <textarea className="form-control" name="message" minLength={10} maxLength={3000} placeholder="Mô tả vấn đề cần hỗ trợ" required aria-label="Nội dung" />
      <button className="btn btn-primary justify-self-start" disabled={busy}>Gửi yêu cầu</button>
    </form>}
    {loading ? <p role="status">Đang tải...</p> : !tickets.length && <p className="text-muted">Chưa có yêu cầu hỗ trợ.</p>}
    {tickets.map(ticket => <article key={ticket.id} className="border rounded-3 p-3 mb-3">
      <div className="d-flex justify-content-between gap-3"><strong>#{ticket.orderId} · {ticket.title}</strong><span className="small text-secondary">{labels[ticket.status] || ticket.status}</span></div>
      <small className="text-secondary">{ticket.factoryName} · {ticket.customerName} · {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}</small>
      <p className="mt-2 mb-2" style={{ whiteSpace: 'pre-wrap' }}>{ticket.message}</p>
      {ticket.reply && <p className="bg-light rounded p-2" style={{ whiteSpace: 'pre-wrap' }}>Phản hồi: {ticket.reply}</p>}
      {mode !== 'customer' && <button className="btn btn-outline-primary btn-sm" onClick={() => { setSelected(ticket); setReply(ticket.reply || ''); setStatus(ticket.status); }}>Trả lời</button>}
      {selected?.id === ticket.id && <form onSubmit={submit} className="mt-3 d-grid gap-2">
        <textarea className="form-control" value={reply} onChange={e => setReply(e.target.value)} required maxLength={3000} aria-label="Phản hồi" />
        <select className="form-select" value={status} onChange={e => setStatus(e.target.value)} aria-label="Trạng thái">{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <div><button className="btn btn-primary btn-sm" disabled={busy}>Lưu phản hồi</button><button type="button" className="btn btn-light btn-sm ms-2" onClick={() => setSelected(null)}>Đóng</button></div>
      </form>}
    </article>)}
  </section>;
}
