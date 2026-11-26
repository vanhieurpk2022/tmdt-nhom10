import ManagementLayout from '../components/ManagementLayout';
import SupportInbox from '../components/SupportInbox';
export function AdminSupport() {
  return <ManagementLayout mode="admin" section="support"><SupportInbox mode="admin" /></ManagementLayout>;
}
