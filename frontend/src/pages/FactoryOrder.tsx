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
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { useState } from "react";
import { OrderStatus } from "../enums/OrderStatus";
import type { Order } from "../models/Order";
import { User } from "../models/User";
import { Product } from "../models/Product";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

const ExampleData: Order[] = [
    {
        id: 1,
        user: new User({
            id: 101,
            fullname: "Nguyễn Văn An",
            email: "vanan@gmail.com",
            phone: "0901234567",
        }),
        product: new Product({
            id: 201,
            name: "Tinh dầu sả chanh nguyên chất",
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
            fullname: "Trần Thị Bình",
            email: "thibinh@gmail.com",
            phone: "0912345678",
        }),
        product: new Product({
            id: 202,
            name: "Tinh dầu bạc hà Premium",
            price: 200000,
        }),
        totalPrice: 400000,
        createdAt: "2026-10-11T10:15:00Z",
        status: OrderStatus.CONFIRMED,
    },
    {
        id: 3,
        user: new User({
            id: 103,
            fullname: "Phạm Minh Cường",
            email: "minhcuong@gmail.com",
            phone: "0934567890",
        }),
        product: new Product({
            id: 203,
            name: "Nước hoa oải hương Lavender",
            price: 350000,
        }),
        totalPrice: 700000,
        createdAt: "2026-10-12T14:45:00Z",
        status: OrderStatus.DELIVERED,
    },
    {
        id: 4,
        user: new User({
            id: 104,
            fullname: "Lê Hoàng Duy",
            email: "hoangduy@gmail.com",
            phone: "0987654321",
        }),
        product: new Product({
            id: 204,
            name: "Nến thơm hương gỗ đàn hương",
            price: 120000,
        }),
        totalPrice: 240000,
        createdAt: "2026-10-13T09:00:00Z",
        status: OrderStatus.PROCESSING,
    },
];

const OrderStatusBadge: Record<OrderStatus, { label: string; badge: string }> = {
    [OrderStatus.PENDING]: {
        label: "Chờ xác nhận",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [OrderStatus.CONFIRMED]: {
        label: "Đã xác nhận",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [OrderStatus.PROCESSING]: {
        label: "Đang đóng gói",
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
        cell: info => <b>#{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("user", {
        header: "Khách hàng",
        cell: info => {
            const value = info.getValue();
            if (!value) {
                return <span className="text-muted">Không tồn tại</span>;
            }
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

    columnHelper.accessor("product", {
        header: "Sản phẩm",
        cell: info => {
            const value = info.getValue();
            if (!value) {
                return <span className="text-muted">Không tồn tại</span>;
            }
            return (
                <div className="d-flex flex-column gap-1 overflow-x-hidden">
                    <span className="fw-semibold text-dark">
                        {value.name || "Chưa cập nhật"}
                    </span>
                    <span className="small text-muted">
                        <FontAwesomeIcon icon={faTag} className="me-2" />
                        {value.price?.toLocaleString("vi-VN") ?? "Chưa có giá"}đ
                    </span>
                </div>
            );
        },
    }),

    columnHelper.accessor("totalPrice", {
        header: "Tổng tiền",
        cell: info => (
            <span className="fw-semibold text-danger">
                {info.getValue()?.toLocaleString("vi-VN")}đ
            </span>
        ),
    }),

    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const value = info.getValue();
            if (!value) return "Không tồn tại";
            const conf = OrderStatusBadge[value];
            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
    }),

    columnHelper.accessor("createdAt", {
        header: "Ngày đặt",
        cell: info => {
            const value = info.getValue();
            if (!value) return <span className="text-muted">Không có</span>;
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
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-success" title="Cập nhật trạng thái">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Hủy đơn"
                        disabled={order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        },
    }),
]);

export default function FactoryOrder() {
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

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isOrder={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ ĐƠN HÀNG
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Đơn hàng của gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Theo dõi và xử lý đơn hàng từ khách mua trên sàn thương mại điện tử.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light border fw-semibold">
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất danh sách
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
                            note="Cần xác nhận đơn"
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
                            note="Đang đóng gói & vận chuyển"
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
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách đơn hàng</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin khách hàng, sản phẩm và tiến độ đơn hàng.
                                </p>
                            </div>
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} đơn hàng
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
                                    placeholder="Tìm mã đơn hàng, tên khách..."
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
                                                Chưa có đơn hàng nào.
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
