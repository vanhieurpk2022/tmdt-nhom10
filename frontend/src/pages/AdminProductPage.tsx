import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faEye,
    faBoxesStacked,
    faCircleCheck,
    faDownload,
    faRotate,
    faTriangleExclamation,
    faIndustry,
    faFlask,
    faTag,
    faStar,
    faStore,
    faShieldHalved,
    faCheck,
    faReceipt,
} from "@fortawesome/free-solid-svg-icons";

import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import { ROUTES } from "../routes/routes";
import { ProductType } from "../enums/ProductType";
import { ProductStatus } from "../enums/ProductStatus";
import CustomBadge from "../components/admin/badge/CustomBadge";
import AdminProductDetailModal, {
    type AdminProductDetail,
    AdminProductStatusBadge,
} from "../components/admin/product/AdminProductDetailModal";
import { FactoryApiService, type FactoryItem } from "../api/FactoryService";
import "../css/pages/user-admin.css";

export const ProductTypeBadge: Record<ProductType, { label: string; badge: string }> = {
    [ProductType.CUSTOM]: {
        label: "Phối hương",
        badge: "bg-purple-subtle text-purple-emphasis",
    },
    [ProductType.NORMAL]: {
        label: "Tiêu chuẩn",
        badge: "bg-primary-subtle text-primary-emphasis",
    },
};

