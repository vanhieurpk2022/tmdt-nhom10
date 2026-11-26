import ManagementLayout from '../components/ManagementLayout';
import VoucherManager from '../components/VoucherManager';
export default function FactorySale() {
  return <ManagementLayout mode="factory" section="voucher"><VoucherManager mode="factory" /></ManagementLayout>;
}
