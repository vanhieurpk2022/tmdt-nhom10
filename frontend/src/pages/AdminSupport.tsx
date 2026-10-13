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
    faTicket,
    faMoneyBill,
    faChartSimple,
    faCartShopping,
    faPlus,
    faMagnifyingGlass,
    faEnvelope,
    faPhone,
    faClipboardList,
    faClock,
    faSpinner,
    faCircleCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faEye, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import StatCard from "../components/admin/dashboard/StartCard";
import PromotionEffectChart from "../components/admin/statistics/PromotionEffectChart";
import { useState } from "react";
import { DisputeStatus, DisputeType, type Dispute } from "../enums/Dispute";
import { User } from "../models/User";
import { Factory } from "../models/Factory";
import CustomBadge from "../components/admin/badge/CustomBadge";

export const ExampleData: Dispute[] = [
    {
        id: 1,
        orderCode: "ORD-20261001-001",
        user: new User({
            id: 101,
            fullname: "Nguyễn văn A",
            email: "vana@gmail.com",
            phone: "0901234567",
        }),
        factory: new Factory({
            id: 201,
            name: "Xưởng Tinh Dầu Thiên Nhiên",
            address: "Quận 12, TP. Hồ Chí Minh",
        }),
        type: DisputeType.PRODUCT_QUALITY,
        title: "Sản phẩm có mùi khác với mô tả",
        description:
            "Khách hàng phản ánh tinh dầu nhận được có mùi khác với mô tả trên hệ thống và yêu cầu kiểm tra chất lượng sản phẩm.",
        evidenceImages: [
            "/images/disputes/product-1.jpg",
            "/images/disputes/product-2.jpg",
        ],
        requestedResolution: "Hoàn tiền",
        status: DisputeStatus.PENDING,
        createdAt: "2026-10-01T09:30:00Z",
    },
    {
        id: 2,
        orderCode: "ORD-20261002-002",
        user: new User({
            id: 102,
            fullname: "Nguyễn văn A",
            email: "thib@gmail.com",
            phone: "0912345678",
        }),
        factory: new Factory({
            id: 202,
            name: "Xưởng Hương Việt",
            address: "Thủ Đức, TP. Hồ Chí Minh",
        }),
        type: DisputeType.WRONG_PRODUCT,
        title: "Giao sai loại tinh dầu",
        description:
            "Khách hàng đặt tinh dầu sả chanh nhưng nhận được tinh dầu bạc hà. Khách hàng đã cung cấp hình ảnh sản phẩm nhận được.",
        evidenceImages: [
            "/images/disputes/wrong-product.jpg",
        ],
        requestedResolution: "Đổi sản phẩm đúng",
        status: DisputeStatus.PROCESSING,
        createdAt: "2026-10-02T14:15:00Z",
        adminNote: "Đang yêu cầu xưởng xác nhận thông tin đơn hàng.",
    },
    {
        id: 3,
        orderCode: "ORD-20261003-003",
        user: new User({
            id: 103,
            fullname: "Nguyễn văn A",
            email: "minhc@gmail.com",
            phone: "0934567890",
        }),
        factory: new Factory({
            id: 203,
            name: "Xưởng Aroma Natural",
            address: "Biên Hòa, Đồng Nai",
        }),
        type: DisputeType.DELIVERY,
        title: "Sản phẩm bị rò rỉ khi vận chuyển",
        description:
            "Khách hàng nhận được chai tinh dầu bị rò rỉ, một phần dung dịch đã chảy ra ngoài và bao bì bị ướt.",
        evidenceImages: [
            "/images/disputes/leaking-bottle.jpg",
        ],
        requestedResolution: "Gửi sản phẩm thay thế",
        status: DisputeStatus.RESOLVED,
        createdAt: "2026-10-03T08:00:00Z",
        resolvedAt: "2026-10-05T10:00:00Z",
        adminNote: "Xưởng đồng ý gửi sản phẩm thay thế cho khách hàng.",
    },
    {
        id: 4,
        orderCode: "ORD-20261004-004",
        user: new User({
            id: 104,
            fullname: "Nguyễn văn A",
            email: "led@gmail.com",
            phone: "0987654321",
        }),
        factory: new Factory({
            id: 204,
            name: "Xưởng Tinh Dầu Mộc",
            address: "Đà Lạt, Lâm Đồng",
        }),
        type: DisputeType.REFUND,
        title: "Xưởng từ chối yêu cầu hoàn tiền",
        description:
            "Khách hàng yêu cầu hoàn tiền do sản phẩm không đáp ứng thỏa thuận. Xưởng cho rằng sản phẩm đã được sản xuất theo đúng công thức đặt hàng.",
        evidenceImages: [],
        requestedResolution: "Hoàn tiền toàn bộ",
        status: DisputeStatus.PROCESSING,
        createdAt: "2026-10-04T11:45:00Z",
        adminNote: "Cần kiểm tra công thức sản phẩm và lịch sử trao đổi của hai bên.",
    },
    {
        id: 5,
        orderCode: "ORD-20261005-005",
        user: new User({
            id: 105,
            fullname: "Nguyễn văn A",
            email: "thie@gmail.com",
            phone: "0971234567",
        }),
        factory: new Factory({
            id: 205,
            name: "Xưởng Green Essence",
            address: "Cần Thơ",
        }),
        type: DisputeType.OTHER,
        title: "Tranh chấp thời gian hoàn thành đơn hàng",
        description:
            "Đơn hàng đã quá thời gian dự kiến nhưng xưởng chưa bàn giao sản phẩm. Khách hàng yêu cầu cập nhật tiến độ và phương án xử lý.",
        evidenceImages: [],
        requestedResolution: "Hủy đơn và hoàn tiền",
        status: DisputeStatus.CLOSED,
        createdAt: "2026-10-05T16:20:00Z",
        resolvedAt: "2026-10-07T09:00:00Z",
        adminNote: "Yêu cầu bị từ chối sau khi đối chiếu điều khoản đơn hàng và bằng chứng liên quan.",
    },
];

