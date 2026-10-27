import { useState, useMemo, useEffect, useCallback } from "react";
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
    faRotateRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import ModalAddStaff from "../components/admin/factory/ModalAddStaff";
import ModalEditStaff from "../components/admin/factory/ModalEditStaff";
import ModalViewStaff from "../components/admin/factory/ModalViewStaff";
import { FactoryServiceManager, type FactoryStaffItem } from "../api/factory/FactoryService";
import { useToastContext } from "../components/toasts/ToastContext";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

const StatusBadge: Record<string, { label: string; badge: string }> = {
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
    BANNED: {
        label: "Bị khóa",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
};

const getRoleBadge = (roleOrPosition: string) => {
    const pos = (roleOrPosition || "").toLowerCase();
    if (pos.includes("quản lý") || pos.includes("chủ") || pos.includes("owner")) {
        return { label: roleOrPosition, badge: "bg-danger-subtle text-danger-emphasis" };
    }
    if (pos.includes("bán hàng") || pos.includes("sales")) {
        return { label: roleOrPosition, badge: "bg-primary-subtle text-primary-emphasis" };
    }
    if (pos.includes("kho")) {
        return { label: roleOrPosition, badge: "bg-info-subtle text-info-emphasis" };
    }
    if (pos.includes("giao hàng")) {
        return { label: roleOrPosition, badge: "bg-warning-subtle text-warning-emphasis" };
    }
    return { label: roleOrPosition || "Nhân viên", badge: "bg-secondary-subtle text-secondary-emphasis" };
};

const getAvatarColor = (str: string) => {
    const colors = ["#E11D48", "#2563EB", "#059669", "#F59E0B", "#7C3AED", "#0891B2", "#D97706", "#4F46E5"];
    let hash = 0;
    for (let i = 0; i < (str || "").length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function FactoryStaff() {
    const { showToast } = useToastContext();

    const [staffs, setStaffs] = useState<FactoryStaffItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [roleFilter, setRoleFilter] = useState("all");

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<FactoryStaffItem | null>(null);

    const loadStaffs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await FactoryServiceManager.getStaffs();
            setStaffs(res.data || []);
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Không thể tải danh sách nhân viên";
            showToast("Lỗi", msg, "danger");
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        loadStaffs();
    }, [loadStaffs]);

    const filtered = useMemo(() => {
        const kw = search.trim().toLowerCase();
        return staffs.filter((s) => {
            const nameMatch = (s.fullname || "").toLowerCase().includes(kw);
            const emailMatch = (s.email || "").toLowerCase().includes(kw);
            const phoneMatch = (s.phone || "").toLowerCase().includes(kw);
            const posMatch = (s.factoryPosition || "").toLowerCase().includes(kw);

            if (kw && !nameMatch && !emailMatch && !phoneMatch && !posMatch) return false;
            if (statusFilter !== "all" && s.status !== statusFilter) return false;
            if (roleFilter !== "all") {
                const pos = (s.factoryPosition || "").toLowerCase();
                if (roleFilter === "Quản lý" && !pos.includes("quản lý") && s.factoryRole !== "OWNER") return false;
                if (roleFilter === "Nhân viên bán hàng" && !pos.includes("bán hàng")) return false;
                if (roleFilter === "Nhân viên kho" && !pos.includes("kho")) return false;
                if (roleFilter === "Nhân viên giao hàng" && !pos.includes("giao hàng")) return false;
            }
            return true;
        });
    }, [staffs, search, statusFilter, roleFilter]);

    const totalStaff = staffs.length;
    const activeStaff = staffs.filter((s) => s.status === "ACTIVE").length;
    const onLeaveStaff = staffs.filter((s) => s.status === "ON_LEAVE").length;
    const inactiveStaff = staffs.filter((s) => s.status === "INACTIVE" || s.status === "BANNED").length;

    const handleDelete = async (staff: FactoryStaffItem) => {
        if (staff.factoryRole === "OWNER") {
            showToast("Không được phép", "Không thể xóa chủ tài khoản xưởng.", "warning");
            return;
        }
        if (!window.confirm(`Bạn có chắc chắn muốn ngưng quyền và xóa nhân viên "${staff.fullname || staff.email}" khỏi xưởng?`)) {
            return;
        }
        try {
            await FactoryServiceManager.deleteStaff(staff.id);
            showToast("Thành công", `Đã xóa nhân viên ${staff.fullname || staff.email}`, "success");
            loadStaffs();
        } catch (err: any) {
            const msg = err?.response?.data?.message || "Không thể xóa nhân viên.";
            showToast("Lỗi", msg, "danger");
        }
    };

    const handleExportCsv = () => {
        if (filtered.length === 0) {
            showToast("Thông báo", "Không có dữ liệu nhân viên để xuất", "warning");
            return;
        }
        const headers = ["Mã NV", "Họ và tên", "Email", "Số điện thoại", "Vị trí", "Vai trò", "Trạng thái", "Ngày tham gia"];
        const rows = filtered.map((s) => [
            `NV-${String(s.id).padStart(3, "0")}`,
            `"${s.fullname || ""}"`,
            s.email,
            s.phone || "",
            `"${s.factoryPosition || ""}"`,
            s.factoryRole === "OWNER" ? "Chủ xưởng" : "Nhân viên",
            StatusBadge[s.status]?.label || s.status,
            s.joinedAt ? new Date(s.joinedAt).toLocaleDateString("vi-VN") : "",
        ]);
        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `danh_sach_nhan_vien_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Xuất file thành công", `Đã xuất ${filtered.length} nhân viên ra file CSV`, "success");
    };

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
                            Nhân viên xưởng
                        </h2>
                        <p className="text-secondary mb-0">
                            Tạo và quản lý tài khoản nhân sự phụ trách vận hành xưởng và xử lý đơn hàng.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="button"
                            className="btn btn-light border fw-semibold"
                            onClick={loadStaffs}
                            disabled={loading}
                            title="Tải lại danh sách"
                        >
                            <FontAwesomeIcon icon={faRotateRight} className={`me-2 ${loading ? "fa-spin" : ""}`} />
                            Làm mới
                        </button>
                        <button
                            type="button"
                            className="btn btn-light border fw-semibold"
                            onClick={handleExportCsv}
                        >
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất danh sách
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger fw-semibold"
                            onClick={() => setShowAddModal(true)}
                        >
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
                            note="Tất cả nhân viên xưởng"
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
                            label="ĐÃ NGHỈ VIỆC / TẠM NGƯNG"
                            value={String(inactiveStaff)}
                            icon={faUserXmark}
                            tone="info"
                            note="Tạm ngưng / Không hoạt động"
                        />
                    </div>
                </section>

                {/* Staff table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách tài khoản nhân viên</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin đăng nhập, chức vụ và trạng thái của từng nhân viên.
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
                                        placeholder="Tìm tên, email, SĐT, vị trí..."
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
                                    <option value="INACTIVE">Đã nghỉ / Tạm ngưng</option>
                                </select>
                                <select
                                    className="form-select"
                                    style={{ maxWidth: "220px" }}
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">Vị trí: Tất cả</option>
                                    <option value="Quản lý">Quản lý / Chủ xưởng</option>
                                    <option value="Nhân viên bán hàng">Nhân viên bán hàng</option>
                                    <option value="Nhân viên kho">Nhân viên kho</option>
                                    <option value="Nhân viên giao hàng">Nhân viên giao hàng</option>
                                </select>
                            </div>

                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th className="text-nowrap ps-3">Nhân viên</th>
                                        <th className="text-nowrap">Liên hệ</th>
                                        <th className="text-nowrap">Vị trí công việc</th>
                                        <th className="text-nowrap">Ngày vào</th>
                                        <th className="text-nowrap">Trạng thái</th>
                                        <th className="text-nowrap text-end pe-3">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-secondary">
                                                <div className="spinner-border text-danger spinner-border-sm me-2" role="status" />
                                                Đang tải danh sách nhân viên...
                                            </td>
                                        </tr>
                                    ) : filtered.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-5 text-secondary">
                                                Không tìm thấy nhân viên phù hợp.
                                            </td>
                                        </tr>
                                    ) : (
                                        filtered.map((staff) => {
                                            const roleBadge = getRoleBadge(staff.factoryPosition);
                                            const statusBadge = StatusBadge[staff.status] || {
                                                label: staff.status,
                                                badge: "bg-light text-dark",
                                            };
                                            const isOwner = staff.factoryRole === "OWNER";

                                            return (
                                                <tr key={staff.id}>
                                                    <td className="ps-3">
                                                        <div className="d-flex align-items-center gap-3">
                                                            <div
                                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold flex-shrink-0"
                                                                style={{
                                                                    width: 40,
                                                                    height: 40,
                                                                    backgroundColor: getAvatarColor(staff.fullname || staff.email),
                                                                    fontSize: "0.85rem",
                                                                }}
                                                            >
                                                                {staff.avatar || "NV"}
                                                            </div>
                                                            <div>
                                                                <div className="fw-semibold text-dark">
                                                                    {staff.fullname || "Chưa cập nhật tên"}
                                                                    {isOwner && (
                                                                        <span className="badge bg-danger ms-2" style={{ fontSize: "0.65rem" }}>
                                                                            Chủ xưởng
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <small className="text-muted">
                                                                    Mã: NV-{String(staff.id).padStart(3, "0")}
                                                                </small>
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
                                                                {staff.phone || "—"}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <CustomBadge label={roleBadge.label} badge={roleBadge.badge} />
                                                    </td>
                                                    <td>
                                                        {staff.joinedAt
                                                            ? new Date(staff.joinedAt).toLocaleDateString("vi-VN")
                                                            : "—"}
                                                    </td>
                                                    <td>
                                                        <CustomBadge label={statusBadge.label} badge={statusBadge.badge} />
                                                    </td>
                                                    <td className="text-end pe-3">
                                                        <div className="d-inline-flex align-items-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-primary"
                                                                title="Xem chi tiết"
                                                                onClick={() => {
                                                                    setSelectedStaff(staff);
                                                                    setShowViewModal(true);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faEye} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-outline-success"
                                                                title="Chỉnh sửa"
                                                                onClick={() => {
                                                                    setSelectedStaff(staff);
                                                                    setShowEditModal(true);
                                                                }}
                                                            >
                                                                <FontAwesomeIcon icon={faPenToSquare} />
                                                            </button>
                                                            {!isOwner && (
                                                                <button
                                                                    type="button"
                                                                    className="btn btn-sm btn-outline-danger"
                                                                    title="Xóa nhân viên"
                                                                    onClick={() => handleDelete(staff)}
                                                                >
                                                                    <FontAwesomeIcon icon={faTrash} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
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

            {/* Modal Thêm nhân viên */}
            <ModalAddStaff
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onSuccess={loadStaffs}
            />

            {/* Modal Chỉnh sửa nhân viên */}
            <ModalEditStaff
                show={showEditModal}
                staff={selectedStaff}
                onHide={() => {
                    setShowEditModal(false);
                    setSelectedStaff(null);
                }}
                onSuccess={loadStaffs}
            />

            {/* Modal Xem chi tiết nhân viên */}
            <ModalViewStaff
                show={showViewModal}
                staff={selectedStaff}
                onHide={() => {
                    setShowViewModal(false);
                    setSelectedStaff(null);
                }}
                onEdit={() => setShowEditModal(true)}
            />
        </div>
    );
}