// Dữ liệu mẫu sản phẩm toàn sàn đa dạng cho Admin, thể hiện rõ từng xưởng sản xuất
const INITIAL_ADMIN_PRODUCTS: AdminProductDetail[] = [
    {
        id: 1,
        code: "#PRD-101",
        name: "Nước hoa Nordic Timber & White Musk",
        category: "Nước hoa Nam",
        productType: ProductType.NORMAL,
        status: ProductStatus.ACTIVE,
        thumbnailUrl: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&auto=format&fit=crop&q=60",
        price: 850000,
        maxPrice: 1650000,
        totalStock: 68,
        totalSold: 214,
        rating: 4.9,
        reviewCount: 78,
        createdAt: "2026-02-15T08:30:00Z",
        description: "Hương gỗ tuyết tùng Bắc Âu kết hợp nốt xạ hương trắng êm dịu, tạo cảm giác sang trọng, thanh lịch cho quý ông hiện đại.",
        factoryId: 1,
        factoryName: "Nordic Lab TP.HCM",
        factoryAddress: "Khu Chế Xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh",
        factoryPhone: "0988 123 456",
        factoryEmail: "contact@nordiclab.vn",
        factoryRepresentative: "Kỹ sư Trần Minh Quang",
        variants: [
            { id: 11, mil: 10, basePrice: 150000, price: 290000, stock: 24, sold: 120, sku: "NT-10ML" },
            { id: 12, mil: 50, basePrice: 450000, price: 850000, stock: 32, sold: 68, sku: "NT-50ML" },
            { id: 13, mil: 100, basePrice: 850000, price: 1650000, stock: 12, sold: 26, sku: "NT-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Cam Bergamot", "Tiêu đen", "Bạch đậu khấu"],
            heartNotes: ["Gỗ tuyết tùng", "Cây bách xù", "Nhựa thơm"],
            baseNotes: ["Xạ hương trắng", "Cỏ hương bài", "Hổ phách"],
        },
    },
    {
        id: 2,
        code: "#PRD-102",
        name: "Nước hoa Floral Symphony Dalat Rose",
        category: "Nước hoa Nữ",
        productType: ProductType.NORMAL,
        status: ProductStatus.ACTIVE,
        thumbnailUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&auto=format&fit=crop&q=60",
        price: 920000,
        maxPrice: 1850000,
        totalStock: 45,
        totalSold: 380,
        rating: 4.8,
        reviewCount: 142,
        createdAt: "2026-03-01T10:15:00Z",
        description: "Chiết xuất trực tiếp từ hoa hồng Damask Đà Lạt vào sáng sớm, kết hợp nốt hoa mẫu đơn tạo nên sự quyến rũ ngọt ngào, tinh tế.",
        factoryId: 2,
        factoryName: "Dalat Flower Extraction Studio",
        factoryAddress: "Km 12 Đèo Prenn, Phường 3, TP. Đà Lạt, Lâm Đồng",
        factoryPhone: "0912 345 678",
        factoryEmail: "lab@dalatflower.vn",
        factoryRepresentative: "Bà Lê Hoàng Mai",
        variants: [
            { id: 21, mil: 10, basePrice: 180000, price: 320000, stock: 15, sold: 190, sku: "FS-10ML" },
            { id: 22, mil: 50, basePrice: 500000, price: 920000, stock: 22, sold: 145, sku: "FS-50ML" },
            { id: 23, mil: 100, basePrice: 950000, price: 1850000, stock: 8, sold: 45, sku: "FS-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Quả lê chín", "Hoa linh lan", "Chanh đào"],
            heartNotes: ["Hoa hồng Damask Đà Lạt", "Hoa mẫu đơn", "Hoa mộc lan"],
            baseNotes: ["Gỗ đàn hương", "Vani Madagascar", "Xạ hương"],
        },
    },
    {
        id: 3,
        code: "#PRD-103",
        name: "Nước hoa phối hương Atelier Bespoke #09",
        category: "Nước hoa Unisex",
        productType: ProductType.CUSTOM,
        status: ProductStatus.ACTIVE,
        thumbnailUrl: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&auto=format&fit=crop&q=60",
        price: 1250000,
        maxPrice: 2450000,
        totalStock: 18,
        totalSold: 92,
        rating: 5.0,
        reviewCount: 36,
        createdAt: "2026-03-12T14:40:00Z",
        description: "Công thức phối hương độc bản được chuyên gia chế tác riêng, kết hợp nốt da thuộc thuộc da cao cấp, hổ phách và gỗ trầm hương ấm áp.",
        factoryId: 3,
        factoryName: "Grasse Scent Atelier Hà Nội",
        factoryAddress: "Số 88 Phố Huế, Quận Hai Bà Trưng, TP. Hà Nội",
        factoryPhone: "0909 988 776",
        factoryEmail: "atelier@grassehanoi.com",
        factoryRepresentative: "Master Perfumer Nguyễn Quốc Bảo",
        variants: [
            { id: 31, mil: 30, basePrice: 650000, price: 1250000, stock: 10, sold: 58, sku: "BESPOKE-30ML" },
            { id: 32, mil: 50, basePrice: 950000, price: 1850000, stock: 6, sold: 26, sku: "BESPOKE-50ML" },
            { id: 33, mil: 100, basePrice: 1350000, price: 2450000, stock: 2, sold: 8, sku: "BESPOKE-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Hạt nhục đậu khấu", "Rượu Rum ủ sồi", "Cam đỏ Ý"],
            heartNotes: ["Da thuộc Florence", "Thuốc lá tẩu thơm", "Gỗ trầm hương"],
            baseNotes: ["Hổ phách xám", "Đậu Tonka", "Nhựa bồ đề"],
        },
        components: [
            { productId: 301, productName: "Tinh chất Trầm hương Hoàng gia", percentage: 35, oilVolumeMl: 17.5, note: "Trầm tự nhiên Khánh Hòa ủ 5 năm" },
            { productId: 302, productName: "Hương Da thuộc Ý cao cấp", percentage: 25, oilVolumeMl: 12.5, note: "Pha chế nền nồng độ 18%" },
            { productId: 303, productName: "Chiết xuất Rượu Rum sồi", percentage: 20, oilVolumeMl: 10.0, note: "Tạo cảm giác say nồng quyến rũ" },
            { productId: 304, productName: "Hổ phách xám tinh lọc", percentage: 20, oilVolumeMl: 10.0, note: "Giữ hương lâu trên 14 tiếng" },
        ],
    },
    {
        id: 4,
        code: "#PRD-104",
        name: "Tinh dầu khuếch tán Imperial Agarwood & Amber",
        category: "Tinh dầu thiên nhiên",
        productType: ProductType.NORMAL,
        status: ProductStatus.OUT_OF_STOCK,
        thumbnailUrl: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&auto=format&fit=crop&q=60",
        price: 520000,
        maxPrice: 980000,
        totalStock: 0,
        totalSold: 512,
        rating: 4.7,
        reviewCount: 95,
        createdAt: "2026-01-20T11:00:00Z",
        description: "Tinh dầu nguyên chất khuếch tán phòng cao cấp, thanh lọc không gian sống với mùi hương trầm ấm, giải tỏa căng thẳng sau ngày làm việc.",
        factoryId: 1,
        factoryName: "Nordic Lab TP.HCM",
        factoryAddress: "Khu Chế Xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh",
        factoryPhone: "0988 123 456",
        factoryEmail: "contact@nordiclab.vn",
        factoryRepresentative: "Kỹ sư Trần Minh Quang",
        variants: [
            { id: 41, mil: 50, basePrice: 280000, price: 520000, stock: 0, sold: 340, sku: "OIL-50ML" },
            { id: 42, mil: 100, basePrice: 480000, price: 980000, stock: 0, sold: 172, sku: "OIL-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Khuynh diệp", "Bạc hà núi", "Vỏ bưởi"],
            heartNotes: ["Trầm hương tự nhiên", "Cỏ xạ hương", "Hoa phong lữ"],
            baseNotes: ["Gỗ thông đỏ", "Hổ phách thảo mộc"],
        },
    },
    {
        id: 5,
        code: "#PRD-105",
        name: "Nước hoa Citrus Riviera Breeze",
        category: "Nước hoa Unisex",
        productType: ProductType.NORMAL,
        status: ProductStatus.ACTIVE,
        thumbnailUrl: "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&auto=format&fit=crop&q=60",
        price: 780000,
        maxPrice: 1480000,
        totalStock: 82,
        totalSold: 180,
        rating: 4.8,
        reviewCount: 54,
        createdAt: "2026-03-05T09:20:00Z",
        description: "Làn gió biển mát lành vùng Địa Trung Hải với các tầng hương cam quýt tươi mọng nước, hòa cùng muối biển mặn mòi tràn đầy năng lượng.",
        factoryId: 4,
        factoryName: "Oilia Central Lab Đà Nẵng",
        factoryAddress: "Khu Công Nghệ Cao Đà Nẵng, Hòa Vang, TP. Đà Nẵng",
        factoryPhone: "0935 778 899",
        factoryEmail: "dananglab@oilia.vn",
        factoryRepresentative: "Tiến sĩ Phan Văn Đạt",
        variants: [
            { id: 51, mil: 10, basePrice: 140000, price: 260000, stock: 35, sold: 90, sku: "CR-10ML" },
            { id: 52, mil: 50, basePrice: 420000, price: 780000, stock: 38, sold: 72, sku: "CR-50ML" },
            { id: 53, mil: 100, basePrice: 780000, price: 1480000, stock: 9, sold: 18, sku: "CR-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Chanh vàng Amalfi", "Cam đỏ Sicily", "Quả quýt Clementine"],
            heartNotes: ["Muối biển xanh", "Hoa cam Neroli", "Cây hương thảo"],
            baseNotes: ["Gỗ lũa biển", "Xạ hương sạch", "Rêu sồi"],
        },
    },
    {
        id: 6,
        code: "#PRD-106",
        name: "Nước hoa phối hương Moonlight Jasmine Custom",
        category: "Nước hoa Nữ",
        productType: ProductType.CUSTOM,
        status: ProductStatus.ACTIVE,
        thumbnailUrl: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=400&auto=format&fit=crop&q=60",
        price: 1100000,
        maxPrice: 2100000,
        totalStock: 25,
        totalSold: 64,
        rating: 4.9,
        reviewCount: 28,
        createdAt: "2026-03-18T16:00:00Z",
        description: "Hương hoa nhài đêm thanh tao hòa quyện hoa dạ lý hương và vani kem sữa, mang phong cách kiêu sa, quý phái cho dạ tiệc đêm.",
        factoryId: 2,
        factoryName: "Dalat Flower Extraction Studio",
        factoryAddress: "Km 12 Đèo Prenn, Phường 3, TP. Đà Lạt, Lâm Đồng",
        factoryPhone: "0912 345 678",
        factoryEmail: "lab@dalatflower.vn",
        factoryRepresentative: "Bà Lê Hoàng Mai",
        variants: [
            { id: 61, mil: 30, basePrice: 580000, price: 1100000, stock: 15, sold: 42, sku: "MJ-30ML" },
            { id: 62, mil: 50, basePrice: 880000, price: 1650000, stock: 8, sold: 18, sku: "MJ-50ML" },
            { id: 63, mil: 100, basePrice: 1200000, price: 2100000, stock: 2, sold: 4, sku: "MJ-100ML" },
        ],
        fragranceNotes: {
            topNotes: ["Lá trà xanh non", "Hoa sơn trà", "Cam Bergamot"],
            heartNotes: ["Hoa nhài Sambac đêm", "Hoa nguyệt quế", "Dạ lý hương"],
            baseNotes: ["Vani kem sữa", "Gỗ bách hương", "Xạ hương phấn"],
        },
        components: [
            { productId: 601, productName: "Tinh dầu Hoa nhài Đà Lạt", percentage: 40, oilVolumeMl: 20.0, note: "Chiết xuất lạnh CO2 siêu tới hạn" },
            { productId: 602, productName: "Chiết xuất Dạ lý hương Tây Bắc", percentage: 25, oilVolumeMl: 12.5, note: "Gia tăng độ tỏa hương ban đêm" },
            { productId: 603, productName: "Tinh chất Trà xanh Bảo Lộc", percentage: 20, oilVolumeMl: 10.0, note: "Cân bằng độ tươi mát tự nhiên" },
            { productId: 604, productName: "Hương Vani Bourbon Madagascar", percentage: 15, oilVolumeMl: 7.5, note: "Lưu giữ tầng hương cuối êm dịu" },
        ],
    },
];

