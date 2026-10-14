import { useState, useMemo } from "react";
import {
    faUsers,
    faUserCheck,
    faUserClock,
    faUserXmark,
    faMagnifyingGlass,
    faCirclePlus,
    faDownload,
    faEye,
    faPenToSquare,
    faTrash,
    faEnvelope,
    faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

type StaffRole = "Quản lý" | "Nhân viên bán hàng" | "Nhân viên kho" | "Nhân viên giao hàng";
type StaffStatus = "ACTIVE" | "INACTIVE" | "ON_LEAVE";

interface Staff {
    id: number;
    name: string;
    email: string;
    phone: string;
    role: StaffRole;
    status: StaffStatus;
    joinedAt: string;
    avatar: string;
}

const ExampleData: Staff[] = [
    {
        id: 1,
        name: "Nguyễn Minh Tuấn",
        email: "minhtuan@shop.vn",
        phone: "0901234567",
        role: "Quản lý",
        status: "ACTIVE",
        joinedAt: "2025-01-15T08:00:00Z",
        avatar: "MT",
    },
    {
        id: 2,
        name: "Trần Thị Hoa",
        email: "thihoa@shop.vn",
        phone: "0912345678",
        role: "Nhân viên bán hàng",
        status: "ACTIVE",
        joinedAt: "2025-06-20T08:00:00Z",
        avatar: "TH",
    },
    {
        id: 3,
        name: "Lê Văn Đức",
        email: "vanduc@shop.vn",
        phone: "0923456789",
        role: "Nhân viên kho",
        status: "ACTIVE",
        joinedAt: "2025-09-01T08:00:00Z",
        avatar: "VD",
    },
    {
        id: 4,
        name: "Phạm Ngọc Lan",
        email: "ngoclan@shop.vn",
        phone: "0934567890",
        role: "Nhân viên bán hàng",
        status: "ON_LEAVE",
        joinedAt: "2026-02-10T08:00:00Z",
        avatar: "NL",
    },
    {
        id: 5,
        name: "Hoàng Quốc Bảo",
        email: "quocbao@shop.vn",
        phone: "0945678901",
        role: "Nhân viên giao hàng",
        status: "INACTIVE",
        joinedAt: "2025-03-05T08:00:00Z",
        avatar: "QB",
    },
];

const StatusBadge: Record<StaffStatus, { label: string; badge: string }> = {
    ACTIVE: {
        label: "Đang làm việc",
        badge: "bg-success-subtle text-success-emphasis",
    },
    ON_LEAVE: {
        label: "Nghỉ phép",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    INACTIVE: {
        label: "Đã nghỉ",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

const RoleBadge: Record<StaffRole, { label: string; badge: string }> = {
    "Quản lý": {
        label: "Quản lý",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
    "Nhân viên bán hàng": {
        label: "Bán hàng",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    "Nhân viên kho": {
        label: "Kho",
        badge: "bg-info-subtle text-info-emphasis",
    },
    "Nhân viên giao hàng": {
        label: "Giao hàng",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
};

const avatarColors: Record<string, string> = {
    MT: "#E11D48",
    TH: "#2563EB",
    VD: "#059669",
    NL: "#F59E0B",
    QB: "#6B7280",
};

export default function FactoryStaff() {
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    const filtered = useMemo(() => {
        const kw = search.trim().toLowerCase();
        return ExampleData.filter((s) => {
            if (kw && ![s.name, s.email, s.phone, s.role].some((v) => v.toLowerCase().includes(kw))) return false;
            if (statusFilter !== "all" && s.status !== statusFilter) return false;
            if (roleFilter !== "all" && s.role !== roleFilter) return false;
            return true;
        });
    }, [search, statusFilter, roleFilter]);

    const totalStaff = ExampleData.length;
    const activeStaff = ExampleData.filter(s => s.status === "ACTIVE").length;
    const onLeaveStaff = ExampleData.filter(s => s.status === "ON_LEAVE").length;
    const inactiveStaff = ExampleData.filter(s => s.status === "INACTIVE").length;

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isStaff={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ NHÂN VIÊN
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Nhân viên gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Quản lý nhân sự phụ trách vận hành gian hàng trên sàn thương mại điện tử.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light border fw-semibold">
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất danh sách
                        </button>
                        <button type="button" className="btn btn-danger fw-semibold">
                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                            Thêm nhân viên
                        </button>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG NHÂN VIÊN"
                            value={String(totalStaff)}
                            icon={faUsers}
                            tone="danger"
                            note="Tất cả nhân viên"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐANG LÀM VIỆC"
                            value={String(activeStaff)}
                            icon={faUserCheck}
                            tone="success"
                            note="Nhân viên hoạt động"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="NGHỈ PHÉP"
                            value={String(onLeaveStaff)}
                            icon={faUserClock}
                            tone="warning"
                            note="Đang nghỉ phép"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐÃ NGHỈ VIỆC"
                            value={String(inactiveStaff)}
                            icon={faUserXmark}
                            tone="info"
                            note="Không còn làm việc"
                        />
                    </div>
                </section>

                {/* Staff table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách nhân viên</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin, vai trò và trạng thái làm việc của nhân viên.
                                </p>
                            </div>
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {filtered.length} nhân viên
                            </span>
                        </div>

                        <div className="table-responsive admin-table-scroll">
                            {/* Filters */}
                            <div className="d-flex flex-wrap gap-2 align-items-center p-3">
                                <div className="input-group" style={{ maxWidth: "350px" }}>
                                    <span className="input-group-text bg-white">
                                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                                    </span>
                                    <input
                                        type="search"
                                        className="form-control"
                                        placeholder="Tìm tên, email, SĐT..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                <select
                                    className="form-select"
                                    style={{ maxWidth: "200px" }}
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">Trạng thái: Tất cả</option>
                                    <option value="ACTIVE">Đang làm việc</option>
                                    <option value="ON_LEAVE">Nghỉ phép</option>
                                    <option value="INACTIVE">Đã nghỉ</option>
                                </select>
                                <select
                                    className="form-select"
                                    style={{ maxWidth: "200px" }}
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">Vai trò: Tất cả</option>
                                    <option value="Quản lý">Quản lý</option>
                                    <option value="Nhân viên bán hàng">Bán hàng</option>
                                    <option value="Nhân viên kho">Kho</option>
                                    <option value="Nhân viên giao hàng">Giao hàng</option>
                                </select>
                            </div>

                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    <tr>
                                        <th className="text-nowrap">Nhân viên</th>
                                        <th className="text-nowrap">Liên hệ</th>
                                        <th className="text-nowrap">Vai trò</th>
                                        <th className="text-nowrap">Ngày vào</th>
                                        <th className="text-nowrap">Trạng thái</th>
                                        <th className="text-nowrap">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((staff) => (
                                        <tr key={staff.id}>
                                            <td>
                                                <div className="d-flex align-items-center gap-3">
                                                    <div
                                                        className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                                        style={{
                                                            width: 40,
                                                            height: 40,
                                                            backgroundColor: avatarColors[staff.avatar] || "#6B7280",
                                                            fontSize: "0.85rem",
                                                        }}
                                                    >
                                                        {staff.avatar}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold">{staff.name}</div>
                                                        <small className="text-muted">Mã: NV-{String(staff.id).padStart(3, "0")}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="d-flex flex-column gap-1">
                                                    <span className="small">
                                                        <FontAwesomeIcon icon={faEnvelope} className="me-2 text-muted" />
                                                        {staff.email}
                                                    </span>
                                                    <span className="small">
                                                        <FontAwesomeIcon icon={faPhone} className="me-2 text-muted" />
                                                        {staff.phone}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <CustomBadge label={RoleBadge[staff.role].label} badge={RoleBadge[staff.role].badge} />
                                            </td>
                                            <td>{new Date(staff.joinedAt).toLocaleDateString("vi-VN")}</td>
                                            <td>
                                                <CustomBadge label={StatusBadge[staff.status].label} badge={StatusBadge[staff.status].badge} />
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2">
                                                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                                                        <FontAwesomeIcon icon={faEye} />
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-success" title="Chỉnh sửa">
                                                        <FontAwesomeIcon icon={faPenToSquare} />
                                                    </button>
                                                    <button type="button" className="btn btn-sm btn-outline-danger" title="Xóa">
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filtered.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-secondary">
                                                Không tìm thấy nhân viên phù hợp.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                            <span className="text-secondary small">
                                Tổng cộng {filtered.length} bản ghi
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
