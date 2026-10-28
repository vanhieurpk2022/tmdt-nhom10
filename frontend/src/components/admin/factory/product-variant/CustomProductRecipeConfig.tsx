import { useEffect, useMemo, useState, useRef } from "react";
import { Modal, Button, ProgressBar } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faFlask,
    faPlus,
    faTrash,
    faFloppyDisk,
    faScaleBalanced,
    faSliders,
    faCircleCheck,
    faTriangleExclamation,
    faBoxOpen,
    faTag,
    faWineBottle,
    faImage,
    faCloudArrowUp,
    faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";

import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import { cloudinaryService } from "../../../../api/UploadApi";
import type {
    CustomProductComponent,
    FactoryProductItem,
    FactoryProductEditRes,
} from "../../../../dto/factory/FactoryProductRes";
import { useToastContext } from "../../../toasts/ToastContext";

interface CustomProductRecipeConfigProps {
    productId: number;
    productInfo: FactoryProductEditRes | null;
    onUpdated?: () => void;
}

/**
 * Trích xuất cấu hình các thành phần phối và ghi chú từ trường description
 */
function parseRecipeFromDescription(description?: string): {
    components: CustomProductComponent[];
    userNotes: string;
} {
    if (!description) return { components: [], userNotes: "" };

    // 1. Thử parse từ comment JSON lưu trữ
    const matchJson = description.match(/<!--RECIPE_JSON:(.*?)-->/s);
    if (matchJson && matchJson[1]) {
        try {
            const comps = JSON.parse(matchJson[1]) as CustomProductComponent[];
            const cleanNotes = description
                .replace(/<!--RECIPE_JSON:.*?-->/s, "")
                .replace(/^\[Công thức phối hương\]:.*(\n|$)/m, "")
                .trim();
            return { components: comps, userNotes: cleanNotes };
        } catch (e) {
            console.error("Lỗi parse RECIPE_JSON:", e);
        }
    }

    // 2. Fallback nếu chỉ có dạng text thuần
    const cleanNotes = description
        .replace(/^\[Công thức phối hương\]:.*(\n|$)/m, "")
        .trim();
    return { components: [], userNotes: cleanNotes };
}

/**
 * Đóng gói danh sách thành phần và ghi chú vào description
 */
function formatRecipeToDescription(
    components: CustomProductComponent[],
    userNotes: string
): string {
    const jsonTag = `<!--RECIPE_JSON:${JSON.stringify(components)}-->`;
    const formulaStr = components
        .filter((c) => c.productId > 0)
        .map((c) => `${c.percentage}% ${c.productName}${c.note ? ` (${c.note})` : ""}`)
        .join(" + ");

    const recipeText = formulaStr ? `[Công thức phối hương]: ${formulaStr}` : "";
    return [jsonTag, recipeText, userNotes].filter(Boolean).join("\n");
}

