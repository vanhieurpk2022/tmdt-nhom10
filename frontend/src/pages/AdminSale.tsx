import ManagementLayout from '../components/ManagementLayout';
import VoucherManager from '../components/VoucherManager';
export function AdminSale() {
  return <ManagementLayout mode="admin" section="voucher"><VoucherManager mode="admin" /></ManagementLayout>;
}
