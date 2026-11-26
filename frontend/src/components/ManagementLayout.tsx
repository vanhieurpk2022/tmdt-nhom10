import type { ReactNode } from 'react';
import SideBarAdmin from './admin/dashboard/SideBarAdmin';
import SideBarFactory from './admin/factory/SideBarFactory';
import { useAdminSidebar } from '../api/AdminSidebarContext';
import '../css/pages/dashboard/admin.css';
import '../css/pages/dashboard/dashboard.css';

export default function ManagementLayout({ mode, section, children }: {
  mode: 'admin' | 'factory'; section: 'voucher' | 'support'; children: ReactNode;
}) {
  const { isCollapsed } = useAdminSidebar();
  const active = { isVoucher: section === 'voucher', isSupport: section === 'support' };
  return mode === 'admin' ? <div className="d-flex min-vh-100 bg-light">
    <aside className="position-sticky top-0 flex-shrink-0" style={{ width: isCollapsed ? 72 : 250, height: '100vh' }}><SideBarAdmin {...active} /></aside>
    <main className="flex-grow-1 p-3 p-lg-4 admin-content" style={{ minWidth: 0 }}>{children}</main>
  </div> : <div className="row g-0 min-vh-100 bg-light">
    <aside className="col-12 col-xl-2 position-sticky top-0 align-self-start" style={{ height: '100vh' }}><SideBarFactory {...active} /></aside>
    <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content">{children}</main>
  </div>;
}
