import ManagementLayout from '../components/ManagementLayout';
import SupportInbox from '../components/SupportInbox';
export default function FactorySupport() {
  return <ManagementLayout mode="factory" section="support"><SupportInbox mode="factory" /></ManagementLayout>;
}
