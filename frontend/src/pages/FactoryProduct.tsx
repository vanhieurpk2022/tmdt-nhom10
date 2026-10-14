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
    faTag,
    faBoxOpen,
    faCircleCheck,
    faCircleXmark,
    faCirclePlus,
    faDownload,
    faEye,
    faPenToSquare,
    faTrash,
    faToggleOn,
    faToggleOff,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SideBarFactory from "../components/admin/factory/SideBarFactory";
import StatCard from "../components/admin/dashboard/StartCard";
import CustomBadge from "../components/admin/badge/CustomBadge";
import { useState } from "react";
import { ProductType } from "../enums/ProductType";
import { Product } from "../models/Product";
import "../css/pages/dashboard/admin.css";
import "../css/pages/dashboard/dashboard.css";

interface FactoryProductItem {
    id: number;
    name: string;
    price: number;
    stock: number;
    sold: number;
    productType: ProductType;
    status: "ACTIVE" | "INACTIVE";
    createdAt: string;
    category: string;
}

const ExampleData: FactoryProductItem[] = [
    {
        id: 1,
        name: "Tinh dầu sả chanh nguyên chất",
        price: 150000,
        stock: 200,
        sold: 85,
        productType: ProductType.NORMAL,
        status: "ACTIVE",
        createdAt: "2026-09-15T08:30:00Z",
        category: "Tinh dầu",
    },
    {
        id: 2,
        name: "Tinh dầu bạc hà Premium",
        price: 200000,
        stock: 150,
        sold: 120,
        productType: ProductType.NORMAL,
        status: "ACTIVE",
        createdAt: "2026-09-20T10:00:00Z",
        category: "Tinh dầu",
    },
    {
        id: 3,
        name: "Nước hoa oải hương Lavender",
        price: 350000,
        stock: 80,
        sold: 45,
        productType: ProductType.CUSTOM,
        status: "ACTIVE",
        createdAt: "2026-10-01T14:00:00Z",
        category: "Nước hoa",
    },
    {
        id: 4,
        name: "Nến thơm hương gỗ đàn hương",
        price: 120000,
        stock: 0,
        sold: 200,
        productType: ProductType.NORMAL,
        status: "INACTIVE",
        createdAt: "2026-08-10T09:00:00Z",
        category: "Nến thơm",
    },
    {
        id: 5,
        name: "Tinh dầu trầm hương cao cấp",
        price: 500000,
        stock: 50,
        sold: 30,
        productType: ProductType.CUSTOM,
        status: "ACTIVE",
        createdAt: "2026-10-05T11:30:00Z",
        category: "Tinh dầu",
    },
];

const ProductStatusBadge: Record<string, { label: string; badge: string }> = {
    ACTIVE: {
        label: "Đang bán",
        badge: "bg-success-subtle text-success-emphasis",
    },
    INACTIVE: {
        label: "Ngừng bán",
        badge: "bg-secondary-subtle text-secondary-emphasis",
    },
};

const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
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

