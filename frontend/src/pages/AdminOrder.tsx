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
    faTag,
    faEye,
    faPenToSquare,
    faTrash,
    faBagShopping,
    faClock,
    faSpinner,
    faCircleCheck,
    faDownload,
    faCirclePlus,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import StatCard from "../components/admin/dashboard/StartCard";
import { useState } from "react";
import { OrderStatus } from "../enums/OrderStatus";
import { ProductType } from "../enums/ProductType";
import type { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { Link } from "react-router";
import { ROUTES } from "../routes/routes";

export const ExampleData: Order[] = [
    {
        id: 1,
        user: new User({
            id: 101,
            fullname: "nguyenvana",
            email: "vana@gmail.com",
            phone: "0901234567",
        }),
        product: new Product({
            id: 201,
            name: "Tinh dầu sả chanh",
            price: 150000,
        }),
        totalPrice: 300000,
        createdAt: "2026-10-10T08:30:00Z",
        status: OrderStatus.PENDING,
    },
    {
        id: 2,
        user: new User({
            id: 102,
            fullname: "tranthib",
            email: "thib@gmail.com",
            phone: "0912345678",
        }),
        product: new Product({
            id: 202,
            name: "Tinh dầu bạc hà",
            price: 200000,
        }),
        totalPrice: 200000,
        createdAt: "2026-10-11T10:15:00Z",
        status: OrderStatus.CONFIRMED,
    },
    {
        id: 3,
        user: new User({
            id: 103,
            fullname: "phamminhc",
            email: "minhc@gmail.com",
            phone: "0934567890",
        }),
        product: new Product({
            id: 203,
            name: "Tinh dầu oải hương",
            price: 250000,
        }),
        totalPrice: 500000,
        createdAt: "2026-10-12T14:45:00Z",
        status: OrderStatus.DELIVERED,
    },
];

// bắt buộc khai báo đủ
export const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    [OrderStatus.PENDING]: {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.CONFIRMED]: {
        label: "Đã xác nhận",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.PROCESSING]: {
        label: "Đang gia công",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERING]: {
        label: "Đang giao",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.SHIPPED]: {
        label: "Đã gửi hàng",
        badge: "bg-info-subtle text-info-emphasis",
    },
    [OrderStatus.DELIVERED]: {
        label: "Đã giao",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [OrderStatus.CANCELLED]: {
        label: "Đã hủy",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
    [OrderStatus.RETURNED]: {
        label: "Đã trả hàng",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [OrderStatus.REFUNDED]: {
        label: "Đã hoàn tiền",
        badge: "bg-dark-subtle text-dark-emphasis",
    },
};

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Tùy chỉnh",
        badge: "bg-purple-subtle text-purple-emphasis",
    },
    [ProductType.NORMAL]: {
        label: "Thường",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
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

const columnHelper = createColumnHelper<typeof features, Order>();
const columns = columnHelper.columns([
    columnHelper.accessor("id", {
        header: "Mã đơn hàng",
        cell: info => <b>{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("user", {
        header: "Người dùng",
        cell: info => {
            const value = info.getValue();

            if (!value) {
                return <span className="text-muted">Không tồn tại người dùng</span>;
            }

            return (
                <div className="d-flex flex-column gap-1 overflow-x-hidden">
                    <span className="fw-semibold text-dark ">
                        {value.id} - {value.fullname || "Chưa cập nhật"}
                    </span>

                    <span className="small text-muted">
                        <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                        {value.email || "Chưa có email"}
                    </span>

                    <span className="small text-secondary">
                        <FontAwesomeIcon icon={faPhone} className="me-2" />
                        {value.phone || "Chưa có số điện thoại"}
                    </span>
                </div>
            );
        },
    }),

    columnHelper.accessor("product", {
        header: "Sản phẩm",
        cell: info => {
            const value = info.getValue();

            if (!value) {
                return <span className="text-muted">Không tồn tại sản phẩm</span>;
            }

            const type = value.productType;
            const conf = type ? ProductTypeBadge[type] : undefined;

            return (
                <div className="d-flex flex-column gap-1 overflow-x-hidden">
                    <span className="fw-semibold text-dark ">
                        {value.id} - {value.name || "Chưa cập nhật"}
                    </span>

                    <span className="small text-muted">
                        <FontAwesomeIcon icon={faTag} className="me-2" />
                        {value.price?.toLocaleString("vi-VN") ?? "Chưa có giá"}
                    </span>

                    {conf && (
                        <div>
                            <CustomBadge label={conf.label} badge={conf.badge} />
                        </div>
                    )}
                </div>
            );
        },
    }),

    columnHelper.accessor("totalPrice", {
        header: "Tổng",
        cell: info => info.getValue()?.toLocaleString("vi-VN"),
    }),

    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const value = info.getValue();
            if (!value) return "không tồn tại";
            const conf = OrderStatusBadge[value];

            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
    }),

    columnHelper.accessor("createdAt", {
        header: "Ngày tạo",
        cell: info => {
            const value = info.getValue();

            if (!value) {
                return <span className="text-muted">Không tồn tại</span>;
            }

            return new Date(value).toLocaleDateString("vi-VN");
        },
        sortFn: "datetime",
    }),

    columnHelper.display({
        id: "actions",
        header: "Hành động",
        cell: info => {
            const order = info.row.original;

            return (
                <div className="d-flex align-items-center gap-2 ">
                    {/* Xem chi tiết */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        title="Xem chi tiết"
                        data-order-id={order.id}
                    >
                        <FontAwesomeIcon icon={faEye} />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success"
                        title="Chỉnh sửa"
                        data-order-id={order.id}
                    >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>

                    {/* Xóa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Xóa"
                        data-order-id={order.id}
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        },
    }),
]);

export default function AdminOrder() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });

    const countByStatus = (...statuses: OrderStatus[]) =>
        ExampleData.filter(
            (order) =>
                order.status !== undefined &&
                statuses.includes(order.status)
        ).length;
    const { isCollapsed } = useAdminSidebar();

    return (
        <div className="d-flex min-vh-100 bg-light">
            {/* Sidebar */}

            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    height: "100vh",
                    width: isCollapsed ? "72px" : "250px",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isOrder={true} />
            </aside>

            {/* Main content */}
            <main className="flex-grow-1 p-3 p-lg-4 admin-content overflow-x-auto" style={{ minWidth: 0 }}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ ĐƠN HÀNG
                        </div>

                        <h2 className="fw-bold text-dark mb-2">
                            Quản lý đơn đặt hàng
                        </h2>

                        <p className="text-secondary mb-0">
                            Giám sát dây chuyền pha chế hương thủ công, bao gói niêm phong
                            và luồng điều vận liên xưởng B2B2C.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <Link className="btn btn-outline-primary fw-semibold" to={ROUTES.PAYMENT_REVIEWS}>Đối soát VNPay</Link>
                        <button type="button" className="btn btn-light border fw-semibold">
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất file vận đơn
                        </button>

                        <button type="button" className="btn btn-danger fw-semibold">
                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                            Tạo đơn điều phối
                        </button>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG ĐƠN HÀNG"
                            value={String(ExampleData.length)}
                            icon={faBagShopping}
                            tone="danger"
                            note="Tất cả đơn hàng"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="CHỜ XÁC NHẬN"
                            value={String(countByStatus(OrderStatus.PENDING))}
                            icon={faClock}
                            tone="warning"
                            note="Cần được tiếp nhận"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐANG XỬ LÝ"
                            value={String(
                                countByStatus(
                                    OrderStatus.CONFIRMED,
                                    OrderStatus.PROCESSING,
                                    OrderStatus.DELIVERING,
                                    OrderStatus.SHIPPED,
                                ),
                            )}
                            icon={faSpinner}
                            tone="info"
                            note="Đang gia công & vận chuyển"
                        />
                    </div>

                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐÃ GIAO"
                            value={String(countByStatus(OrderStatus.DELIVERED))}
                            icon={faCircleCheck}
                            tone="success"
                            note="Đơn hoàn tất"
                        />
                    </div>
                </section>

                {/* Order table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {/* Table heading */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Danh sách đơn hàng
                                </h5>

                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin khách hàng, sản phẩm và tiến độ đơn hàng.
                                </p>
                            </div>

                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} đơn hàng
                            </span>
                        </div>

                        {/* Scrollable table */}
                        <div className="table-responsive admin-table-scroll">
                            <div className="input-group mb-3" style={{ maxWidth: "350px" }}>
                                <span className="input-group-text bg-white">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} />
                                </span>

                                <input
                                    type="search"
                                    className="form-control"
                                    placeholder="Tìm mã đơn hàng, trạng thái..."
                                    value={search}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearch(value);
                                        table.setGlobalFilter(value);
                                    }}
                                />
                            </div>

                            <table className="table table-hover align-middle mb-0 admin-order-table">
                                <thead>
                                    {table.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map((header) => {
                                                const sorted =
                                                    header.column.getIsSorted();

                                                return (
                                                    <th
                                                        key={header.id}
                                                        className="text-nowrap"
                                                    >
                                                        {header.isPlaceholder ? null : (
                                                            <div
                                                                className="d-flex align-items-center gap-2"
                                                                onClick={header.column.getToggleSortingHandler()}
                                                                style={{
                                                                    cursor: header.column.getCanSort()
                                                                        ? "pointer"
                                                                        : "default",
                                                                }}
                                                            >
                                                                <table.FlexRender
                                                                    header={header}
                                                                />

                                                                {header.column.getCanSort() && (
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            sorted === "asc"
                                                                                ? faArrowDownAZ
                                                                                : sorted === "desc"
                                                                                    ? faArrowUpAZ
                                                                                    : faSort
                                                                        }
                                                                        className={
                                                                            sorted
                                                                                ? "text-danger"
                                                                                : "text-secondary"
                                                                        }
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
                                                Chưa có đơn hàng nào.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table footer */}
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