export function CustomProductRecipeConfig({
    productId,
    productInfo,
    onUpdated,
}: CustomProductRecipeConfigProps) {
    const { showToast } = useToastContext();

    // Danh sách các sản phẩm có sẵn của xưởng để chọn phối
    const [availableProducts, setAvailableProducts] = useState<FactoryProductItem[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Thông tin Product Custom (lọ chai & nhãn thiết kế)
    const [productCustomId, setProductCustomId] = useState<number | null>(null);
    const [bottleType, setBottleType] = useState<string>("Chai thủy tinh tiêu chuẩn");
    const [labelDesign, setLabelDesign] = useState<string>("");
    const [uploadingDesign, setUploadingDesign] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Danh sách thành phần phối hiện tại
    const [components, setComponents] = useState<CustomProductComponent[]>([]);
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    // State modal chọn thêm sản phẩm phối
    const [showPickerModal, setShowPickerModal] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<number>(0);
    const [selectedPercentage, setSelectedPercentage] = useState<number>(20);
    const [selectedNote, setSelectedNote] = useState<string>("Tầng giữa (Heart note)");

    // Tải danh sách sản phẩm có sẵn của xưởng
    useEffect(() => {
        const fetchFactoryProducts = async () => {
            try {
                setLoadingProducts(true);
                const res = await FactoryServiceManager.getProducts();
                if (res.status === 200 && res.data?.products) {
                    setAvailableProducts(res.data.products);
                }
            } catch (err) {
                console.error("Không tải được danh sách sản phẩm xưởng:", err);
            } finally {
                setLoadingProducts(false);
            }
        };

        fetchFactoryProducts();
    }, []);

    // Load công thức từ API getCustomRecipe (product_custom & product_custom_item)
    useEffect(() => {
        let isMounted = true;
        const fetchRecipe = async () => {
            try {
                const res = await FactoryServiceManager.getCustomRecipe(productId);
                if (isMounted && res.status === 200 && res.data) {
                    if (res.data.productCustomId) setProductCustomId(res.data.productCustomId);
                    if (res.data.bottleType) setBottleType(res.data.bottleType);
                    if (res.data.labelDesign) setLabelDesign(res.data.labelDesign);

                    if (res.data.items && res.data.items.length > 0) {
                        setComponents(
                            res.data.items.map((it) => ({
                                productId: it.productId,
                                productName: it.productName || `Sản phẩm #${it.productId}`,
                                percentage: it.percentage,
                                note: it.note || "",
                            }))
                        );
                        setNotes(res.data.notes || "");
                        return;
                    }
                }
            } catch (err) {
                console.log("Chưa có custom recipe trong database, thử đọc từ description", err);
            }

            // Fallback đọc từ description nếu database chưa có items
            if (isMounted && productInfo) {
                const parsed = parseRecipeFromDescription(productInfo.description);
                setComponents(parsed.components);
                setNotes(parsed.userNotes);
            }
        };

        fetchRecipe();
        return () => {
            isMounted = false;
        };
    }, [productId, productInfo]);

    // Xử lý upload ảnh thiết kế lọ chai lên Cloudinary
    const handleUploadDesignImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingDesign(true);
            const uploadRes = await cloudinaryService.upload(file);
            if (uploadRes && uploadRes.url) {
                setLabelDesign(uploadRes.url);
                showToast("Thành công", "Đã tải ảnh thiết kế lên Cloudinary! Bấm 'Lưu công thức phối' để lưu vào hệ thống.", "success");
            }
        } catch (err) {
            console.error("Lỗi tải ảnh lọ chai:", err);
            showToast("Lỗi", "Không tải được ảnh thiết kế lên. Vui lòng thử lại.", "danger");
        } finally {
            setUploadingDesign(false);
            if (e.target) e.target.value = "";
        }
    };

    // Các sản phẩm có sẵn có thể chọn (loại trừ chính sản phẩm custom này)
    const selectableProducts = useMemo(() => {
        return availableProducts.filter((p) => p.id !== productId);
    }, [availableProducts, productId]);

    // Tổng tỷ lệ % hiện tại
    const totalPercentage = useMemo(() => {
        return components.reduce((sum, c) => sum + (Number(c.percentage) || 0), 0);
    }, [components]);

    // Mở modal thêm sản phẩm phối
    const handleOpenPicker = () => {
        const alreadyIds = new Set(components.map((c) => c.productId));
        const candidate = selectableProducts.find((p) => !alreadyIds.has(p.id)) || selectableProducts[0];

        if (!candidate) {
            showToast("Thông báo", "Xưởng chưa có sản phẩm nào khác trong kho để phối.", "warning");
            return;
        }

        setSelectedProductId(candidate.id);
        const remaining = Math.max(0, 100 - totalPercentage);
        setSelectedPercentage(remaining > 0 ? remaining : 10);
        setSelectedNote(
            components.length === 0
                ? "Tầng đầu (Top note)"
                : components.length === 1
                ? "Tầng giữa (Heart note)"
                : "Tầng cuối (Base note)"
        );
        setShowPickerModal(true);
    };

    // Xác nhận thêm sản phẩm vào công thức từ Modal
    const handleConfirmAddComponent = () => {
        if (!selectedProductId) {
            showToast("Lỗi", "Vui lòng chọn một sản phẩm trong danh sách.", "warning");
            return;
        }

        const found = selectableProducts.find((p) => p.id === selectedProductId);
        if (!found) return;

        // Nếu đã có sản phẩm này trong danh sách, cập nhật lại tỷ lệ
        const existingIndex = components.findIndex((c) => c.productId === selectedProductId);
        if (existingIndex >= 0) {
            setComponents((prev) =>
                prev.map((c, i) =>
                    i === existingIndex
                        ? {
                              ...c,
                              percentage: selectedPercentage,
                              note: selectedNote,
                          }
                        : c
                )
            );
            showToast("Thông báo", `Đã cập nhật sản phẩm "${found.name}" trong công thức.`, "info");
        } else {
            setComponents((prev) => [
                ...prev,
                {
                    productId: found.id,
                    productName: found.name,
                    percentage: selectedPercentage,
                    note: selectedNote,
                },
            ]);
            showToast("Thành công", `Đã thêm "${found.name}" vào công thức phối.`, "success");
        }

        setShowPickerModal(false);
    };

    // Xóa một thành phần
    const handleRemoveComponent = (index: number) => {
        setComponents((prev) => prev.filter((_, i) => i !== index));
    };

    // Thay đổi nhanh thông số trong bảng
    const handleUpdateComponent = (
        index: number,
        field: keyof CustomProductComponent,
        val: any
    ) => {
        setComponents((prev) =>
            prev.map((c, i) => {
                if (i !== index) return c;
                if (field === "percentage") {
                    return { ...c, percentage: Math.max(0, Math.min(100, Number(val) || 0)) };
                }
                return { ...c, [field]: val };
            })
        );
    };

    // Tự động chia đều %
    const handleEqualizePercentages = () => {
        if (components.length === 0) return;
        const count = components.length;
        const base = Math.floor(100 / count);
        const remainder = 100 - base * count;

        setComponents((prev) =>
            prev.map((c, i) => ({
                ...c,
                percentage: i === 0 ? base + remainder : base,
            }))
        );
    };

    // Lưu cấu hình phối sản phẩm
    const handleSaveRecipe = async () => {
        if (!productInfo) return;

        if (components.length === 0) {
            showToast("Cảnh báo", "Vui lòng chọn ít nhất một sản phẩm thành phần để phối.", "warning");
            return;
        }

        if (totalPercentage !== 100) {
            showToast(
                "Cảnh báo",
                `Tổng tỷ lệ thành phần hiện là ${totalPercentage}%. Vui lòng điều chỉnh hoặc bấm "Chia đều %" để đạt chính xác 100%.`,
                "warning"
            );
            return;
        }

        try {
            setSaving(true);

            // Lưu trực tiếp vào product_custom và product_custom_item trên backend
            await FactoryServiceManager.saveCustomRecipe(productId, {
                bottleType: bottleType,
                labelDesign: labelDesign,
                notes: notes,
                items: components.map((c) => ({
                    productId: c.productId,
                    percentage: c.percentage,
                    note: c.note || "",
                })),
            });

            showToast("Thành công", "Đã lưu cấu hình phối sản phẩm vào công thức thành công!", "success");
            onUpdated?.();
        } catch (error) {
            console.error("Lỗi lưu cấu hình phối sản phẩm:", error);
            showToast("Lỗi", "Không thể lưu cấu hình phối sản phẩm. Vui lòng thử lại.", "danger");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            {/* KHỐI HIỂN THỊ THIẾT KẾ LỌ CHAI (PRODUCT_CUSTOM BOTTLE & LABEL DESIGN) */}
            <div className="card border shadow-sm mb-4">
                <div className="card-header bg-white py-3 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3 bg-primary-subtle text-primary"
                            style={{ width: 38, height: 38 }}
                        >
                            <FontAwesomeIcon icon={faWineBottle} />
                        </span>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h6 className="fw-bold mb-0 text-dark">Thiết kế lọ chai & Bao bì độc bản</h6>
                                {productCustomId && (
                                    <span className="badge bg-secondary-subtle text-secondary border">
                                        Product Custom #{productCustomId}
                                    </span>
                                )}
                            </div>
                            <span className="small text-secondary">
                                Thông tin mẫu lọ và đường dẫn ảnh thiết kế được lưu trữ trong bảng <code>product_custom</code>.
                            </span>
                        </div>
                    </div>

                    {labelDesign && (
                        <a
                            href={labelDesign}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1 align-self-start align-self-sm-auto"
                        >
                            <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                            <span>Xem ảnh gốc</span>
                        </a>
                    )}
                </div>

                <div className="card-body bg-light-subtle p-3 p-md-4">
                    <div className="row g-4 align-items-stretch">
                        {/* Cột hiển thị ảnh lọ chai */}
                        <div className="col-12 col-md-4 col-lg-3">
                            <div
                                className="border rounded-4 bg-white p-3 d-flex flex-column align-items-center justify-content-center position-relative shadow-sm h-100"
                                style={{ minHeight: 200 }}
                            >
                                {labelDesign ? (
                                    <>
                                        <img
                                            src={labelDesign}
                                            alt="Thiết kế lọ chai"
                                            className="img-fluid rounded-3 mb-2"
                                            style={{ maxHeight: 170, objectFit: "contain" }}
                                            onError={(e) => {
                                                (e.target as HTMLElement).style.display = "none";
                                            }}
                                        />
                                        <span className="badge bg-dark bg-opacity-75 text-white position-absolute bottom-0 start-50 translate-middle-x mb-2 px-2 py-1 small text-nowrap">
                                            {bottleType || "Lọ tiêu chuẩn"}
                                        </span>
                                    </>
                                ) : (
                                    <div className="text-center p-3 text-secondary my-auto">
                                        <div
                                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-2 text-muted"
                                            style={{ width: 64, height: 64 }}
                                        >
                                            <FontAwesomeIcon icon={faWineBottle} size="2x" className="text-secondary" />
                                        </div>
                                        <div className="small fw-bold text-dark">Chưa có ảnh thiết kế</div>
                                        <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                            Tải ảnh từ máy hoặc nhập URL bên cạnh
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cột cấu hình mẫu lọ chai & đường dẫn design */}
                        <div className="col-12 col-md-8 col-lg-9">
                            <div className="bg-white border rounded-4 p-3 p-md-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-dark mb-1">
                                            Loại chai / Mẫu lọ (bottle_type)
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="VD: Chai thủy tinh nhỏ giọt 50ml, Lọ xịt phun sương 100ml..."
                                            value={bottleType}
                                            onChange={(e) => setBottleType(e.target.value)}
                                        />
                                    </div>

                                    <div className="mb-2">
                                        <label className="form-label small fw-bold text-dark mb-1 d-flex justify-content-between align-items-center">
                                            <span>Đường dẫn ảnh thiết kế lọ chai (label_design)</span>
                                            {uploadingDesign && (
                                                <span className="text-primary small">
                                                    <span className="spinner-border spinner-border-sm me-1" />
                                                    Đang tải ảnh lên Cloudinary...
                                                </span>
                                            )}
                                        </label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light text-secondary">
                                                <FontAwesomeIcon icon={faImage} />
                                            </span>
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="https://res.cloudinary.com/... hoặc /images/home/..."
                                                value={labelDesign}
                                                onChange={(e) => setLabelDesign(e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary d-flex align-items-center gap-1 px-3"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={uploadingDesign}
                                                title="Tải ảnh thiết kế từ máy tính lên Cloudinary"
                                            >
                                                <FontAwesomeIcon icon={faCloudArrowUp} />
                                                <span>Tải ảnh</span>
                                            </button>
                                            {labelDesign && (
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => setLabelDesign("")}
                                                    title="Xóa ảnh thiết kế"
                                                >
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            className="d-none"
                                            onChange={handleUploadDesignImage}
                                        />
                                    </div>
                                </div>

                                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 pt-2 border-top mt-3 small text-secondary">
                                    <span>
                                        📌 <i>Khi bấm "Lưu công thức phối", ảnh thiết kế và mẫu chai sẽ được lưu vào bản ghi <code>product_custom</code> tương ứng.</i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BẢNG CẤU HÌNH THÀNH PHẦN PHỐI HƯƠNG */}
            <div className="card border shadow-sm mb-4">
                {/* Header Card */}
                <div className="card-header bg-white py-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div className="d-flex align-items-center gap-3">
                        <span
                            className="d-inline-flex align-items-center justify-content-center rounded-3 bg-warning-subtle text-warning-emphasis"
                            style={{ width: 44, height: 44 }}
                        >
                            <FontAwesomeIcon icon={faFlask} size="lg" />
                        </span>
                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="fw-bold mb-0">Cấu hình thành phần sản phẩm Tùy chỉnh (Custom)</h5>
                                <span className="badge bg-warning text-dark">Bespoke Recipe</span>
                            </div>
                            <div className="small text-secondary mt-1">
                                Phối các sản phẩm tinh dầu có sẵn trong danh sách của xưởng để tạo nên sản phẩm tùy chỉnh này.
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={handleEqualizePercentages}
                            disabled={components.length === 0}
                            className="d-flex align-items-center gap-1"
                        >
                            <FontAwesomeIcon icon={faScaleBalanced} />
                            <span>Chia đều %</span>
                        </Button>
                        <Button
                            variant="warning"
                            size="sm"
                            className="text-dark fw-semibold d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleOpenPicker}
                            disabled={loadingProducts || selectableProducts.length === 0}
                        >
                            <FontAwesomeIcon icon={faPlus} />
                            <span>Chọn thêm sản phẩm phối</span>
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            className="fw-semibold d-flex align-items-center gap-2 shadow-sm"
                            onClick={handleSaveRecipe}
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm" />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faFloppyDisk} />
                                    <span>Lưu công thức phối</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Progress Bar Tổng tỷ lệ % */}
                <div className="mt-3 pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center mb-1 small">
                        <span className="fw-semibold text-secondary d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faSliders} />
                            Tổng tỷ lệ công thức:
                        </span>
                        <span
                            className={`badge ${
                                totalPercentage === 100
                                    ? "bg-success"
                                    : totalPercentage > 100
                                    ? "bg-danger"
                                    : "bg-warning text-dark"
                            }`}
                        >
                            {totalPercentage === 100 ? (
                                <>
                                    <FontAwesomeIcon icon={faCircleCheck} className="me-1" />
                                    100% (Hoàn hảo)
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faTriangleExclamation} className="me-1" />
                                    {totalPercentage}% / 100%
                                </>
                            )}
                        </span>
                    </div>
                    <ProgressBar
                        now={Math.min(100, totalPercentage)}
                        variant={totalPercentage === 100 ? "success" : totalPercentage > 100 ? "danger" : "warning"}
                        style={{ height: 8 }}
                    />
                </div>
            </div>

            {/* Body: Danh sách các sản phẩm thành phần đang được phối */}
            <div className="card-body p-0">
                {components.length === 0 ? (
                    <div className="text-center py-5">
                        <div
                            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-warning-subtle text-warning mb-3"
                            style={{ width: 64, height: 64 }}
                        >
                            <FontAwesomeIcon icon={faFlask} size="2x" />
                        </div>
                        <h6 className="fw-bold mb-1">Chưa có sản phẩm thành phần nào trong công thức</h6>
                        <p className="text-secondary small mb-3">
                            Nhấn nút "Chọn thêm sản phẩm phối" bên trên để lấy các sản phẩm có sẵn trong kho của xưởng phối vào sản phẩm này.
                        </p>
                        <Button
                            variant="warning"
                            size="sm"
                            className="text-dark fw-semibold"
                            onClick={handleOpenPicker}
                            disabled={loadingProducts || selectableProducts.length === 0}
                        >
                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                            Chọn sản phẩm có sẵn để phối
                        </Button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light small text-secondary">
                                <tr>
                                    <th style={{ width: "60px" }} className="text-center">#</th>
                                    <th style={{ minWidth: "260px" }}>Sản phẩm thành phần của xưởng</th>
                                    <th style={{ width: "160px" }}>Tỷ lệ phối (%)</th>
                                    <th style={{ minWidth: "200px" }}>Tầng hương / Ghi chú vai trò</th>
                                    <th style={{ width: "80px" }} className="text-center">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {components.map((comp, idx) => (
                                    <tr key={`${comp.productId}-${idx}`}>
                                        <td className="text-center text-secondary small fw-semibold">
                                            {idx + 1}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <span
                                                    className="d-inline-flex align-items-center justify-content-center rounded-2 bg-light text-secondary border flex-shrink-0"
                                                    style={{ width: 34, height: 34 }}
                                                >
                                                    <FontAwesomeIcon icon={faBoxOpen} />
                                                </span>
                                                <div>
                                                    <div className="fw-semibold text-dark">
                                                        {comp.productName}
                                                    </div>
                                                    <div className="small text-secondary">
                                                        Mã sản phẩm: #{comp.productId}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="input-group input-group-sm" style={{ width: 130 }}>
                                                <input
                                                    type="number"
                                                    className="form-control text-end fw-semibold"
                                                    min={1}
                                                    max={100}
                                                    value={comp.percentage}
                                                    onChange={(e) =>
                                                        handleUpdateComponent(idx, "percentage", e.target.value)
                                                    }
                                                />
                                                <span className="input-group-text bg-white">%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={comp.note || "Tầng giữa (Heart note)"}
                                                onChange={(e) =>
                                                    handleUpdateComponent(idx, "note", e.target.value)
                                                }
                                            >
                                                <option value="Tầng đầu (Top note)">Tầng đầu (Top note)</option>
                                                <option value="Tầng giữa (Heart note)">Tầng giữa (Heart note)</option>
                                                <option value="Tầng cuối (Base note)">Tầng cuối (Base note)</option>
                                                <option value="Hương chủ đạo (Signature note)">Hương chủ đạo (Signature note)</option>
                                                <option value="Hương nền định hương (Fixative)">Hương nền định hương (Fixative)</option>
                                                <option value="Hương điểm xuyết (Accent)">Hương điểm xuyết (Accent)</option>
                                            </select>
                                        </td>
                                        <td className="text-center">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                title="Xóa thành phần này"
                                                onClick={() => handleRemoveComponent(idx)}
                                            >
                                                <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer Card: Hiển thị tóm tắt công thức và ghi chú bổ sung */}
            {components.length > 0 && (
                <div className="card-footer bg-light p-3 border-top">
                    <div className="row g-2 align-items-center">
                        <div className="col-12 col-lg-8">
                            <div className="small text-secondary">
                                <span className="fw-semibold text-dark me-2">Công thức phối trực quan:</span>
                                <span>
                                    {components
                                        .filter((c) => c.productId > 0)
                                        .map((c) => `${c.percentage}% ${c.productName} [${c.note || "Tầng hương"}]`)
                                        .join(" + ")}
                                </span>
                            </div>
                        </div>
                        <div className="col-12 col-lg-4 text-lg-end">
                            <span className="small text-secondary">
                                Số thành phần: <b>{components.length}</b> sản phẩm
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL CHỌN SẢN PHẨM CÓ SẴN ĐỂ PHỐI */}
            <Modal
                show={showPickerModal}
                onHide={() => setShowPickerModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton className="bg-light">
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-warning text-dark p-2 rounded-circle">
                            <FontAwesomeIcon icon={faFlask} />
                        </span>
                        <Modal.Title as="h6" className="fw-bold mb-0">
                            Chọn sản phẩm có sẵn để phối vào công thức
                        </Modal.Title>
                    </div>
                </Modal.Header>
                <Modal.Body className="p-4">
                    <div className="mb-3">
                        <label className="form-label fw-semibold">
                            Sản phẩm có sẵn trong kho của xưởng <span className="text-danger">*</span>
                        </label>
                        <select
                            className="form-select"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(Number(e.target.value))}
                        >
                            {selectableProducts.map((p) => (
                                <option key={p.id} value={p.id}>
                                    #{p.id} - {p.name} {p.category ? `(${p.category})` : ""}
                                </option>
                            ))}
                        </select>
                        <div className="form-text small">
                            Chỉ chọn từ các sản phẩm đang có sẵn của xưởng để làm thành phần phối.
                        </div>
                    </div>

                    <div className="row g-3 mb-3">
                        <div className="col-6">
                            <label className="form-label fw-semibold">
                                Tỷ lệ phối (%) <span className="text-danger">*</span>
                            </label>
                            <div className="input-group">
                                <input
                                    type="number"
                                    className="form-control"
                                    min={1}
                                    max={100}
                                    value={selectedPercentage}
                                    onChange={(e) =>
                                        setSelectedPercentage(Math.max(1, Math.min(100, Number(e.target.value) || 0)))
                                    }
                                />
                                <span className="input-group-text">%</span>
                            </div>
                        </div>
                        <div className="col-6">
                            <label className="form-label fw-semibold">Tầng hương / Vai trò</label>
                            <select
                                className="form-select"
                                value={selectedNote}
                                onChange={(e) => setSelectedNote(e.target.value)}
                            >
                                <option value="Tầng đầu (Top note)">Tầng đầu (Top note)</option>
                                <option value="Tầng giữa (Heart note)">Tầng giữa (Heart note)</option>
                                <option value="Tầng cuối (Base note)">Tầng cuối (Base note)</option>
                                <option value="Hương chủ đạo (Signature note)">Hương chủ đạo</option>
                                <option value="Hương nền định hương (Fixative)">Hương nền định hương</option>
                                <option value="Hương điểm xuyết (Accent)">Hương điểm xuyết</option>
                            </select>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="bg-light">
                    <Button variant="light" className="border" onClick={() => setShowPickerModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="warning" className="text-dark fw-semibold" onClick={handleConfirmAddComponent}>
                        <FontAwesomeIcon icon={faPlus} className="me-1" />
                        Thêm vào công thức
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
        </>
    );
}
