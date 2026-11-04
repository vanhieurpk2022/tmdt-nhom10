import type { RowData } from "@tanstack/react-table";
import {
    faArrowDownAZ,
    faArrowUpAZ,
    faSort,
    faMagnifyingGlass,
    faChevronLeft,
    faChevronRight,
    faBoxOpen,
    faFlask,
    faFilter,
    faCircleXmark,
    faWineBottle,
    faEye,
    faPlus,
    faTrash,
    faCloudArrowUp,
    faImage,
    faCirclePlus,
    faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";

import "../../../css/pages/dashboard/admin.css";
import "../../../css/pages/dashboard/dashboard.css";
import "../../../css/pages/customScent.css";
import type { AppTable } from "../../table/features";
import {
    BOTTLE_DESIGN_OPTIONS,
    type BottleDesignOption,
} from "../../../data/customScentData";
import { FactoryServiceManager } from "../../../api/factory/FactoryService";
import { cloudinaryService } from "../../../api/UploadApi";
import { useToastContext } from "../../toasts/ToastContext";
import type { CustomBottleSampleItem } from "../../../dto/factory/FactoryProductRes";
import { ProductType } from "../../../enums/ProductType";

export type FactoryProductTab = "NORMAL" | "CUSTOM" | "DEFAULT_LABEL";

interface ProductOverviewProps<TData extends RowData> {
    table: AppTable<TData>;
    pageIndex: number;
    activeTab: FactoryProductTab;
    onTabChange: (tab: FactoryProductTab) => void;
    normalCount: number;
    customCount: number;
    defaultLabelCount?: number;
    onProduct?: (type?: ProductType) => void;
    onExportCsv?: () => void;
}

function ProductOverview<TData extends RowData>({
    table,
    pageIndex,
    activeTab,
    onTabChange,
    normalCount,
    customCount,
    defaultLabelCount = BOTTLE_DESIGN_OPTIONS.length,
    onProduct,
    onExportCsv,
}: ProductOverviewProps<TData>) {
    const { showToast } = useToastContext();
    const [search, setSearch] = useState("");
    const [selectedPreviewBottle, setSelectedPreviewBottle] = useState<BottleDesignOption | null>(null);

    // Danh sách chai mẫu lưu trong CSDL (product_image với is_custom_sample = 1)
    const [customBottleSamples, setCustomBottleSamples] = useState<CustomBottleSampleItem[]>([]);
    const [loadingSamples, setLoadingSamples] = useState(false);

    // Modal Thêm chai mẫu mới
    const [showAddModal, setShowAddModal] = useState(false);
    const [sampleImageUrl, setSampleImageUrl] = useState("");
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [submittingSample, setSubmittingSample] = useState(false);

    // Modal Xác nhận xóa chai mẫu
    const [deletingSample, setDeletingSample] = useState<CustomBottleSampleItem | null>(null);
    const [deletingLoading, setDeletingLoading] = useState(false);

    // Tải danh sách chai mẫu từ database
    const fetchCustomSamples = async () => {
        try {
            setLoadingSamples(true);
            const res = await FactoryServiceManager.getCustomBottleSamples();
            if (res.status === 200 && res.data) {
                setCustomBottleSamples(res.data);
            }
        } catch (error) {
            console.error("Không tải được danh sách chai mẫu custom:", error);
        } finally {
            setLoadingSamples(false);
        }
    };

    useEffect(() => {
        if (activeTab === "DEFAULT_LABEL") {
            fetchCustomSamples();
        }
    }, [activeTab]);

    // Xử lý upload ảnh lên Cloudinary
    const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const res = await cloudinaryService.upload(file);
            if (res && res.url) {
                setSampleImageUrl(res.url);
                showToast("Thành công", "Đã tải ảnh chai mẫu lên Cloudinary thành công!", "success");
            }
        } catch (err) {
            console.error("Lỗi tải ảnh:", err);
            showToast("Lỗi", "Không tải được ảnh lên. Vui lòng thử lại.", "danger");
        } finally {
            setUploadingImage(false);
            if (e.target) e.target.value = "";
        }
    };

    // Thêm ảnh nhãn chai mặc định / chai mẫu vào product_image
    const handleCreateSample = async () => {
        if (!sampleImageUrl.trim()) {
            showToast("Cảnh báo", "Vui lòng nhập đường dẫn ảnh hoặc tải ảnh từ máy tính.", "warning");
            return;
        }

        try {
            setSubmittingSample(true);
            await FactoryServiceManager.addDefaultBottleLabel({
                imageUrl: sampleImageUrl.trim(),
            });
            showToast("Thành công", "Đã lưu ảnh nhãn chai mặc định thành công!", "success");
            setSampleImageUrl("");
            setShowAddModal(false);
            fetchCustomSamples();
        } catch (error) {
            console.error("Lỗi lưu ảnh nhãn chai:", error);
            showToast("Lỗi", "Không thể lưu ảnh nhãn chai. Vui lòng thử lại.", "danger");
        } finally {
            setSubmittingSample(false);
        }
    };

    // Xóa ảnh nhãn chai mặc định / chai mẫu khỏi product_image
    const handleConfirmDeleteSample = async () => {
        if (!deletingSample) return;

        try {
            setDeletingLoading(true);
            await FactoryServiceManager.deleteDefaultBottleLabel(deletingSample.id);
            showToast("Thành công", "Đã xóa ảnh nhãn chai mặc định thành công.", "success");
            setDeletingSample(null);
            fetchCustomSamples();
        } catch (error) {
            console.error("Lỗi xóa ảnh nhãn chai mặc định:", error);
            showToast("Lỗi", "Không xóa được ảnh nhãn chai mặc định. Vui lòng thử lại.", "danger");
        } finally {
            setDeletingLoading(false);
        }
    };

    const filteredLabels = useMemo(() => {
        if (!search.trim()) return BOTTLE_DESIGN_OPTIONS;
        const q = search.toLowerCase();
        return BOTTLE_DESIGN_OPTIONS.filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.name.toLowerCase().includes(q) ||
                b.styleCode.toLowerCase().includes(q) ||
                b.description.toLowerCase().includes(q) ||
                b.labelStyle.toLowerCase().includes(q) ||
                b.glassStyle.toLowerCase().includes(q) ||
                b.capStyle.toLowerCase().includes(q) ||
                b.bottleShape.toLowerCase().includes(q)
        );
    }, [search]);

    const filteredCustomSamples = useMemo(() => {
        if (!search.trim()) return customBottleSamples;
        const q = search.toLowerCase();
        return customBottleSamples.filter(
            (s) =>
                s.imageUrl.toLowerCase().includes(q) ||
                String(s.id).includes(q) ||
                (s.productName && s.productName.toLowerCase().includes(q))
        );
    }, [search, customBottleSamples]);

    const totalRows = table.getFilteredRowModel().rows.length;
    const hasRows = table.getRowModel().rows.length > 0;
    const isSearching = search.trim() !== "";

    return (
        <section className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
            {/* Header Tabs: Tách riêng Sản phẩm Tiêu chuẩn & Sản phẩm Custom */}
            <div className="p-3 p-lg-4 border-bottom bg-white">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div className="nav nav-pills gap-2 p-1 bg-light rounded-pill border">
                        <button
                            type="button"
                            className={`nav-link py-2 px-4 rounded-pill fw-semibold d-flex align-items-center gap-2 border-0 ${
                                activeTab === "NORMAL"
                                    ? "active bg-danger text-white shadow-sm"
                                    : "text-secondary hover-bg-white"
                            }`}
                            onClick={() => {
                                onTabChange("NORMAL");
                                setSearch("");
                                table.setGlobalFilter("");
                            }}
                            style={{ cursor: "pointer", transition: "all 0.2s ease" }}
                        >
                            <FontAwesomeIcon icon={faBoxOpen} />
                            <span>Sản phẩm Tiêu Chuẩn</span>
                            <span
                                className={`badge rounded-pill ms-1 ${
                                    activeTab === "NORMAL"
                                        ? "bg-white text-danger"
                                        : "bg-secondary-subtle text-secondary"
                                }`}
                                style={{ fontSize: "11px" }}
                            >
                                {normalCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`nav-link py-2 px-4 rounded-pill fw-semibold d-flex align-items-center gap-2 border-0 ${
                                activeTab === "CUSTOM"
                                    ? "text-white shadow-sm"
                                    : "text-secondary hover-bg-white"
                            }`}
                            style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                backgroundColor: activeTab === "CUSTOM" ? "#7c3aed" : "transparent",
                            }}
                            onClick={() => {
                                onTabChange("CUSTOM");
                                setSearch("");
                                table.setGlobalFilter("");
                            }}
                        >
                            <FontAwesomeIcon icon={faFlask} />
                            <span>Sản phẩm Phối Hương (Custom)</span>
                            <span
                                className={`badge rounded-pill ms-1 ${
                                    activeTab === "CUSTOM"
                                        ? "bg-white"
                                        : "bg-purple-subtle text-purple-emphasis"
                                }`}
                                style={{
                                    fontSize: "11px",
                                    color: activeTab === "CUSTOM" ? "#7c3aed" : undefined,
                                }}
                            >
                                {customCount}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`nav-link py-2 px-4 rounded-pill fw-semibold d-flex align-items-center gap-2 border-0 ${
                                activeTab === "DEFAULT_LABEL"
                                    ? "text-white shadow-sm"
                                    : "text-secondary hover-bg-white"
                            }`}
                            style={{
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                backgroundColor: activeTab === "DEFAULT_LABEL" ? "#0284c7" : "transparent",
                            }}
                            onClick={() => {
                                onTabChange("DEFAULT_LABEL");
                                setSearch("");
                                table.setGlobalFilter("");
                            }}
                        >
                            <FontAwesomeIcon icon={faWineBottle} />
                            <span>Nhãn chai mặc định</span>
                            <span
                                className={`badge rounded-pill ms-1 ${
                                    activeTab === "DEFAULT_LABEL"
                                        ? "bg-white"
                                        : "bg-info-subtle text-info-emphasis"
                                }`}
                                style={{
                                    fontSize: "11px",
                                    color: activeTab === "DEFAULT_LABEL" ? "#0284c7" : undefined,
                                }}
                            >
                                {defaultLabelCount + customBottleSamples.length}
                            </span>
                        </button>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <span className="badge rounded-pill bg-light text-dark border px-3 py-2 small">
                            {activeTab === "DEFAULT_LABEL"
                                ? `Đang hiển thị ${filteredLabels.length} mẫu nhãn & ${filteredCustomSamples.length} chai mẫu`
                                : `Đang hiển thị ${totalRows} sản phẩm`}
                        </span>
                    </div>
                </div>

                <div className="mt-2 text-secondary small">
                    {activeTab === "NORMAL" ? (
                        <span>
                            🌿 <strong>Sản phẩm Tiêu Chuẩn:</strong> Các dòng tinh dầu đơn hương và sản phẩm đóng chai có sẵn của gian hàng.
                        </span>
                    ) : activeTab === "CUSTOM" ? (
                        <span>
                            🧪 <strong>Sản phẩm Custom:</strong> Các mẫu tinh dầu phối hương độc quyền theo nốt hương và tỷ lệ công thức tùy biến.
                        </span>
                    ) : (
                        <span>
                            🏷️ <strong>Nhãn chai mặc định & Chai mẫu:</strong> Danh mục các mẫu tem nhãn chuẩn hóa và bộ sưu tập chai mẫu gợi ý custom (lưu trữ trong <code>product_image</code>).
                        </span>
                    )}
                </div>
            </div>

            {/* Toolbar Tìm kiếm & Thao tác */}
            <div className="p-3 p-lg-4 bg-light border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="input-group" style={{ maxWidth: "380px" }}>
                    <span className="input-group-text bg-white border-end-0 text-secondary">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                    </span>
                    <input
                        type="search"
                        className="form-control border-start-0 ps-0"
                        placeholder={
                            activeTab === "NORMAL"
                                ? "Tìm tên sản phẩm tiêu chuẩn, danh mục..."
                                : activeTab === "CUSTOM"
                                    ? "Tìm tên sản phẩm phối hương, nốt hương..."
                                    : "Tìm tên mẫu nhãn chai, mã thiết kế, chai mẫu..."
                        }
                        value={search}
                        onChange={(e) => {
                            const value = e.target.value;
                            setSearch(value);
                            if (activeTab !== "DEFAULT_LABEL") {
                                table.setGlobalFilter(value);
                            }
                        }}
                    />
                    {search && (
                        <button
                            type="button"
                            className="btn btn-white border border-start-0 bg-white text-secondary"
                            onClick={() => {
                                setSearch("");
                                if (activeTab !== "DEFAULT_LABEL") {
                                    table.setGlobalFilter("");
                                }
                            }}
                        >
                            <FontAwesomeIcon icon={faCircleXmark} />
                        </button>
                    )}
                </div>

                <div className="d-flex flex-wrap align-items-center gap-2">
                    {/* Nút Xuất danh sách (dùng cho tab Tiêu chuẩn & Custom) */}
                    {onExportCsv && activeTab !== "DEFAULT_LABEL" && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary bg-white rounded-3 fw-semibold shadow-sm px-3 py-2 d-inline-flex align-items-center gap-2"
                            onClick={onExportCsv}
                        >
                            <FontAwesomeIcon icon={faDownload} />
                            <span>Xuất danh sách</span>
                        </button>
                    )}

                    {/* Nút Thêm sản phẩm thường (dành riêng cho tab Sản phẩm Tiêu Chuẩn) */}
                    {activeTab === "NORMAL" && onProduct && (
                        <button
                            type="button"
                            onClick={() => onProduct(ProductType.NORMAL)}
                            className="btn btn-danger rounded-3 fw-semibold shadow-sm d-inline-flex align-items-center gap-2 px-3 py-2"
                        >
                            <FontAwesomeIcon icon={faCirclePlus} />
                            <span>Thêm sản phẩm thường</span>
                        </button>
                    )}

                    {/* Nút Tạo SP Phối Hương (dành riêng cho tab Sản phẩm Phối Hương Custom) */}
                    {activeTab === "CUSTOM" && onProduct && (
                        <button
                            type="button"
                            onClick={() => onProduct(ProductType.CUSTOM)}
                            className="btn rounded-3 fw-semibold text-white shadow-sm d-inline-flex align-items-center gap-2 px-3 py-2"
                            style={{ backgroundColor: "#7c3aed", borderColor: "#7c3aed" }}
                        >
                            <FontAwesomeIcon icon={faFlask} />
                            <span>Tạo SP Phối Hương</span>
                        </button>
                    )}

                    {/* Nút Thêm ảnh nhãn chai (dành riêng cho tab Nhãn chai mặc định) */}
                    {activeTab === "DEFAULT_LABEL" && (
                        <button
                            type="button"
                            className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm rounded-3 fw-semibold px-3 py-2"
                            onClick={() => {
                                setSampleImageUrl("");
                                setShowAddModal(true);
                            }}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Thêm ảnh nhãn chai</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Content Area */}
            {activeTab === "DEFAULT_LABEL" ? (
                <div className="p-3 p-lg-4 d-flex flex-column gap-4 bg-light-subtle">
                    {/* KHỐI 1: DANH SÁCH CHAI MẪU CUSTOM ĐƯỢC LƯU TRONG PRODUCT_IMAGE */}
                    <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="card-header bg-white py-3 d-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom">
                            <div className="d-flex align-items-center gap-2">
                                <span
                                    className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                                    style={{ width: 38, height: 38 }}
                                >
                                    <FontAwesomeIcon icon={faWineBottle} />
                                </span>
                                <div>
                                    <div className="d-flex align-items-center gap-2">
                                        <h6 className="fw-bold mb-0 text-dark">
                                            Bộ sưu tập Ảnh nhãn chai mặc định & Chai mẫu Custom
                                        </h6>
                                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                                            {customBottleSamples.length} ảnh nhãn/chai mẫu
                                        </span>
                                    </div>
                                    <span className="small text-secondary">
                                        Lưu trữ trong CSDL bảng <code>product_image</code> (cờ <code>is_custom_sample = true</code>). Khách hàng có thể nhìn thấy các mẫu nhãn và chai này để chọn khi phối hương.
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 rounded-3 shadow-sm px-3 py-1.5"
                                onClick={() => {
                                    setSampleImageUrl("");
                                    setShowAddModal(true);
                                }}
                            >
                                <FontAwesomeIcon icon={faPlus} />
                                <span>Thêm ảnh nhãn chai</span>
                            </button>
                        </div>

                        <div className="card-body p-3 p-md-4">
                            {loadingSamples ? (
                                <div className="text-center py-4 text-secondary">
                                    <div className="spinner-border text-primary spinner-border-sm me-2" />
                                    Đang tải danh sách ảnh nhãn chai từ máy chủ...
                                </div>
                            ) : filteredCustomSamples.length === 0 ? (
                                <div className="text-center py-5 text-secondary border border-dashed rounded-4 p-4 bg-light">
                                    <FontAwesomeIcon icon={faWineBottle} className="text-muted fs-1 mb-2 opacity-50" />
                                    <div className="fw-bold text-dark mb-1">
                                        {search ? `Không tìm thấy ảnh nhãn chai nào khớp với "${search}"` : "Chưa có ảnh nhãn chai mặc định nào trong CSDL"}
                                    </div>
                                    <div className="small text-muted mb-3" style={{ maxWidth: 440, margin: "0 auto" }}>
                                        Thêm các mẫu nhãn hoặc dáng chai thực tế vào <code>product_image</code> để gợi ý cho khách hàng tự phối hương.
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-outline-primary btn-sm rounded-3 px-3 py-1.5"
                                        onClick={() => {
                                            setSampleImageUrl("");
                                            setShowAddModal(true);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                                        Thêm ảnh nhãn chai đầu tiên
                                    </button>
                                </div>
                            ) : (
                                <div className="row g-3">
                                    {filteredCustomSamples.map((sample) => (
                                        <div key={sample.id} className="col-12 col-sm-6 col-md-4 col-xl-3">
                                            <div className="card h-100 border rounded-4 overflow-hidden shadow-sm hover-shadow transition">
                                                <div
                                                    className="position-relative bg-light d-flex align-items-center justify-content-center p-3"
                                                    style={{ height: 180 }}
                                                >
                                                    <img
                                                        src={sample.imageUrl}
                                                        alt={`Ảnh nhãn chai #${sample.id}`}
                                                        className="img-fluid"
                                                        style={{ maxHeight: 150, objectFit: "contain" }}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = "https://placehold.co/150x150?text=No+Image";
                                                        }}
                                                    />
                                                    <span className="badge bg-dark bg-opacity-75 text-white position-absolute top-0 start-0 m-2 px-2 py-1 small shadow-sm">
                                                        Nhãn chai #{sample.id}
                                                    </span>
                                                </div>
                                                <div className="card-body p-3 d-flex flex-column justify-content-between gap-2">
                                                    <div>
                                                        <div className="d-flex align-items-center justify-content-between gap-2">
                                                            <span className="badge bg-success-subtle text-success border border-success-subtle small">
                                                                is_custom_sample = 1
                                                            </span>
                                                            <span className="small text-muted" style={{ fontSize: "0.75rem" }}>
                                                                {sample.uploadedAt ? new Date(sample.uploadedAt).toLocaleDateString("vi-VN") : ""}
                                                            </span>
                                                        </div>
                                                        <div className="text-secondary small mt-2 text-truncate" title={sample.imageUrl}>
                                                            <code>{sample.imageUrl}</code>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-danger btn-sm w-100 rounded-3 d-flex align-items-center justify-content-center gap-1.5 mt-2"
                                                        onClick={() => setDeletingSample(sample)}
                                                        title="Xóa ảnh nhãn chai mặc định"
                                                    >
                                                        <FontAwesomeIcon icon={faTrash} />
                                                        <span>Xóa ảnh nhãn chai</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* KHỐI 2: QUY CÁCH MẪU CHAI & TEM NHÃN MẶC ĐỊNH HỆ THỐNG */}
                    <div className="card border shadow-sm rounded-4 overflow-hidden bg-white">
                        <div className="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                            <div>
                                <h6 className="fw-bold mb-0 text-dark">
                                    Mẫu chai & Tem nhãn chuẩn hóa hệ thống (Standard Catalog)
                                </h6>
                                <span className="small text-secondary">
                                    Quy cách thiết kế lọ, nắp chai và phong cách in tem nhãn áp dụng cho quy trình sản xuất.
                                </span>
                            </div>
                        </div>

                        <div className="table-responsive admin-table-scroll">
                            <table className="table table-hover align-middle mb-0 admin-order-table">
                                <thead className="table-light small text-secondary text-uppercase">
                                    <tr>
                                        <th className="py-3 ps-3">Mẫu nhãn & Mã thiết kế</th>
                                        <th className="py-3">Dáng chai & Vỏ kính</th>
                                        <th className="py-3">Loại nắp chai</th>
                                        <th className="py-3">Phong cách tem nhãn</th>
                                        <th className="py-3 text-center">Phụ phí</th>
                                        <th className="py-3 text-center">Trạng thái</th>
                                        <th className="py-3 text-center pe-3">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLabels.map((b) => (
                                        <tr key={b.id}>
                                            <td className="ps-3 py-3">
                                                <div className="d-flex align-items-center gap-3">
                                                    <span
                                                        className="d-inline-flex align-items-center justify-content-center rounded-3 text-white fw-bold shadow-sm"
                                                        style={{
                                                            width: 44,
                                                            height: 44,
                                                            backgroundColor:
                                                                b.glassStyle === "amber"
                                                                    ? "#b45309"
                                                                    : b.glassStyle === "matte-noir"
                                                                    ? "#1e293b"
                                                                    : "#0284c7",
                                                        }}
                                                    >
                                                        <FontAwesomeIcon icon={faWineBottle} size="lg" />
                                                    </span>
                                                    <div>
                                                        <div className="fw-bold text-dark d-flex align-items-center gap-2">
                                                            <span>{b.title}</span>
                                                            <span className="badge bg-light text-secondary border small">
                                                                {b.name}
                                                            </span>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2 mt-1">
                                                            <code className="text-primary small fw-semibold bg-primary-subtle px-2 py-0.5 rounded">
                                                                {b.styleCode}
                                                            </code>
                                                        </div>
                                                        <div className="text-secondary small mt-1" style={{ maxWidth: 360 }}>
                                                            {b.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark">
                                                    {b.bottleShape === "square"
                                                        ? "Chai vuông sang trọng"
                                                        : b.bottleShape === "cylinder"
                                                        ? "Trụ tròn thanh lịch"
                                                        : "Bình thảo dược cổ điển"}
                                                </div>
                                                <div className="small text-secondary mt-1">
                                                    {b.glassStyle === "amber"
                                                        ? "Thủy tinh màu hổ phách ấm"
                                                        : b.glassStyle === "matte-noir"
                                                        ? "Thủy tinh đen mờ khói (Matte Noir)"
                                                        : "Thủy tinh mờ tuyết (Crystal Frost)"}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="fw-semibold text-dark">
                                                    {b.capStyle === "gold-dropper"
                                                        ? "Nắp nhỏ giọt vàng kim"
                                                        : b.capStyle === "wood-cylinder"
                                                        ? "Nắp gỗ mun tự nhiên"
                                                        : "Nắp triện sáp thủ công"}
                                                </div>
                                                <div className="small text-secondary mt-1">
                                                    {b.capStyle === "gold-dropper"
                                                        ? "Dropper cao cấp"
                                                        : b.capStyle === "wood-cylinder"
                                                        ? "Vân gỗ nguyên khối"
                                                        : "Sáp đỏ ruby niêm phong"}
                                                </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={`badge rounded-pill px-3 py-1.5 fw-semibold ${
                                                        b.labelStyle === "minimal-clean"
                                                            ? "bg-light text-dark border"
                                                            : b.labelStyle === "luxury-gold"
                                                            ? "bg-warning-subtle text-warning-emphasis border border-warning-subtle"
                                                            : "bg-danger-subtle text-danger-emphasis border border-danger-subtle"
                                                    }`}
                                                >
                                                    {b.labelStyle === "minimal-clean"
                                                        ? "Nhãn viền tối giản"
                                                        : b.labelStyle === "luxury-gold"
                                                        ? "Nhãn ép kim vàng (Gold Foil)"
                                                        : "Nhãn cổ điển (Vintage Border)"}
                                                </span>
                                                <div className="small text-secondary mt-1">Decal PP chống thấm dầu</div>
                                            </td>
                                            <td className="text-center fw-semibold">
                                                {b.extraPrice === 0 ? (
                                                    <span className="text-success">0đ (Tiêu chuẩn)</span>
                                                ) : (
                                                    <span className="text-danger">+{b.extraPrice.toLocaleString("vi-VN")}đ</span>
                                                )}
                                            </td>
                                            <td className="text-center">
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                                                    Mặc định xưởng
                                                </span>
                                            </td>
                                            <td className="text-center pe-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-primary rounded-3 d-inline-flex align-items-center gap-1.5 px-3 py-1.5 shadow-sm"
                                                    onClick={() => setSelectedPreviewBottle(b)}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                    <span>Xem mẫu</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}

                                    {filteredLabels.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-5 text-secondary">
                                                <div className="d-flex flex-column align-items-center gap-2">
                                                    <FontAwesomeIcon icon={faWineBottle} className="text-muted fs-1 mb-1" />
                                                    <div className="fw-semibold">
                                                        Không tìm thấy mẫu nhãn chai nào khớp với "{search}".
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                /* Scrollable table */
                <div className="table-responsive admin-table-scroll">
                    <table className="table table-hover align-middle mb-0 admin-order-table">
                        <thead className="table-light small text-secondary text-uppercase">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        const sorted = header.column.getIsSorted();
                                        const canSort = header.column.getCanSort();

                                        return (
                                            <th key={header.id} className="text-nowrap py-3">
                                                {header.isPlaceholder ? null : (
                                                    <div
                                                        className={`d-flex align-items-center gap-2 ${
                                                            header.id === "actions" ? "justify-content-center" : ""
                                                        }`}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        style={{ cursor: canSort ? "pointer" : "default", userSelect: "none" }}
                                                    >
                                                        <table.FlexRender header={header} />
                                                        {canSort && (
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
                                                                        ? activeTab === "CUSTOM"
                                                                            ? "text-primary"
                                                                            : "text-danger"
                                                                        : "text-secondary opacity-50"
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

                            {!hasRows && (
                                <tr>
                                    <td
                                        colSpan={table.getHeaderGroups()[0]?.headers.length ?? 1}
                                        className="text-center py-5 text-secondary"
                                    >
                                        <div className="d-flex flex-column align-items-center gap-2">
                                            <FontAwesomeIcon
                                                icon={activeTab === "CUSTOM" ? faFlask : faBoxOpen}
                                                className="text-muted fs-1 mb-1"
                                            />
                                            <div className="fw-semibold">
                                                {isSearching
                                                    ? "Không tìm thấy sản phẩm nào khớp với từ khóa tìm kiếm."
                                                    : activeTab === "CUSTOM"
                                                        ? "Chưa có sản phẩm phối hương (Custom) nào."
                                                        : "Chưa có sản phẩm tiêu chuẩn nào."}
                                            </div>
                                            <div className="small text-muted">
                                                Bạn có thể nhấn nút "Thêm sản phẩm" ở trên để khởi tạo sản phẩm mới.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Table footer */}
            {activeTab === "DEFAULT_LABEL" ? (
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top bg-white">
                    <span className="text-secondary small">
                        Tổng cộng <strong>{filteredLabels.length}</strong> mẫu nhãn chai mặc định ({BOTTLE_DESIGN_OPTIONS.length} mẫu tiêu chuẩn hệ thống)
                    </span>
                    <span className="text-muted small">
                        Áp dụng tự động cho các đơn hàng phối hương cá nhân hóa (Bespoke Scent)
                    </span>
                </div>
            ) : (
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 px-lg-4 py-3 border-top bg-white">
                    <span className="text-secondary small">
                        Tổng cộng <strong>{totalRows}</strong> sản phẩm ({activeTab === "NORMAL" ? "Tiêu chuẩn" : "Phối hương Custom"})
                    </span>

                    <div className="d-flex align-items-center gap-2">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-2 px-3"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            aria-label="Trang trước"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} className="me-1" />
                            Trước
                        </button>

                        <span className="small text-secondary px-2">
                            Trang <strong>{pageIndex + 1}</strong> / {Math.max(table.getPageCount(), 1)}
                        </span>

                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary rounded-2 px-3"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            aria-label="Trang sau"
                        >
                            Sau
                            <FontAwesomeIcon icon={faChevronRight} className="ms-1" />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal Xem trước chi tiết mẫu nhãn & chai */}
            {selectedPreviewBottle && (
                <Modal
                    show={true}
                    onHide={() => setSelectedPreviewBottle(null)}
                    centered
                    size="lg"
                >
                    <Modal.Header closeButton className="border-bottom pb-3">
                        <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faWineBottle} className="text-primary" />
                            <span>Mẫu nhãn & lọ chai: {selectedPreviewBottle.title}</span>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="p-4 bg-light-subtle">
                        <div className="row g-4 align-items-center">
                            {/* Mô phỏng lọ chai & nhãn */}
                            <div className="col-12 col-md-5 d-flex justify-content-center">
                                <div
                                    className="p-4 bg-white rounded-4 border shadow-sm w-100 d-flex flex-column align-items-center justify-content-center"
                                    style={{ minHeight: 340 }}
                                >
                                    <div className="bottle-visual-wrapper my-0">
                                        <div className={`bottle-cap cap-${selectedPreviewBottle.capStyle}`} />
                                        <div
                                            className={`bottle-body ${selectedPreviewBottle.bottleShape} glass-${selectedPreviewBottle.glassStyle}`}
                                        >
                                            <div className="bottle-liquid" />
                                            <div
                                                className={`bottle-label-sticker label-${selectedPreviewBottle.labelStyle}`}
                                            >
                                                <div className="bottle-label-brand">OILIA BESPOKE</div>
                                                <div className="bottle-label-title">{selectedPreviewBottle.name}</div>
                                                <div className="bottle-label-subtitle">HƯƠNG ĐẶC BIỆT</div>
                                                <div className="bottle-label-desc">Công thức thủ công</div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="badge bg-dark text-white mt-3 px-3 py-1.5">
                                        {selectedPreviewBottle.title}
                                    </span>
                                </div>
                            </div>

                            {/* Thông số kỹ thuật */}
                            <div className="col-12 col-md-7">
                                <div className="bg-white p-3 p-md-4 rounded-4 border shadow-sm d-flex flex-column gap-3">
                                    <div>
                                        <div className="small text-secondary text-uppercase fw-bold">Tên thiết kế</div>
                                        <div className="fs-5 fw-bold text-dark">{selectedPreviewBottle.title}</div>
                                        <div className="text-secondary small mt-1">{selectedPreviewBottle.description}</div>
                                    </div>

                                    <hr className="my-1 text-muted opacity-25" />

                                    <div className="row g-3 small">
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Mã style code:</span>
                                            <code className="fw-bold text-primary">{selectedPreviewBottle.styleCode}</code>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Phụ phí bao bì:</span>
                                            <span className="fw-bold text-dark">
                                                {selectedPreviewBottle.extraPrice === 0
                                                    ? "0đ (Miễn phí)"
                                                    : `+${selectedPreviewBottle.extraPrice.toLocaleString("vi-VN")}đ`}
                                            </span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Dáng chai:</span>
                                            <span className="fw-semibold text-dark">{selectedPreviewBottle.bottleShape}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Vỏ thủy tinh:</span>
                                            <span className="fw-semibold text-dark">{selectedPreviewBottle.glassStyle}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Nắp chai:</span>
                                            <span className="fw-semibold text-dark">{selectedPreviewBottle.capStyle}</span>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-secondary d-block">Phong cách tem nhãn:</span>
                                            <span className="fw-semibold text-dark">{selectedPreviewBottle.labelStyle}</span>
                                        </div>
                                    </div>

                                    <div className="alert alert-info py-2 px-3 mb-0 small rounded-3">
                                        📌 <strong>Kỹ thuật in ấn xưởng:</strong> Tem nhãn kích thước chuẩn hóa 45x65mm, in trên decal nhựa PP kháng tinh dầu, cán màng mờ bảo vệ chống trầy xước.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer className="border-top">
                        <Button variant="secondary" onClick={() => setSelectedPreviewBottle(null)}>
                            Đóng
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Modal Thêm ảnh nhãn chai mặc định / chai mẫu (Lưu vào product_image) */}
            <Modal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                centered
            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fs-5 fw-bold d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faWineBottle} className="text-primary" />
                        <span>Thêm ảnh nhãn chai mặc định / Chai mẫu</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-3">
                        <label className="form-label fw-bold small text-dark mb-1">
                            Hình ảnh nhãn chai mặc định (Lưu trữ vào product_image)
                        </label>
                        <div className="d-flex flex-column gap-2">
                            <div className="input-group">
                                <span className="input-group-text bg-light text-secondary">
                                    <FontAwesomeIcon icon={faImage} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="https://res.cloudinary.com/... hoặc link ảnh"
                                    value={sampleImageUrl}
                                    onChange={(e) => setSampleImageUrl(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="btn btn-outline-primary d-flex align-items-center gap-1"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                >
                                    <FontAwesomeIcon icon={faCloudArrowUp} />
                                    <span>{uploadingImage ? "Đang tải..." : "Tải ảnh"}</span>
                                </button>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="d-none"
                                onChange={handleUploadImage}
                            />
                            <div className="form-text small text-secondary">
                                Hỗ trợ tải trực tiếp từ máy tính lên Cloudinary hoặc dán liên kết URL ảnh chai mẫu.
                            </div>
                        </div>
                    </div>

                    {sampleImageUrl && (
                        <div className="p-3 border rounded-3 bg-light text-center mb-3">
                            <div className="small text-secondary mb-2 fw-semibold">Xem trước ảnh:</div>
                            <img
                                src={sampleImageUrl}
                                alt="Xem trước chai mẫu"
                                className="img-fluid rounded-3 border bg-white shadow-sm"
                                style={{ maxHeight: 180, objectFit: "contain" }}
                            />
                        </div>
                    )}

                    <div className="alert alert-info py-2 px-3 small rounded-3 mb-0">
                        💡 Chai mẫu này sẽ được lưu với thuộc tính <code>is_custom_sample = true</code> trong bảng <code>product_image</code> và hiển thị làm mẫu gợi ý khi khách hàng tự phối hương.
                    </div>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button variant="secondary" onClick={() => setShowAddModal(false)} disabled={submittingSample}>
                        Hủy
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreateSample}
                        disabled={submittingSample || !sampleImageUrl.trim()}
                        className="d-flex align-items-center gap-1"
                    >
                        {submittingSample && <span className="spinner-border spinner-border-sm me-1" />}
                        <span>Lưu ảnh nhãn chai</span>
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal Xác nhận xóa ảnh nhãn chai mặc định */}
            <Modal
                show={deletingSample !== null}
                onHide={() => setDeletingSample(null)}
                centered
            >
                <Modal.Header closeButton className="border-bottom">
                    <Modal.Title className="fs-5 fw-bold text-danger d-flex align-items-center gap-2">
                        <FontAwesomeIcon icon={faTrash} />
                        <span>Xác nhận xóa ảnh nhãn chai mặc định</span>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <p className="mb-3 text-secondary">
                        Bạn có chắc chắn muốn xóa ảnh nhãn chai mặc định <strong>#{deletingSample?.id}</strong> khỏi hệ thống?
                    </p>
                    {deletingSample?.imageUrl && (
                        <div className="text-center p-2 border rounded-3 bg-light mb-2">
                            <img
                                src={deletingSample.imageUrl}
                                alt="Ảnh nhãn chai"
                                style={{ maxHeight: 120, objectFit: "contain" }}
                            />
                        </div>
                    )}
                    <span className="small text-danger">Hành động này sẽ xóa vĩnh viễn bản ghi khỏi bảng <code>product_image</code>.</span>
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button variant="secondary" onClick={() => setDeletingSample(null)} disabled={deletingLoading}>
                        Hủy
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirmDeleteSample}
                        disabled={deletingLoading}
                        className="d-flex align-items-center gap-1"
                    >
                        {deletingLoading && <span className="spinner-border spinner-border-sm me-1" />}
                        <span>Xác nhận xóa</span>
                    </Button>
                </Modal.Footer>
            </Modal>
        </section>
    );
}

export default ProductOverview;
