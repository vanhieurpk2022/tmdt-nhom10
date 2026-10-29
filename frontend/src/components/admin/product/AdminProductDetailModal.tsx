import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faIndustry,
    faLocationDot,
    faPhone,
    faEnvelope,
    faBoxOpen,
    faTag,
    faFlask,
    faPrint,
    faStar,
    faBoxesStacked,
    faCoins,
    faCircleCheck,
    faTriangleExclamation,
    faBan,
    faClock,
    faShieldHalved,
    faDroplet,
} from "@fortawesome/free-solid-svg-icons";
import { ProductType } from "../../../enums/ProductType";
import { ProductStatus } from "../../../enums/ProductStatus";
import CustomBadge from "../badge/CustomBadge";

export interface AdminProductVariant {
    id: number;
    mil: number;
    price: number;
    basePrice: number;
    stock: number;
    sold: number;
    sku: string;
}

export interface AdminProductComponent {
    productId: number;
    productName: string;
    percentage: number;
    oilVolumeMl?: number;
    note?: string;
}

export interface AdminProductDetail {
    id: number;
    code: string;
    name: string;
    category: string;
    productType: ProductType;
    status: ProductStatus;
    thumbnailUrl: string;
    images?: string[];
    price: number;
    maxPrice?: number;
    totalStock: number;
    totalSold: number;
    rating: number;
    reviewCount: number;
    createdAt: string;
    description: string;
    factoryId: number;
    factoryName: string;
    factoryAddress: string;
    factoryPhone: string;
    factoryEmail: string;
    factoryRepresentative?: string;
    factoryStatus?: string;
    variants: AdminProductVariant[];
    fragranceNotes?: {
        topNotes: string[];
        heartNotes: string[];
        baseNotes: string[];
    };
    components?: AdminProductComponent[];
}

interface Props {
    product: AdminProductDetail | null;
    onClose: () => void;
}

const formatVnd = (val?: number) => (val || 0).toLocaleString("vi-VN") + "đ";

const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "Chưa cập nhật";
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
};

export const AdminProductStatusBadge: Record<ProductStatus, { label: string; badge: string }> = {
    [ProductStatus.ACTIVE]: { label: "Đang mở bán", badge: "bg-success-subtle text-success-emphasis" },
    [ProductStatus.OUT_OF_STOCK]: { label: "Hết hàng", badge: "bg-danger-subtle text-danger-emphasis" },
    [ProductStatus.INACTIVE]: { label: "Tạm ngưng", badge: "bg-secondary-subtle text-secondary-emphasis" },
    [ProductStatus.DRAFT]: { label: "Bản nháp", badge: "bg-warning-subtle text-warning-emphasis" },
    [ProductStatus.ARCHIVED]: { label: "Đã lưu trữ", badge: "bg-dark-subtle text-dark-emphasis" },
};