export default function AdminProductPage() {
    const { isCollapsed: isSidebarCollapsed } = useAdminSidebar();

    // Data states
    const [products, setProducts] = useState<AdminProductDetail[]>(INITIAL_ADMIN_PRODUCTS);
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Filters states
    const [search, setSearch] = useState<string>("");
    const [factoryFilter, setFactoryFilter] = useState<string>("ALL");
    const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
    const [productTypeFilter, setProductTypeFilter] = useState<string>("ALL");
    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [sortBy, setSortBy] = useState<string>("createdAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

    // Pagination
    const [page, setPage] = useState<number>(0);
    const pageSize = 10;

    // Modal state
    const [selectedProduct, setSelectedProduct] = useState<AdminProductDetail | null>(null);

    // Toast state
    const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "danger" | "info" } | null>(null);

    const showToast = (text: string, type: "success" | "danger" | "info" = "success") => {
        setToastMessage({ text, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Load actual factories from backend API if available
    useEffect(() => {
        FactoryApiService.getAllFactories()
            .then((list) => {
                if (list && list.length > 0) {
                    setFactories(list);
                }
            })
            .catch((err) => console.log("Lấy danh sách xưởng phụ:", err));
    }, []);

    // Danh sách các danh mục độc nhất
    const categories = useMemo(() => {
        const set = new Set<string>();
        INITIAL_ADMIN_PRODUCTS.forEach((p) => set.add(p.category));
        return Array.from(set);
    }, []);

    // Danh sách xưởng tổng hợp (từ mock + backend)
    const availableFactories = useMemo(() => {
        const map = new Map<number, string>();
        INITIAL_ADMIN_PRODUCTS.forEach((p) => map.set(p.factoryId, p.factoryName));
        factories.forEach((f) => map.set(f.id, f.name));
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [factories]);

    // Lọc và sắp xếp dữ liệu
    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            // Tìm kiếm
            if (search.trim()) {
                const term = search.trim().toLowerCase();
                const matchCode = p.code.toLowerCase().includes(term);
                const matchName = p.name.toLowerCase().includes(term);
                const matchFactory = p.factoryName.toLowerCase().includes(term);
                const matchCat = p.category.toLowerCase().includes(term);
                if (!matchCode && !matchName && !matchFactory && !matchCat) return false;
            }

            // Lọc Xưởng
            if (factoryFilter !== "ALL" && p.factoryId !== Number(factoryFilter)) {
                return false;
            }

            // Lọc Danh mục
            if (categoryFilter !== "ALL" && p.category !== categoryFilter) {
                return false;
            }

            // Lọc Loại sản phẩm
            if (productTypeFilter !== "ALL" && p.productType !== productTypeFilter) {
                return false;
            }

            // Lọc Trạng thái
            if (statusFilter !== "ALL" && p.status !== statusFilter) {
                return false;
            }

            return true;
        }).sort((a, b) => {
            if (sortBy === "price") {
                return sortDir === "asc" ? a.price - b.price : b.price - a.price;
            }
            if (sortBy === "stock") {
                return sortDir === "asc" ? a.totalStock - b.totalStock : b.totalStock - a.totalStock;
            }
            if (sortBy === "sold") {
                return sortDir === "asc" ? a.totalSold - b.totalSold : b.totalSold - a.totalSold;
            }
            // Mặc định createdAt
            return sortDir === "asc"
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [products, search, factoryFilter, categoryFilter, productTypeFilter, statusFilter, sortBy, sortDir]);

    // Phân trang
    const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
    const paginatedProducts = useMemo(() => {
        const start = page * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, page, pageSize]);

    // Thống kê tổng hợp (Metrics)
    const stats = useMemo(() => {
        const total = products.length;
        const active = products.filter((p) => p.status === ProductStatus.ACTIVE).length;
        const outOfStock = products.filter((p) => p.status === ProductStatus.OUT_OF_STOCK || p.totalStock === 0).length;
        const customCount = products.filter((p) => p.productType === ProductType.CUSTOM).length;
        const totalWorkshops = new Set(products.map((p) => p.factoryId)).size;

        return {
            totalProducts: total,
            activeCount: active,
            outOfStockCount: outOfStock,
            customCount,
            totalWorkshops,
        };
    }, [products]);

    // Xuất file CSV
    const handleExportCsv = () => {
        if (filteredProducts.length === 0) {
            showToast("Không có sản phẩm nào để xuất file.", "info");
            return;
        }

        const headers = ["Mã SP", "Tên sản phẩm", "Danh mục", "Loại", "Xưởng chế tác", "Địa chỉ xưởng", "Giá bán từ (VNĐ)", "Tồn kho", "Đã bán", "Trạng thái"];
        const rows = filteredProducts.map((p) => [
            `"${p.code}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.category}"`,
            `"${p.productType === ProductType.CUSTOM ? "Phối hương" : "Tiêu chuẩn"}"`,
            `"${p.factoryName.replace(/"/g, '""')}"`,
            `"${p.factoryAddress.replace(/"/g, '""')}"`,
            p.price,
            p.totalStock,
            p.totalSold,
            `"${AdminProductStatusBadge[p.status]?.label || p.status}"`,
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Danh_sach_san_pham_admin_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`Đã xuất báo cáo CSV (${filteredProducts.length} sản phẩm)!`, "success");
    };

    return (
        <div className="d-flex min-vh-100 w-100 admin-customer-page">
            {/* Sidebar */}
            <aside
                className="flex-shrink-0 position-sticky top-0 align-self-start"
                style={{
                    width: isSidebarCollapsed ? "72px" : "250px",
                    minWidth: isSidebarCollapsed ? "72px" : "250px",
                    height: "100vh",
                    zIndex: 1000,
                    backgroundColor: "var(--color-bg-dark, #111827)",
                    transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                <SidebarAdmin isProduct={true} />
            </aside>

            {/* Main Content Area */}
            <div className="flex-grow-1 p-3 p-lg-4 overflow-x-auto" style={{ minWidth: 0 }}>
                {/* Toast Notification */}
                {toastMessage && (
                    <div
                        className={`alert alert-${toastMessage.type === "danger" ? "danger" : toastMessage.type === "info" ? "info" : "success"} d-flex align-items-center justify-content-between mb-3 py-2 px-3 shadow-sm rounded-3`}
                        style={{ fontSize: "13px" }}
                    >
                        <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={toastMessage.type === "danger" ? faTriangleExclamation : faCircleCheck} />
                            <span>{toastMessage.text}</span>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={() => setToastMessage(null)}
                        />
                    </div>
                )}

                {/* Breadcrumb & Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                    <div>
                        <div className="admin-breadcrumb">
                            <span>Quản trị hệ thống</span>
                            <span className="crumb-sep">›</span>
                            <span>Vận hành lõi</span>
                            <span className="crumb-sep">›</span>
                            <span className="active-crumb">Quản lý sản phẩm toàn sàn</span>
                        </div>
                        <h1 className="h4 fw-bold text-dark mb-0">Quản lý Sản phẩm &amp; Xưởng chế tác</h1>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <Link to={ROUTES.ADMIN_ORDER} className="btn-action-secondary text-decoration-none">
                            <FontAwesomeIcon icon={faReceipt} className="me-1" />
                            Quản lý Đơn hàng
                        </Link>

                        <button
                            type="button"
                            className="btn-action-secondary"
                            onClick={() => {
                                setLoading(true);
                                setTimeout(() => {
                                    setLoading(false);
                                    showToast("Đã đồng bộ danh mục sản phẩm và xưởng mới nhất!", "info");
                                }, 300);
                            }}
                            title="Làm mới dữ liệu"
                        >
                            <FontAwesomeIcon icon={faRotate} className={loading ? "fa-spin" : ""} />
                            <span>Làm mới</span>
                        </button>

                        <button className="btn-header-export" onClick={handleExportCsv} title="Xuất file báo cáo sản phẩm CSV">
                            <FontAwesomeIcon icon={faDownload} />
                            <span>Xuất báo cáo CSV</span>
                        </button>
                    </div>
                </div>

                {/* ── 4 THẺ METRICS (Bố cục chuẩn) ── */}
                <div className="row g-3 mb-4">
                    {/* Thẻ 1: Tổng số sản phẩm */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">TỔNG SỐ SẢN PHẨM</span>
                                <span className="metric-card-icon blue">
                                    <FontAwesomeIcon icon={faBoxesStacked} />
                                </span>
                            </div>
                            <div className="metric-card-value">{stats.totalProducts}</div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip blue">Toàn hệ thống</span>
                                <span className="text-secondary ms-2 small">
                                    {stats.customCount} độc bản, {stats.totalProducts - stats.customCount} chuẩn
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 2: Đang mở bán */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">ĐANG KINH DOANH</span>
                                <span className="metric-card-icon green">
                                    <FontAwesomeIcon icon={faCircleCheck} />
                                </span>
                            </div>
                            <div className="metric-card-value">{stats.activeCount}</div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip green">Đang bán tốt</span>
                                <span className="text-secondary ms-2 small">Hiển thị trên gian hàng</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 3: Hết hàng / Cảnh báo */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">HẾT HÀNG / BÁO ĐỘNG</span>
                                <span className="metric-card-icon amber">
                                    <FontAwesomeIcon icon={faTriangleExclamation} />
                                </span>
                            </div>
                            <div className="metric-card-value">
                                <span className={stats.outOfStockCount > 0 ? "text-danger" : ""}>
                                    {stats.outOfStockCount}
                                </span>
                            </div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip red">Cần bù kho</span>
                                <span className="text-secondary ms-2 small">Nhắc xưởng bổ sung</span>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 4: Xưởng sản xuất liên kết */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="metric-card">
                            <div className="metric-card-top">
                                <span className="metric-card-label">XƯỞNG CHẾ TÁC PHỤ TRÁCH</span>
                                <span className="metric-card-icon purple">
                                    <FontAwesomeIcon icon={faIndustry} />
                                </span>
                            </div>
                            <div className="metric-card-value">{stats.totalWorkshops} xưởng</div>
                            <div className="metric-card-footer d-flex flex-wrap gap-1 align-items-center">
                                <span className="metric-chip blue">Chứng nhận IFRA</span>
                                <span className="text-secondary ms-2 small">Gia công khép kín</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── THANH TÌM KIẾM & BỘ LỌC ĐA CHIỀU (Filter Card) ── */}
                <div className="filter-card mb-3">
                    <div className="row g-2 align-items-center">
                        {/* Tìm kiếm */}
                        <div className="col-12 col-lg-3">
                            <div className="search-input-wrapper">
                                <FontAwesomeIcon icon={faMagnifyingGlass} />
                                <input
                                    type="text"
                                    placeholder="Tìm mã SP (#PRD-...), tên SP, xưởng..."
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        setPage(0);
                                    }}
                                />
                            </div>
                        </div>

                        {/* Lọc Xưởng sản xuất (TRỌNG TÂM YÊU CẦU) */}
                        <div className="col-6 col-sm-4 col-lg-3">
                            <select
                                className="filter-select w-100 fw-semibold text-danger"
                                value={factoryFilter}
                                onChange={(e) => {
                                    setFactoryFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">🏭 Xưởng: Tất cả xưởng chế tác</option>
                                {availableFactories.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc Danh mục */}
                        <div className="col-6 col-sm-4 col-lg-2">
                            <select
                                className="filter-select w-100"
                                value={categoryFilter}
                                onChange={(e) => {
                                    setCategoryFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">Danh mục: Tất cả</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Lọc Loại sản phẩm (Custom vs Normal) */}
                        <div className="col-6 col-sm-4 col-lg-2">
                            <select
                                className="filter-select w-100"
                                value={productTypeFilter}
                                onChange={(e) => {
                                    setProductTypeFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">Loại: Tất cả</option>
                                <option value={ProductType.CUSTOM}>Phối hương độc bản</option>
                                <option value={ProductType.NORMAL}>Sản phẩm tiêu chuẩn</option>
                            </select>
                        </div>

                        {/* Lọc Trạng thái kinh doanh */}
                        <div className="col-6 col-sm-4 col-lg-1">
                            <select
                                className="filter-select w-100"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="ALL">Trạng thái</option>
                                <option value={ProductStatus.ACTIVE}>Đang bán</option>
                                <option value={ProductStatus.OUT_OF_STOCK}>Hết hàng</option>
                                <option value={ProductStatus.INACTIVE}>Tạm ngưng</option>
                            </select>
                        </div>

                        {/* Nút đặt lại bộ lọc */}
                        <div className="col-12 col-sm-4 col-lg-1">
                            <button
                                type="button"
                                className="btn-action-secondary w-100 d-flex align-items-center justify-content-center gap-1"
                                onClick={() => {
                                    setSearch("");
                                    setFactoryFilter("ALL");
                                    setCategoryFilter("ALL");
                                    setProductTypeFilter("ALL");
                                    setStatusFilter("ALL");
                                    setPage(0);
                                }}
                                style={{ height: "38px" }}
                                title="Đặt lại bộ lọc"
                            >
                                <FontAwesomeIcon icon={faRotate} />
                                <span>Reset</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── BẢNG DỮ LIỆU SẢN PHẨM ── */}
                <div className="table-card">
                    <div className="table-responsive">
                        <table className="admin-order-table">
                            <thead>
                                <tr>
                                    <th style={{ width: "130px", minWidth: "120px" }}>Mã &amp; Hình ảnh</th>
                                    <th style={{ minWidth: "240px" }}>Tên sản phẩm &amp; Danh mục</th>
                                    <th style={{ width: "230px", minWidth: "220px" }}>
                                        <FontAwesomeIcon icon={faIndustry} className="text-danger me-1" />
                                        Xưởng sản xuất phụ trách
                                    </th>
                                    <th style={{ width: "160px", minWidth: "150px" }}>Dung tích &amp; Giá bán</th>
                                    <th style={{ width: "140px", minWidth: "130px", textAlign: "center" }}>Tồn kho &amp; Đã bán</th>
                                    <th style={{ width: "130px", minWidth: "120px", textAlign: "center" }}>Trạng thái</th>
                                    <th style={{ width: "120px", minWidth: "110px", textAlign: "center" }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5">
                                            <span className="spinner-border text-danger me-2" role="status" />
                                            Đang đồng bộ danh mục sản phẩm từ máy chủ...
                                        </td>
                                    </tr>
                                ) : paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-5 text-muted">
                                            <FontAwesomeIcon icon={faBoxesStacked} className="fs-2 mb-2 d-block opacity-50" />
                                            Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product) => {
                                        const statusConf = AdminProductStatusBadge[product.status] || {
                                            label: product.status,
                                            badge: "bg-secondary text-white",
                                        };

                                        return (
                                            <tr key={product.id}>
                                                {/* Cột 1: Mã & Ảnh đại diện */}
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <img
                                                            src={product.thumbnailUrl}
                                                            alt={product.name}
                                                            className="rounded-3 border object-fit-cover flex-shrink-0"
                                                            style={{ width: "46px", height: "46px" }}
                                                        />
                                                        <div>
                                                            <span className="customer-name font-monospace d-block" style={{ fontSize: "12.5px" }}>
                                                                {product.code}
                                                            </span>
                                                            <span className="text-muted" style={{ fontSize: "11px" }}>
                                                                #{product.id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cột 2: Tên sản phẩm & Danh mục */}
                                                <td>
                                                    <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                                        <span
                                                            className="fw-bold text-dark text-truncate"
                                                            style={{ fontSize: "13px", maxWidth: "260px" }}
                                                            title={product.name}
                                                        >
                                                            {product.name}
                                                        </span>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <span className="text-secondary small" style={{ fontSize: "11.5px" }}>
                                                                <FontAwesomeIcon icon={faTag} className="me-1 text-muted" />
                                                                {product.category}
                                                            </span>
                                                            {product.productType === ProductType.CUSTOM ? (
                                                                <span className="badge bg-purple-subtle text-purple-emphasis" style={{ fontSize: "10px" }}>
                                                                    Phối hương độc bản
                                                                </span>
                                                            ) : (
                                                                <span className="badge bg-primary-subtle text-primary-emphasis" style={{ fontSize: "10px" }}>
                                                                    Tiêu chuẩn
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Cột 3: XƯỞNG SẢN XUẤT PHỤ TRÁCH (TRỌNG TÂM YÊU CẦU) */}
                                                <td>
                                                    <div className="d-flex flex-column" style={{ minWidth: 0 }}>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <span className="badge bg-danger-subtle text-danger-emphasis fw-bold py-1 px-2">
                                                                <FontAwesomeIcon icon={faIndustry} className="me-1" />
                                                                {product.factoryName}
                                                            </span>
                                                        </div>
                                                        <span
                                                            className="text-secondary text-truncate mt-1"
                                                            style={{ fontSize: "11.5px", maxWidth: "210px" }}
                                                            title={product.factoryAddress}
                                                        >
                                                            {product.factoryAddress}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 4: Dung tích & Giá bán */}
                                                <td>
                                                    <div className="ltv-cell">
                                                        <span className="ltv-amount text-danger" style={{ fontSize: "13px" }}>
                                                            {formatVnd(product.price)}
                                                            {product.maxPrice && product.maxPrice > product.price
                                                                ? ` - ${formatVnd(product.maxPrice)}`
                                                                : ""}
                                                        </span>
                                                        <span className="ltv-sub">
                                                            {product.variants.map((v) => `${v.mil}ml`).join(" • ")}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 5: Tồn kho & Đã bán */}
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="d-flex flex-column align-items-center">
                                                        {product.totalStock > 10 ? (
                                                            <span className="badge bg-success-subtle text-success-emphasis" style={{ fontSize: "11px" }}>
                                                                Kho: {product.totalStock} chai
                                                            </span>
                                                        ) : product.totalStock > 0 ? (
                                                            <span className="badge bg-warning-subtle text-warning-emphasis" style={{ fontSize: "11px" }}>
                                                                Kho: {product.totalStock} (Sắp hết)
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-danger-subtle text-danger-emphasis" style={{ fontSize: "11px" }}>
                                                                Hết hàng
                                                            </span>
                                                        )}
                                                        <span className="text-secondary mt-1" style={{ fontSize: "11px" }}>
                                                            Đã bán: <strong>{product.totalSold}</strong>
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 6: Trạng thái */}
                                                <td style={{ textAlign: "center" }}>
                                                    <div className="d-flex justify-content-center">
                                                        <span
                                                            className={`status-pill ${
                                                                product.status === ProductStatus.ACTIVE
                                                                    ? "active"
                                                                    : product.status === ProductStatus.OUT_OF_STOCK
                                                                    ? "banned"
                                                                    : "inactive"
                                                            }`}
                                                        >
                                                            <span className="dot" />
                                                            {statusConf.label}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Cột 7: Thao tác - Xem chi tiết */}
                                                <td style={{ textAlign: "center", width: "120px", minWidth: "110px" }}>
                                                    <div className="order-action-group justify-content-center">
                                                        <button
                                                            type="button"
                                                            className="order-action-btn btn-view"
                                                            onClick={() => setSelectedProduct(product)}
                                                            title="Xem chi tiết sản phẩm & Xưởng sản xuất"
                                                        >
                                                            <FontAwesomeIcon icon={faEye} />
                                                            <span>Chi tiết</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer phân trang */}
                    <div className="table-footer">
                        <div>
                            Hiển thị <strong>{filteredProducts.length === 0 ? 0 : page * pageSize + 1} - {Math.min((page + 1) * pageSize, filteredProducts.length)}</strong> trên tổng số{" "}
                            <strong>{filteredProducts.length}</strong> sản phẩm
                        </div>
                        <div className="pagination-btns">
                            <button
                                className="pagination-btn"
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                            >
                                Trang trước
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn ${page === pageNum - 1 ? "active" : ""}`}
                                    onClick={() => setPage(pageNum - 1)}
                                >
                                    {pageNum}
                                </button>
                            ))}
                            <button
                                className="pagination-btn"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(page + 1)}
                            >
                                Trang sau
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal xem chi tiết sản phẩm & xưởng chế tác */}
            <AdminProductDetailModal
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
            />
        </div>
    );
}

