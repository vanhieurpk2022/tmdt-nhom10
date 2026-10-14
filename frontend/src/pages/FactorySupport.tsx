import {
    createFilteredRowModel,
    createColumnHelper,
    createSortedRowModel,
    tableFeatures,
    useTable,
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    filterFn_includesString,
    sortFn_alphanumeric,
    sortFn_basic,
    sortFn_datetime,
} from "@tanstack/react-table";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faMagnifyingGlass,
    faEnvelope,
    faPhone,
    faClipboardList,
    faClock,
    faSpinner,
    faCircleCheck,
    faEye,
    faPenToSquare,
    faReply,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { useState } from "react";
import { User } from "../models/User";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

type FeedbackStatus = "PENDING" | "REPLIED" | "RESOLVED";
type FeedbackType = "PRODUCT_ISSUE" | "DELIVERY_ISSUE" | "SERVICE" | "OTHER";

interface Feedback {
    id: number;
    orderCode: string;
    user: User;
    type: FeedbackType;
    title: string;
    message: string;
    rating: number;
    status: FeedbackStatus;
    createdAt: string;
    repliedAt?: string;
}

const ExampleData: Feedback[] = [
    {
        id: 1,
        orderCode: "ORD-20261001-001",
        user: new User({
            id: 101,
            fullname: "Nguyễn Văn An",
            email: "vanan@gmail.com",
            phone: "0901234567",
        }),
        type: "PRODUCT_ISSUE",
        title: "Sản phẩm có mùi khác so với mô tả",
        message: "Tinh dầu nhận được có mùi hơi khác so với mô tả trên sàn. Mong gian hàng kiểm tra lại.",
        rating: 2,
        status: "PENDING",
        createdAt: "2026-10-10T08:30:00Z",
    },
    {
        id: 2,
        orderCode: "ORD-20261002-002",
        user: new User({
            id: 102,
            fullname: "Trần Thị Bình",
            email: "thibinh@gmail.com",
            phone: "0912345678",
        }),
        type: "DELIVERY_ISSUE",
        title: "Giao hàng chậm hơn dự kiến",
        message: "Đơn hàng giao chậm 2 ngày so với thời gian cam kết.",
        rating: 3,
        status: "REPLIED",
        createdAt: "2026-10-08T14:00:00Z",
        repliedAt: "2026-10-09T09:00:00Z",
    },
    {
        id: 3,
        orderCode: "ORD-20261003-003",
        user: new User({
            id: 103,
            fullname: "Phạm Minh Cường",
            email: "minhcuong@gmail.com",
            phone: "0934567890",
        }),
        type: "SERVICE",
        title: "Hài lòng với dịch vụ",
        message: "Sản phẩm tốt, đóng gói cẩn thận. Sẽ ủng hộ gian hàng tiếp!",
        rating: 5,
        status: "RESOLVED",
        createdAt: "2026-10-05T16:00:00Z",
        repliedAt: "2026-10-06T08:00:00Z",
    },
    {
        id: 4,
        orderCode: "ORD-20261004-004",
        user: new User({
            id: 104,
            fullname: "Lê Hoàng Duy",
            email: "hoangduy@gmail.com",
            phone: "0987654321",
        }),
        type: "OTHER",
        title: "Hỏi về chính sách đổi trả",
        message: "Tôi muốn hỏi về chính sách đổi trả sản phẩm đã mở nắp sử dụng.",
        rating: 4,
        status: "PENDING",
        createdAt: "2026-10-12T10:00:00Z",
    },
    {
        id: 5,
        orderCode: "ORD-20261005-005",
        user: new User({
            id: 105,
            fullname: "Vũ Thùy Tiên",
            email: "thuytien@gmail.com",
            phone: "0971234567",
        }),
        type: "PRODUCT_ISSUE",
        title: "Chai bị rò rỉ khi nhận",
        message: "Chai tinh dầu bị rò rỉ một phần, có thể do quá trình vận chuyển.",
        rating: 1,
        status: "PENDING",
        createdAt: "2026-10-13T11:30:00Z",
    },
];

const FeedbackTypeBadge: Record<FeedbackType, { label: string; badge: string }> = {
    PRODUCT_ISSUE: { label: "Vấn đề sản phẩm", badge: "bg-danger-subtle text-danger-emphasis" },
    DELIVERY_ISSUE: { label: "Vấn đề giao hàng", badge: "bg-warning-subtle text-warning-emphasis" },
    SERVICE: { label: "Dịch vụ", badge: "bg-primary-subtle text-primary-emphasis" },
    OTHER: { label: "Khác", badge: "bg-secondary-subtle text-secondary-emphasis" },
};

const FeedbackStatusBadge: Record<FeedbackStatus, { label: string; badge: string }> = {
    PENDING: { label: "Chờ phản hồi", badge: "bg-warning-subtle text-warning-emphasis" },
    REPLIED: { label: "Đã trả lời", badge: "bg-primary-subtle text-primary-emphasis" },
    RESOLVED: { label: "Đã xử lý", badge: "bg-success-subtle text-success-emphasis" },
};

const features = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,

    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),

    sortFns: {
        alphanumeric: sortFn_alphanumeric,
        basic: sortFn_basic,
        datetime: sortFn_datetime,
    },

    filterFns: {
        includesString: filterFn_includesString,
    },
});