export const DisputeTypeBadge: Record<DisputeType, { label: string; badge: string }> = {
    [DisputeType.PRODUCT_QUALITY]: {
        label: "Chất lượng sản phẩm",
        badge: "bg-danger-subtle text-danger-emphasis",
    },
    [DisputeType.WRONG_PRODUCT]: {
        label: "Sai sản phẩm",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [DisputeType.DELIVERY]: {
        label: "Vấn đề giao hàng",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [DisputeType.REFUND]: {
        label: "Hoàn tiền",
        badge: "bg-success-subtle text-success-emphasis",
    },
    [DisputeType.OTHER]: {
        label: "Khác",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

export const DisputeStatusBadge: Record<DisputeStatus, { label: string; badge: string }> = {
    [DisputeStatus.PENDING]: {
        label: "Đang chờ",
        badge: "bg-warning-subtle text-warning-emphasis",
    },
    [DisputeStatus.CLOSED]: {
        label: "Đóng",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
    [DisputeStatus.PROCESSING]: {
        label: "Đang xử lý",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
    [DisputeStatus.RESOLVED]: {
        label: "Đã giải quyết",
        badge: "bg-success-subtle text-success-emphasis",
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
const columnHelper = createColumnHelper<typeof features, Dispute>();
const columns = columnHelper.columns([
    columnHelper.accessor("orderCode", {
        header: "Mã đơn hàng",
        cell: info => <b>{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),
    columnHelper.accessor("user", {
        header: "Người dùng",
        cell: info => {
            const value = info.getValue();
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
            )
        },
    }),

    columnHelper.accessor("type", {
        header: "Loại tranh chấp",
        cell: info => {
            const value = info.getValue();
            const conf = DisputeTypeBadge[value];
            return (
                <CustomBadge label={conf.label} badge={conf.badge} />
            )
        },
    }),
    columnHelper.accessor("requestedResolution", {
        header: "Yêu cầu",
        cell: info => info.getValue(),
    }),
    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const value = info.getValue();
            const conf = DisputeStatusBadge[value];
            return (
                <CustomBadge label={conf.label} badge={conf.badge} />
            )
        },
    }),
    columnHelper.accessor("createdAt", {
        header: "Ngày tạo",
        cell: info => new Date(info.getValue()).toLocaleDateString("vi-VN"),
    }),
    columnHelper.accessor("resolvedAt", {
        header: "Ngày giải quyết",
        cell: info => {
            const value = info.getValue();

            if (!value) {
                return <span className="text-muted">Chưa giải quyết</span>;
            }

            return new Date(value).toLocaleDateString("vi-VN");
        }
    }),
    columnHelper.display({
        id: "actions",
        header: "Hành động",
        cell: info => {
            const voucher = info.row.original;
            return (
                <div className="d-flex align-items-center gap-2 ">
                    {/* Xem chi tiết */}
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>

                    {/* Chỉnh sửa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-success" >
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>

                    {/* Xóa */}
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        title="Xóa"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        }


    }),
]);

export function AdminSupport() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });


    return (
        <div className="row g-0 min-vh-100 bg-light">
            {/* Sidebar */}

            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SidebarAdmin isSupport={true} />
            </aside>

            {/* Main content */}
            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ HỖ TRỢ
                        </div>

                        <h2 className="fw-bold text-dark mb-2">
                            Quản lý khiếu nại
                        </h2>

                        <p className="text-secondary mb-0">
                            Tiếp nhận, theo dõi và giải quyết khiếu nại
                            của khách hàng liên quan đến đơn hàng và sản phẩm.
                        </p>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <section className="row g-3 mb-4">
                        <div className="col-12 col-md-6 col-xxl-3">
                            <StatCard
                                label="TỔNG KHIẾU NẠI"
                                value="128"
                                icon={faClipboardList}
                                tone="danger"
                                note="Tất cả khiếu nại"
                            />
                        </div>

                        <div className="col-12 col-md-6 col-xxl-3">
                            <StatCard
                                label="CHỜ XỬ LÝ"
                                value="24"
                                icon={faClock}
                                tone="warning"
                                note="Cần được tiếp nhận"
                            />
                        </div>

                        <div className="col-12 col-md-6 col-xxl-3">
                            <StatCard
                                label="ĐANG XỬ LÝ"
                                value="18"
                                icon={faSpinner}
                                tone="info"
                                note="Đang xác minh thông tin"
                            />
                        </div>

                        <div className="col-12 col-md-6 col-xxl-3">
                            <StatCard
                                label="ĐÃ GIẢI QUYẾT"
                                value="86"
                                icon={faCircleCheck}
                                tone="success"
                                note="Khiếu nại đã xử lý"
                            />
                        </div>
                    </section>
                </section>

                {/* Voucher table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        {/* Table heading */}
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">
                                    Danh sách khiếu nại
                                </h5>

                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin khách hàng, đơn hàng và tiến độ xử lý.
                                </p>
                            </div>

                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} khiếu nại
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
                                    placeholder="Tìm mã voucher, trạng thái..."
                                    value={search}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearch(value);
                                        table.setGlobalFilter(value);
                                    }}
                                />
                            </div>
                            <table className="table table-hover align-middle mb-0 admin-voucher-table">
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
                                                Chưa có voucher nào.
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