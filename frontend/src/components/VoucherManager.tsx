import { useEffect, useState, type FormEvent } from 'react';
import api from '../api/api';
import { getPurchaseErrorMessage } from '../api/CheckoutSelection';

interface Voucher {
  id: number; code: string; discountType: 'PERCENT' | 'FIXED'; discountValue: number;
  maxDiscountAmount: number | null; minOrderValue: number; usageLimit: number; usedCount: number;
  startDate: string; endDate: string; status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED';
}
const localDate = (offset = 0) => new Date(Date.now() + offset - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function VoucherManager({ mode }: { mode: 'admin' | 'factory' }) {
  const endpoint = mode === 'admin' ? '/admin/vouchers' : '/manager/vouchers';
  const [rows, setRows] = useState<Voucher[]>([]);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    void api.get<{ data: Voucher[] }>(endpoint).then(r => { if (active) setRows(r.data.data); })
      .catch(() => { if (active) setError('Chưa tải được mã giảm giá.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [endpoint]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); if (busy) return;
    const form = new FormData(event.currentTarget);
    const payload = {
      code: String(form.get('code')).trim().toUpperCase(), discountType: form.get('discountType'),
      discountValue: Number(form.get('discountValue')), minOrderValue: Number(form.get('minOrderValue')),
      maxDiscountAmount: form.get('maxDiscountAmount') ? Number(form.get('maxDiscountAmount')) : null,
      usageLimit: Number(form.get('usageLimit')), startDate: form.get('startDate'), endDate: form.get('endDate'), status: form.get('status'),
    };
    setBusy(true); setError('');
    try {
      if (editing) await api.put(endpoint + '/' + editing.id, payload);
      else await api.post(endpoint, payload);
      setRows((await api.get<{ data: Voucher[] }>(endpoint)).data.data);
      setOpen(false); setEditing(null);
    } catch (error) { setError(getPurchaseErrorMessage(error, 'Chưa lưu được mã giảm giá.')); }
    finally { setBusy(false); }
  };
  return <section className="bg-white p-4 rounded-4">
    <div className="d-flex justify-content-between gap-3 mb-4"><h1 className="h4">Mã giảm giá</h1><button className="btn btn-primary btn-sm" onClick={() => { setEditing(null); setOpen(true); }}>Tạo mã</button></div>
    <p className="text-secondary small">Mã của xưởng chỉ áp dụng cho đơn của xưởng đó. Số lượt dùng được kiểm tra khi đặt hàng và hoàn lại khi hủy đơn.</p>
    {error && <p className="text-danger" role="alert">{error}</p>}
    {open && <form key={editing?.id ?? 'new'} onSubmit={submit} className="row g-3 mb-4 border rounded p-3">
      <label className="col-md-6 small">Mã<input className="form-control" name="code" required pattern="[A-Za-z0-9_-]{3,32}" defaultValue={editing?.code} /></label>
      <label className="col-md-6 small">Loại giảm<select className="form-select" name="discountType" defaultValue={editing?.discountType || 'PERCENT'}><option value="PERCENT">Phần trăm</option><option value="FIXED">Số tiền (đ)</option></select></label>
      <label className="col-md-4 small">Giá trị giảm<input className="form-control" name="discountValue" type="number" min="1" required defaultValue={editing?.discountValue || 10} /></label>
      <label className="col-md-4 small">Giảm tối đa (đ)<input className="form-control" name="maxDiscountAmount" type="number" min="0" defaultValue={editing?.maxDiscountAmount ?? ''} /></label>
      <label className="col-md-4 small">Đơn tối thiểu (đ)<input className="form-control" name="minOrderValue" type="number" min="0" required defaultValue={editing?.minOrderValue ?? 0} /></label>
      <label className="col-md-4 small">Giới hạn lượt dùng<input className="form-control" name="usageLimit" type="number" min={Math.max(1, editing?.usedCount || 1)} required defaultValue={editing?.usageLimit || 100} /></label>
      <label className="col-md-4 small">Bắt đầu<input className="form-control" name="startDate" type="datetime-local" required defaultValue={editing?.startDate.slice(0, 16) || localDate()} /></label>
      <label className="col-md-4 small">Kết thúc<input className="form-control" name="endDate" type="datetime-local" required defaultValue={editing?.endDate.slice(0, 16) || localDate(7 * 86400000)} /></label>
      <label className="col-md-6 small">Trạng thái<select className="form-select" name="status" defaultValue={editing?.status || 'ACTIVE'}><option value="ACTIVE">Mở áp dụng</option><option value="INACTIVE">Tạm ngưng</option><option value="EXPIRED">Hết hạn</option><option value="EXHAUSTED">Hết lượt</option></select></label>
      <div className="col-12"><button className="btn btn-primary btn-sm" disabled={busy}>Lưu</button><button type="button" className="btn btn-light btn-sm ms-2" disabled={busy} onClick={() => setOpen(false)}>Đóng</button></div>
    </form>}
    {loading ? <p role="status">Đang tải...</p> : !rows.length ? <p className="text-secondary">Chưa có mã giảm giá.</p> : <div className="table-responsive"><table className="table align-middle small">
      <thead><tr><th>Mã</th><th>Mức giảm</th><th>Đã dùng</th><th>Thời hạn</th><th>Trạng thái</th><th /></tr></thead>
      <tbody>{rows.map(voucher => <tr key={voucher.id}><td className="fw-bold">{voucher.code}</td><td>{voucher.discountValue.toLocaleString('vi-VN')}{voucher.discountType === 'PERCENT' ? '%' : 'đ'}</td><td>{voucher.usedCount}/{voucher.usageLimit}</td><td>{new Date(voucher.startDate).toLocaleDateString('vi-VN')} – {new Date(voucher.endDate).toLocaleDateString('vi-VN')}</td><td>{voucher.status === 'ACTIVE' ? new Date(voucher.endDate) < new Date() ? 'Hết hạn' : new Date(voucher.startDate) > new Date() ? 'Chưa bắt đầu' : 'Mở áp dụng' : 'Ngừng áp dụng'}</td><td><button className="btn btn-light btn-sm" onClick={() => { setEditing(voucher); setOpen(true); }}>Sửa</button></td></tr>)}</tbody>
    </table></div>}
  </section>;
}