const columnHelper = createColumnHelper<typeof features, Feedback>();
const columns = columnHelper.columns([
    columnHelper.accessor("orderCode", {
        header: "Mã đơn hàng",
        cell: info => <b>{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),
    columnHelper.accessor("user", {
        header: "Khách hàng",
        cell: info => {
            const value = info.getValue();
            return (
                <div className="d-flex flex-column gap-1 overflow-x-hidden">
                    <span className="fw-semibold text-dark">
                        {value.fullname || "Chưa cập nhật"}
                    </span>
                    <span className="small text-muted">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        {value.email || "Chưa có email"}
                    </span>
                    <span className="small text-secondary">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        {value.phone || "Chưa có SĐT"}
                    </span>
                </div>
            );
        },
    }),
    columnHelper.accessor("type", {
        header: "Loại phản hồi",
        cell: info => {
            const value = info.getValue();
            const conf = FeedbackTypeBadge[value];
            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
    }),
    columnHelper.accessor("title", {
        header: "Tiêu đề",
        cell: info => (
            <div className="d-flex flex-column gap-1" style={{ maxWidth: 250 }}>
                <span className="fw-semibold">{info.getValue()}</span>
                <span className="small text-muted text-truncate">
                    {info.row.original.message}
                </span>
            </div>
        ),
    }),
    columnHelper.accessor("rating", {
        header: "Đánh giá",
        cell: info => {
            const stars = info.getValue();
            return (
                <div className="d-flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                        <span
                            key={s}
                            style={{ color: s <= stars ? "#F59E0B" : "#D1D5DB", fontSize: "0.85rem" }}
                        >
                            ★
                        </span>
                    ))}
                </div>
            );
        },
    }),
    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const value = info.getValue();
            const conf = FeedbackStatusBadge[value];
            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
    }),
    columnHelper.accessor("createdAt", {
        header: "Ngày gửi",
        cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
        sortFn: "datetime",
    }),
    columnHelper.display({
        id: "actions",
        header: "Hành động",
        cell: info => {
            const feedback = info.row.original;
            return (
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        title="Phản hồi"
                        disabled={feedback.status === "RESOLVED"}
                    >
                        <FontAwesomeIcon icon={faReply} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-warning" title="Chỉnh sửa">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                </div>
            );
        },
    }),
]);

export default function FactorySupport() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });

    const totalFeedback = ExampleData.length;
    const pendingCount = ExampleData.filter(f => f.status === "PENDING").length;
    const repliedCount = ExampleData.filter(f => f.status === "REPLIED").length;
    const resolvedCount = ExampleData.filter(f => f.status === "RESOLVED").length;

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isSupport={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ PHẢN HỒI
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Phản hồi từ khách hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Tiếp nhận và xử lý các phản hồi, đánh giá từ khách hàng mua hàng tại gian hàng.
                        </p>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG PHẢN HỒI"
                            value={String(totalFeedback)}
                            icon={faClipboardList}
                            tone="danger"
                            note="Tất cả phản hồi"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="CHỜ PHẢN HỒI"
                            value={String(pendingCount)}
                            icon={faClock}
                            tone="warning"
                            note="Cần phản hồi khách"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐÃ TRẢ LỜI"
                            value={String(repliedCount)}
                            icon={faSpinner}
                            tone="info"
                            note="Đang chờ khách xác nhận"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐÃ XỬ LÝ"
                            value={String(resolvedCount)}
                            icon={faCircleCheck}
                            tone="success"
                            note="Phản hồi đã xong"
                        />
                    </div>
                </section>

                {/* Feedback table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách phản hồi</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý phản hồi, đánh giá và hỗ trợ khách hàng.
                                </p>
                            </div>
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} phản hồi
                            </span>
                        </div>

                        <div className="table-responsive admin-table-scroll">
                            <div className="input-group mb-3" style={{ maxWidth: "350px" }}>
                                <span className="input-group-text bg-white">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>
                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Tìm mã đơn, tên khách hàng..."
                                    value={search}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearch(value);
                                        table.setGlobalFilter(value);
                                    }}
                                />
                            </div>
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                const sorted = header.column.getIsSorted();
                                                return (
                                                    <th key={header.id} className="text-nowrap">
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className="d-flex align-items-center gap-2"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                style={{
                                                                    cursor: header.column.getCanSort() ? "pointer" : "default",
                                                                }}
                                                            >
                                                                <table.FlexRender header={header} />
                                                                {header.column.getCanSort() && (
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            sorted === "asc" ? faArrowDownAZ
                                                                                : sorted === "desc" ? faArrowUpAZ
                                                                                    : faSort
                                                                        }
                                                                        className={sorted ? "text-danger" : "text-secondary"}
                                                                        size="sm"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </thead>
                                <tbody>
                                    {table.getRowModel().rows.map((row) => (
                                        <tr key={row.id}>
                                            {row.getAllCells().map((cell) => (
                                                <td key={cell.id}>
                                                    <table.FlexRender cell={cell} />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                    {table.getRowModel().rows.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                                                className="text-center py-5 text-secondary"
                                            >
                                                Chưa có phản hồi nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top">
                            <span className="text-secondary small">
                                Tổng cộng {table.getRowModel().rows.length} bản ghi
                            </span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