const columnHelper = createColumnHelper<typeof features, FactoryProductItem>();
const columns = columnHelper.columns([
    columnHelper.accessor("id", {
        header: "Mã SP",
        cell: info => <b>#{info.getValue()}</b>,
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("name", {
        header: "Sản phẩm",
        cell: info => {
            const row = info.row.original;
            const conf = ProductTypeBadge[row.productType];
            return (
                <div className="d-flex flex-column gap-1">
                    <span className="fw-semibold text-dark">{row.name}</span>
                    <div className="d-flex align-items-center gap-2">
                        <span className="small text-muted">
                            <FontAwesomeIcon icon={faTag} className="me-1" />
                            {row.category}
                        </span>
                        {conf && <CustomBadge label={conf.label} badge={conf.badge} />}
                    </div>
                </div>
            );
        },
        sortFn: "alphanumeric",
    }),

    columnHelper.accessor("price", {
        header: "Giá bán",
        cell: info => (
            <span className="fw-semibold text-danger">
                {info.getValue()?.toLocaleString("vi-VN")}đ
            </span>
        ),
        sortFn: "basic",
    }),

    columnHelper.accessor("stock", {
        header: "Tồn kho",
        cell: info => {
            const value = info.getValue();
            return (
                <span className={value === 0 ? "fw-bold text-danger" : ""}>
                    {value === 0 ? "Hết hàng" : value}
                </span>
            );
        },
        sortFn: "basic",
    }),

    columnHelper.accessor("sold", {
        header: "Đã bán",
        cell: info => info.getValue(),
        sortFn: "basic",
    }),

    columnHelper.accessor("status", {
        header: "Trạng thái",
        cell: info => {
            const value = info.getValue();
            const conf = ProductStatusBadge[value];
            return <CustomBadge label={conf.label} badge={conf.badge} />;
        },
    }),

    columnHelper.accessor("createdAt", {
        header: "Ngày tạo",
        cell: info => {
            const value = info.getValue();
            return new Date(value).toLocaleDateString("vi-VN");
        },
        sortFn: "datetime",
    }),

    columnHelper.display({
        id: "actions",
        header: "Hành động",
        cell: info => {
            const product = info.row.original;
            return (
                <div className="d-flex align-items-center gap-2">
                    <button type="button" className="btn btn-sm btn-outline-primary" title="Xem chi tiết">
                        <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-success" title="Chỉnh sửa">
                        <FontAwesomeIcon icon={faPenToSquare} />
                    </button>
                    <button
                        type="button"
                        className={`btn btn-sm ${product.status === "ACTIVE" ? "btn-outline-warning" : "btn-outline-info"}`}
                        title={product.status === "ACTIVE" ? "Ẩn sản phẩm" : "Hiện sản phẩm"}
                    >
                        <FontAwesomeIcon icon={product.status === "ACTIVE" ? faToggleOff : faToggleOn} />
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" title="Xóa">
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            );
        },
    }),
]);

export default function FactoryProductPage() {
    const [search, setSearch] = useState("");

    const table = useTable({
        data: ExampleData,
        columns,
        features,
    });

    const totalProducts = ExampleData.length;
    const activeProducts = ExampleData.filter(p => p.status === "ACTIVE").length;
    const outOfStock = ExampleData.filter(p => p.stock === 0).length;
    const totalSold = ExampleData.reduce((sum, p) => sum + p.sold, 0);

    return (
        <div className="row g-0 min-vh-100 bg-light">
            <aside
                className="col-12 col-xl-2 flex-shrink-0 position-sticky top-0 align-self-start"
                style={{ height: "100vh" }}
            >
                <SideBarFactory isProduct={true} />
            </aside>

            <main className="col-12 col-xl-10 p-3 p-lg-4 admin-content overflow-x-auto">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
                    <div>
                        <div className="text-danger fw-semibold small mb-2">
                            QUẢN LÝ SẢN PHẨM
                        </div>
                        <h2 className="fw-bold text-dark mb-2">
                            Sản phẩm của gian hàng
                        </h2>
                        <p className="text-secondary mb-0">
                            Quản lý danh sách sản phẩm đang bán trên sàn, theo dõi tồn kho và doanh số.
                        </p>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="button" className="btn btn-light border fw-semibold">
                            <FontAwesomeIcon icon={faDownload} className="me-2" />
                            Xuất danh sách
                        </button>
                        <button type="button" className="btn btn-danger fw-semibold">
                            <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                            Thêm sản phẩm
                        </button>
                    </div>
                </div>

                {/* Statistic cards */}
                <section className="row g-3 mb-4">
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG SẢN PHẨM"
                            value={String(totalProducts)}
                            icon={faBoxOpen}
                            tone="danger"
                            note="Tất cả sản phẩm"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="ĐANG BÁN"
                            value={String(activeProducts)}
                            icon={faCircleCheck}
                            tone="success"
                            note="Sản phẩm hoạt động"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="HẾT HÀNG"
                            value={String(outOfStock)}
                            icon={faCircleXmark}
                            tone="warning"
                            note="Cần nhập thêm hàng"
                        />
                    </div>
                    <div className="col-12 col-md-6 col-xxl-3">
                        <StatCard
                            label="TỔNG ĐÃ BÁN"
                            value={String(totalSold)}
                            icon={faTag}
                            tone="info"
                            note="Tổng sản phẩm đã bán"
                        />
                    </div>
                </section>

                {/* Product table */}
                <section className="card border-0 shadow-sm rounded-4 overflow-hidden">
                    <div className="card-body p-0">
                        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 p-lg-4 border-bottom">
                            <div>
                                <h5 className="fw-bold mb-1">Danh sách sản phẩm</h5>
                                <p className="text-secondary small mb-0">
                                    Quản lý thông tin, giá bán, tồn kho và trạng thái sản phẩm.
                                </p>
                            </div>
                            <span className="badge rounded-pill bg-light text-dark border px-3 py-2">
                                {table.getRowModel().rows.length} sản phẩm
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
                                    placeholder="Tìm tên sản phẩm, danh mục..."
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
                                                Chưa có sản phẩm nào.
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
