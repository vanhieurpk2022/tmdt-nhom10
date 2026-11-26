import AccountLayout from '../components/layout/AccountLayout';
import SupportInbox from '../components/SupportInbox';
export default function SupportPage() {
  return <AccountLayout breadcrumbCurrent="Hỗ trợ đơn hàng"><SupportInbox mode="customer" /></AccountLayout>;
}