export default function AdminProductDetailModal({ product, onClose }: Props) {
    const [activeTab, setActiveTab] = useState<"overview" | "formula">("overview");

    if (!product) return null;

    const statusConf = AdminProductStatusBadge[product.status] || {
        label: product.status,
        badge: "bg-secondary text-white",
    };

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", zIndex: 1050 }}
        >
            <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="modal-header bg-dark text-white px-4 py-3 border-0">
                        <div className="d-flex align-items-center gap-3">
                            <div
                                className="d-flex align-items-center justify-content-center bg-danger rounded-3"
                                style={{ width: "44px", height: "44px" }}
                            >
                                <FontAwesomeIcon icon={faBoxOpen} className="text-white fs-5" />
                            </div>
                            <div>
                                <div className="d-flex align-items-center gap-2">
                                    <h5 className="modal-title fw-bold text-white mb-0">
                                        {product.name}
                                    </h5>
                                    <span className="badge bg-light text-dark font-monospace">
                                        {product.code}
                                    </span>
                                    <CustomBadge label={statusConf.label} badge={statusConf.badge} />
                                </div>
                                <div className="d-flex align-items-center gap-3 small text-white-50 mt-1">
                                    <span>
                                        <FontAwesomeIcon icon={faIndustry} className="me-1 text-danger" />
                                        Xưởng sản xuất: <strong className="text-white">{product.factoryName}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        <FontAwesomeIcon icon={faTag} className="me-1" />
                                        Danh mục: <strong className="text-white">{product.category}</strong>
                                    </span>
                                    <span>•</span>
                                    <span>
                                        <FontAwesomeIcon icon={faClock} className="me-1" />
                                        Ngày tạo: {formatDateTime(product.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-light rounded-3 px-3"
                                onClick={() => window.print()}
                            >
                                <FontAwesomeIcon icon={faPrint} className="me-1" />
                                In hồ sơ SP
                            </button>
                            <button
                                type="button"
                                className="btn-close btn-close-white ms-2"
                                onClick={onClose}
                                aria-label="Close"
                            />
                        </div>
                    </div>

                    {/* Sub-header Navigation Tabs */}
                    <div className="bg-white border-bottom px-4 py-2 d-flex align-items-center justify-content-between">
                        <div className="nav nav-pills gap-2">
                            <button
                                className={`nav-link btn-sm py-1 px-3 rounded-pill fw-semibold ${
                                    activeTab === "overview" ? "active bg-danger text-white" : "text-secondary"
                                }`}
                                onClick={() => setActiveTab("overview")}
                            >
                                <FontAwesomeIcon icon={faBoxOpen} className="me-2" />
                                Thông tin chung &amp; Xưởng chế tác
                            </button>
                            <button
                                className={`nav-link btn-sm py-1 px-3 rounded-pill fw-semibold ${
                                    activeTab === "formula" ? "active bg-danger text-white" : "text-secondary"
                                }`}
                                onClick={() => setActiveTab("formula")}
                            >
                                <FontAwesomeIcon icon={faFlask} className="me-2" />
                                Công thức hương &amp; Nốt thành phần
                            </button>
                        </div>

                        <div className="small text-muted d-none d-md-block">
                            Phân loại:{" "}
                            <strong className="text-dark">
                                {product.productType === ProductType.CUSTOM
                                    ? "Phối hương độc bản (Custom Recipe)"
                                    : "Sản phẩm Tiêu chuẩn (Standard Line)"}
                            </strong>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="modal-body p-4 bg-light">
                        {activeTab === "overview" ? (
                            <div className="row g-3">
                                {/* CỘT TRÁI: XƯỞNG CHẾ TÁC PHỤ TRÁCH & MÔ TẢ */}
                                <div className="col-12 col-lg-5">
                                    {/* Card 1: XƯỞNG CHẾ TÁC PHỤ TRÁCH (TRỌNG TÂM YÊU CẦU) */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-3 border-start border-4 border-danger">
                                        <div className="card-body p-3 p-md-4">
                                            <div className="d-flex align-items-center justify-content-between mb-3">
                                                <div className="d-flex align-items-center gap-2 text-danger fw-bold small text-uppercase">
                                                    <FontAwesomeIcon icon={faIndustry} className="fs-5" />
                                                    <span>XƯỞNG CHẾ TÁC PHỤ TRÁCH</span>
                                                </div>
                                                <span className="badge bg-danger-subtle text-danger-emphasis fw-bold">
                                                    Mã xưởng: #{product.factoryId}
                                                </span>
                                            </div>

                                            <div className="p-3 bg-light rounded-3 border mb-3">
                                                <div className="fw-bold text-dark fs-6 mb-1">
                                                    {product.factoryName}
                                                </div>
                                                <div className="small text-secondary mb-2">
                                                    <FontAwesomeIcon icon={faShieldHalved} className="text-success me-1" />
                                                    Xưởng đối tác đạt chứng nhận an toàn IFRA quốc tế
                                                </div>
                                                <div className="small text-dark mb-1">
                                                    <FontAwesomeIcon icon={faLocationDot} className="text-danger me-2" />
                                                    <strong>Địa chỉ xưởng:</strong> {product.factoryAddress}
                                                </div>
                                                <div className="small text-dark mb-1">
                                                    <FontAwesomeIcon icon={faPhone} className="text-success me-2" />
                                                    <strong>Hotline hỗ trợ:</strong> {product.factoryPhone}
                                                </div>
                                                <div className="small text-dark">
                                                    <FontAwesomeIcon icon={faEnvelope} className="text-primary me-2" />
                                                    <strong>Email liên hệ:</strong> {product.factoryEmail}
                                                </div>
                                                {product.factoryRepresentative && (
                                                    <div className="small text-muted mt-2 pt-2 border-top">
                                                        Đại diện phụ trách kỹ thuật: <strong>{product.factoryRepresentative}</strong>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="alert alert-secondary py-2 px-3 small rounded-3 mb-0 border-0 bg-white shadow-sm">
                                                <div className="d-flex align-items-center gap-2 text-secondary">
                                                    <FontAwesomeIcon icon={faCircleCheck} className="text-success" />
                                                    <span>
                                                        Sản phẩm này được giao phó độc quyền sản xuất, đóng chai và kiểm định bởi xưởng <strong>{product.factoryName}</strong>.
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 2: MÔ TẢ SẢN PHẨM & CÂU CHUYỆN MÙI HƯƠNG */}
                                    <div className="card border-0 shadow-sm rounded-4">
                                        <div className="card-body p-3 p-md-4">
                                            <div className="fw-bold text-dark small text-uppercase mb-2">
                                                CÂU CHUYỆN &amp; MÔ TẢ MÙI HƯƠNG
                                            </div>
                                            <p className="small text-secondary mb-3" style={{ lineHeight: "1.6" }}>
                                                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
                                            </p>

                                            <div className="row g-2 text-center pt-2 border-top">
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded-3 border">
                                                        <div className="text-muted" style={{ fontSize: "11px" }}>Đánh giá</div>
                                                        <div className="fw-bold text-warning small mt-1">
                                                            <FontAwesomeIcon icon={faStar} className="me-1" />
                                                            {product.rating} / 5.0
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded-3 border">
                                                        <div className="text-muted" style={{ fontSize: "11px" }}>Lượt nhận xét</div>
                                                        <div className="fw-bold text-dark small mt-1">
                                                            {product.reviewCount} đánh giá
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded-3 border">
                                                        <div className="text-muted" style={{ fontSize: "11px" }}>Đã bán ra</div>
                                                        <div className="fw-bold text-success small mt-1">
                                                            {product.totalSold} chai
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* CỘT PHẢI: HÌNH ẢNH, GIÁ BÁN & BẢNG BIẾN THỂ DUNG TÍCH */}
                                <div className="col-12 col-lg-7">
                                    {/* Card 3: TỔNG QUAN GIÁ BÁN & KHO HÀNG */}
                                    <div className="card border-0 shadow-sm rounded-4 mb-3">
                                        <div className="card-body p-3 p-md-4">
                                            <div className="d-flex align-items-center gap-3">
                                                <img
                                                    src={product.thumbnailUrl}
                                                    alt={product.name}
                                                    className="rounded-3 border object-fit-cover flex-shrink-0"
                                                    style={{ width: "90px", height: "90px" }}
                                                />
                                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                                    <div className="d-flex align-items-center gap-2 mb-1">
                                                        <span className="badge bg-dark text-white">
                                                            {product.category}
                                                        </span>
                                                        {product.productType === ProductType.CUSTOM ? (
                                                            <span className="badge bg-purple-subtle text-purple-emphasis">
                                                                Phối hương riêng
                                                            </span>
                                                        ) : (
                                                            <span className="badge bg-primary-subtle text-primary-emphasis">
                                                                Dòng tiêu chuẩn
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h5 className="fw-bold text-dark mb-1">{product.name}</h5>
                                                    <div className="d-flex align-items-baseline gap-2">
                                                        <span className="text-muted small">Khoảng giá bán:</span>
                                                        <span className="fw-bold text-danger fs-5">
                                                            {formatVnd(product.price)}
                                                            {product.maxPrice && product.maxPrice > product.price
                                                                ? ` - ${formatVnd(product.maxPrice)}`
                                                                : ""}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="text-end d-none d-sm-block">
                                                    <div className="small text-muted">Tổng tồn kho:</div>
                                                    <div className="fw-bold text-dark fs-5">
                                                        {product.totalStock > 0 ? (
                                                            <span className="text-success">{product.totalStock} chai</span>
                                                        ) : (
                                                            <span className="text-danger">Hết hàng</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card 4: BẢNG BIẾN THỂ DUNG TÍCH & BẢNG GIÁ NIÊM YẾT */}
                                    <div className="card border-0 shadow-sm rounded-4">
                                        <div className="card-header bg-white border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center gap-2 fw-bold text-dark">
                                                <FontAwesomeIcon icon={faBoxesStacked} className="text-danger" />
                                                <span>Bảng biến thể dung tích ({product.variants?.length || 0} kích cỡ)</span>
                                            </div>
                                            <span className="small text-muted">Quản lý kho tại xưởng</span>
                                        </div>

                                        <div className="card-body p-0">
                                            <div className="table-responsive">
                                                <table className="table table-hover align-middle mb-0">
                                                    <thead className="table-light small text-secondary">
                                                        <tr>
                                                            <th className="ps-4">Mã SKU</th>
                                                            <th className="text-center">Dung tích</th>
                                                            <th className="text-end">Giá gốc xưởng</th>
                                                            <th className="text-end">Giá bán sàn</th>
                                                            <th className="text-center">Tồn kho</th>
                                                            <th className="text-center pe-4">Trạng thái</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {product.variants && product.variants.length > 0 ? (
                                                            product.variants.map((v) => (
                                                                <tr key={v.id}>
                                                                    <td className="ps-4 font-monospace small text-secondary">
                                                                        {v.sku}
                                                                    </td>
                                                                    <td className="text-center">
                                                                        <span className="badge bg-light text-dark border fw-bold px-2 py-1">
                                                                            {v.mil} ml
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-end small text-muted">
                                                                        {formatVnd(v.basePrice)}
                                                                    </td>
                                                                    <td className="text-end fw-bold text-danger">
                                                                        {formatVnd(v.price)}
                                                                    </td>
                                                                    <td className="text-center">
                                                                        {v.stock > 10 ? (
                                                                            <span className="badge bg-success-subtle text-success-emphasis">
                                                                                {v.stock} chai
                                                                            </span>
                                                                        ) : v.stock > 0 ? (
                                                                            <span className="badge bg-warning-subtle text-warning-emphasis">
                                                                                {v.stock} (Sắp hết)
                                                                            </span>
                                                                        ) : (
                                                                            <span className="badge bg-danger-subtle text-danger-emphasis">
                                                                                Hết hàng
                                                                            </span>
                                                                        )}
                                                                    </td>
                                                                    <td className="text-center pe-4">
                                                                        {v.stock > 0 ? (
                                                                            <span className="badge bg-success text-white">Sẵn sàng</span>
                                                                        ) : (
                                                                            <span className="badge bg-secondary text-white">Chờ châm hàng</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr>
                                                                <td colSpan={6} className="text-center py-4 text-muted">
                                                                    Chưa có biến thể dung tích cho sản phẩm này.
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* TAB 2: CÔNG THỨC HƯƠNG & NỐT THÀNH PHẦN (LAB FORMULA) */
                            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
                                <div className="border-bottom pb-3 mb-4 d-flex justify-content-between align-items-center">
                                    <div>
                                        <h5 className="fw-bold text-dark mb-1">
                                            HỒ SƠ CÔNG THỨC &amp; THÀNH PHẦN NỐT HƯƠNG
                                        </h5>
                                        <div className="small text-secondary">
                                            Thông số kỹ thuật pha chế tiêu chuẩn phòng Lab dành cho xưởng{" "}
                                            <strong className="text-danger">{product.factoryName}</strong>
                                        </div>
                                    </div>
                                    <div className="badge bg-dark fs-6 px-3 py-2">
                                        MÃ CÔNG THỨC: #FORM-{product.id}
                                    </div>
                                </div>

                                {/* Kim tự tháp mùi hương */}
                                <div className="mb-4">
                                    <h6 className="fw-bold text-dark mb-3">
                                        <FontAwesomeIcon icon={faDroplet} className="text-primary me-2" />
                                        KIM TỰ THÁP NỐT HƯƠNG (FRAGRANCE PYRAMID)
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-12 col-md-4">
                                            <div className="p-3 rounded-3 bg-light border border-info h-100">
                                                <div className="fw-bold text-info small text-uppercase mb-2">
                                                    1. NỐT HƯƠNG ĐẦU (TOP NOTES)
                                                </div>
                                                <div className="small text-muted mb-2">Bay hơi trong 15-30 phút đầu</div>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(product.fragranceNotes?.topNotes || ["Cam Bergamot", "Chanh Yuzu", "Tiêu hồng"]).map((n, i) => (
                                                        <span key={i} className="badge bg-white text-dark border">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <div className="p-3 rounded-3 bg-light border border-danger h-100">
                                                <div className="fw-bold text-danger small text-uppercase mb-2">
                                                    2. NỐT HƯƠNG GIỮA (HEART NOTES)
                                                </div>
                                                <div className="small text-muted mb-2">Tỏa hương chủ đạo trong 2-4 giờ</div>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(product.fragranceNotes?.heartNotes || ["Hoa hồng Damask", "Oải hương Pháp", "Hoa nhài Sambac"]).map((n, i) => (
                                                        <span key={i} className="badge bg-white text-dark border">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-12 col-md-4">
                                            <div className="p-3 rounded-3 bg-light border border-warning h-100">
                                                <div className="fw-bold text-warning-emphasis small text-uppercase mb-2">
                                                    3. NỐT HƯƠNG CUỐI (BASE NOTES)
                                                </div>
                                                <div className="small text-muted mb-2">Lưu hương sâu lắng trên 8-12 giờ</div>
                                                <div className="d-flex flex-wrap gap-1">
                                                    {(product.fragranceNotes?.baseNotes || ["Gỗ tuyết tùng Atlas", "Xạ hương trắng", "Hổ phách ấm"]).map((n, i) => (
                                                        <span key={i} className="badge bg-white text-dark border">
                                                            {n}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bảng thành phần tinh dầu chi tiết */}
                                <div>
                                    <h6 className="fw-bold text-dark mb-3">
                                        <FontAwesomeIcon icon={faFlask} className="text-danger me-2" />
                                        TỶ LỆ PHỐI TRỘN TINH DẦU &amp; NGUYÊN LIỆU XƯỞNG
                                    </h6>
                                    <div className="table-responsive">
                                        <table className="table table-bordered align-middle small mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th style={{ width: "50px" }} className="text-center">STT</th>
                                                    <th>Nguyên liệu / Tinh dầu cốt</th>
                                                    <th className="text-center" style={{ width: "130px" }}>Tỷ lệ %</th>
                                                    <th className="text-center" style={{ width: "160px" }}>Dung tích ml / chai 50ml</th>
                                                    <th>Ghi chú kỹ thuật pha chế tại xưởng</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(product.components || [
                                                    { productId: 101, productName: "Tinh dầu Cam Bergamot Calabria", percentage: 25, oilVolumeMl: 12.5, note: "Pha chế lạnh ở nhiệt độ 22-25°C" },
                                                    { productId: 102, productName: "Tinh dầu Hoa hồng Damask Thổ Nhĩ Kỳ", percentage: 35, oilVolumeMl: 17.5, note: "Ủ hương 48h trước khi hòa cồn thực phẩm" },
                                                    { productId: 103, productName: "Tinh chất Gỗ tuyết tùng Atlas", percentage: 25, oilVolumeMl: 12.5, note: "Cố định nốt hương nền" },
                                                    { productId: 104, productName: "Xạ hương trắng tinh khiết", percentage: 15, oilVolumeMl: 7.5, note: "Tạo độ khuếch tán và lưu hương cao cấp" },
                                                ]).map((c, idx) => (
                                                    <tr key={idx}>
                                                        <td className="text-center fw-semibold">{idx + 1}</td>
                                                        <td className="fw-bold text-dark">{c.productName}</td>
                                                        <td className="text-center">
                                                            <span className="badge bg-danger-subtle text-danger-emphasis fw-bold">
                                                                {c.percentage}%
                                                            </span>
                                                        </td>
                                                        <td className="text-center fw-semibold text-secondary">
                                                            {c.oilVolumeMl || (c.percentage * 0.5)} ml
                                                        </td>
                                                        <td className="text-muted small">
                                                            {c.note || "Đảm bảo tiêu chuẩn phòng sạch Lab"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="modal-footer bg-white border-top px-4 py-3 d-flex justify-content-between align-items-center">
                        <div className="small text-muted">
                            Xưởng phụ trách: <strong className="text-dark">{product.factoryName}</strong> ({product.factoryAddress})
                        </div>

                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-secondary btn-sm px-4 fw-semibold rounded-3"
                                onClick={onClose}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

