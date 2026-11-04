import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useLocation, useSearchParams, useParams } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowLeft,
    faPlus,
    faMinus,
    faCartShopping,
    faBolt,
    faUpload,
    faCheckCircle,
    faExclamationTriangle,
    faScaleBalanced,
} from "@fortawesome/free-solid-svg-icons";
import {
    FactoryApiService,
    type FactoryItem,
    type ScentProductFromDb,
    type BottleSampleItem,
    type CreateCustomScentPayload,
} from "../api/FactoryService";
import { cloudinaryService } from "../api/UploadApi";
import { useAuth } from "../api/AuthContext";
import { useCart } from "../api/CartContext";
import { getBuyNowUrl } from "../api/CheckoutSelection";
import { ROUTES } from "../routes/routes";
import "../css/pages/customScent.css";

interface RecipeRowState {
    id: string; // unique local key
    productId: number | null;
    volumeMl: number;
}

// Mẫu chai mặc định từ product_image có is_custom_example
const DEFAULT_BOTTLE_SAMPLES: BottleSampleItem[] = [
    { id: 801, imageUrl: "/images/home/lavender-france.png", isCustomSample: true, isThumbnail: false },
    { id: 802, imageUrl: "/images/home/deep-sleep-blend.png", isCustomSample: true, isThumbnail: false },
    { id: 803, imageUrl: "/images/home/tea-tree-australia.png", isCustomSample: true, isThumbnail: false },
    { id: 804, imageUrl: "/images/home/jasmine-sambac.png", isCustomSample: true, isThumbnail: false },
];

export default function CustomScentCustomizerPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const routeParams = useParams();
    const { user } = useAuth();
    const { showCartNotice, refreshCart } = useCart();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Lấy ID sản phẩm nếu được chuyển sang từ nút "Xem" (hỗ trợ cả param 'id', 'customizerid', 'customizerId', route param)
    const targetCustomId =
        searchParams.get("customizerid") ||
        searchParams.get("customizerId") ||
        searchParams.get("id") ||
        routeParams.id ||
        null;

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isUploadingLabel, setIsUploadingLabel] = useState<boolean>(false);

    // Danh sách xưởng & chai mẫu từ hệ thống
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [bottleSamples, setBottleSamples] = useState<BottleSampleItem[]>([]);

    // State cho Form chế tác
    const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);
    const [factoryScents, setFactoryScents] = useState<ScentProductFromDb[]>([]);
    const [customProductName, setCustomProductName] = useState<string>("");
    const [totalVolumeMl, setTotalVolumeMl] = useState<number>(30);
    const [customNotes, setCustomNotes] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    // Mẫu lọ & Nhãn riêng
    // 0: nhãn custom (từ label_design của đơn hoặc tải lên)
    // 1..n: các lọ mẫu từ xưởng
    const [activeBottleIndex, setActiveBottleIndex] = useState<number>(1);
    const [customLabelUrl, setCustomLabelUrl] = useState<string>("");

    // Các dòng nguyên liệu phối hương
    const [recipeRows, setRecipeRows] = useState<RecipeRowState[]>([]);

    // 1. Tải danh sách xưởng và mẫu lọ ban đầu
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [factoriesRes, samplesRes] = await Promise.all([
                    FactoryApiService.getAllFactories().catch(() => []),
                    FactoryApiService.getBottleSamples().catch(() => []),
                ]);

                setFactories(factoriesRes);
                setBottleSamples(samplesRes);

                // Nếu có targetCustomId ("Xem" từ bản thảo 1) -> NẠP THÔNG SỐ TỪ CSDL
                if (targetCustomId) {
                    try {
                        const detail = await FactoryApiService.getCustomScentDetail(targetCustomId);
                        setCustomProductName(detail.name || "");
                        setTotalVolumeMl(detail.totalVolumeMl || 30);
                        setCustomNotes(""); // Không nạp ghi chú cũ, để người dùng tự nhập

                        const resolvedFactoryId =
                            detail.factoryId || (factoriesRes.length > 0 ? factoriesRes[0].id : null);
                        if (resolvedFactoryId) {
                            setSelectedFactoryId(resolvedFactoryId);
                            // Tải trước nguyên liệu của đúng xưởng để dropdown nạp chính xác
                            const scents = await FactoryApiService.getScentsByFactory(resolvedFactoryId).catch(() => []);
                            setFactoryScents(scents);
                        }

                        if (detail.labelDesign && detail.labelDesign !== "default") {
                            setCustomLabelUrl(detail.labelDesign);
                            setActiveBottleIndex(0);
                        } else {
                            setActiveBottleIndex(1);
                        }

                        if (detail.items && detail.items.length > 0) {
                            setRecipeRows(
                                detail.items.map((it, idx) => ({
                                    id: `row-${idx}-${it.productId}`,
                                    productId: it.productId,
                                    volumeMl: it.volumeMl,
                                }))
                            );
                        }
                    } catch (err) {
                        console.error("Lỗi khi nạp chi tiết phối hương:", err);
                        if (factoriesRes.length > 0) {
                            const defaultId = factoriesRes[0].id;
                            setSelectedFactoryId(defaultId);
                            const scents = await FactoryApiService.getScentsByFactory(defaultId).catch(() => []);
                            setFactoryScents(scents);
                        }
                    }
                } else {
                    // Nếu bấm "Tùy chỉnh ngay" -> ĐỂ FORM TRỐNG HOÀN TOÀN
                    setCustomProductName("");
                    setCustomNotes("");
                    setCustomLabelUrl("");
                    setActiveBottleIndex(1);
                    setTotalVolumeMl(30);
                    setRecipeRows([]); // Form trống nguyên liệu, sẵn sàng bấm [+] thêm dòng
                    if (factoriesRes.length > 0) {
                        const defaultId = factoriesRes[0].id;
                        setSelectedFactoryId(defaultId);
                        const scents = await FactoryApiService.getScentsByFactory(defaultId).catch(() => []);
                        setFactoryScents(scents);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải thông tin khởi tạo:", error);
            }
        };

        fetchInitialData();
    }, [targetCustomId]);

    // Khi người dùng chủ động đổi xưởng từ dropdown
    const handleFactoryChange = async (newFactoryId: number) => {
        setSelectedFactoryId(newFactoryId);
        try {
            const scents = await FactoryApiService.getScentsByFactory(newFactoryId);
            setFactoryScents(scents);
            setRecipeRows([]);
        } catch (error) {
            console.error("Lỗi lấy nguyên liệu của xưởng:", error);
        }
    };

    // Tính tổng dung tích đã nhập
    const currentSumMl = useMemo(() => {
        return recipeRows.reduce((sum, r) => sum + (Number(r.volumeMl) || 0), 0);
    }, [recipeRows]);

    // Kiểm tra tỷ lệ 100%
    const isSumValid = useMemo(() => {
        if (recipeRows.length === 0) return false;
        return Math.abs(currentSumMl - totalVolumeMl) <= 0.01;
    }, [currentSumMl, totalVolumeMl, recipeRows.length]);

    // Tính giá tiền động dựa trên công thức
    const unitPrice = useMemo(() => {
        if (!recipeRows.length || !totalVolumeMl) return 150000;
        let weightedPriceSum = 0;
        recipeRows.forEach((row) => {
            const scent = factoryScents.find((s) => s.id === row.productId);
            const price = scent ? scent.price : 150000;
            const rowMl = Number(row.volumeMl) || 0;
            weightedPriceSum += price * (rowMl / totalVolumeMl);
        });

        const volumeFactor = totalVolumeMl / 30;
        const calculated = weightedPriceSum * volumeFactor;
        return Math.max(120000, Math.round(calculated / 1000) * 1000);
    }, [recipeRows, factoryScents, totalVolumeMl]);

    const totalPrice = unitPrice * quantity;

    // Thêm dòng nguyên liệu mới
    const handleAddIngredientRow = () => {
        const nextId = `row-${Date.now()}`;
        const remainingMl = Math.max(0, totalVolumeMl - currentSumMl);
        const availableScent = factoryScents.find(
            (s) => !recipeRows.some((r) => r.productId === s.id)
        ) || factoryScents[0];

        setRecipeRows((prev) => [
            ...prev,
            {
                id: nextId,
                productId: availableScent ? availableScent.id : null,
                volumeMl: remainingMl > 0 ? Number(remainingMl.toFixed(1)) : 0,
            },
        ]);
    };

    // Xóa dòng nguyên liệu
    const handleDeleteIngredientRow = (id: string) => {
        setRecipeRows((prev) => prev.filter((r) => r.id !== id));
    };

    // Thay đổi sản phẩm trong dòng
    const handleRowProductChange = (id: string, productId: number) => {
        setRecipeRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, productId } : r))
        );
    };

    // Thay đổi số ml trong dòng
    const handleRowVolumeChange = (id: string, valueStr: string) => {
        const val = parseFloat(valueStr);
        setRecipeRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, volumeMl: isNaN(val) ? 0 : val } : r))
        );
    };

    // Chia đều tỷ lệ công thức
    const handleDistributeEvenly = () => {
        if (!recipeRows.length || totalVolumeMl <= 0) return;
        const count = recipeRows.length;
        const equalMl = Number((totalVolumeMl / count).toFixed(1));
        const diff = Number((totalVolumeMl - equalMl * count).toFixed(1));

        setRecipeRows((prev) =>
            prev.map((row, idx) => ({
                ...row,
                volumeMl: idx === 0 ? Number((equalMl + diff).toFixed(1)) : equalMl,
            }))
        );
    };

    // Tải lên nhãn riêng
    const handleLabelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setIsUploadingLabel(true);
            const uploaded = await cloudinaryService.upload(file);
            setCustomLabelUrl(uploaded.url);
            setActiveBottleIndex(0); // Tự động chọn nhãn riêng
        } catch (error: any) {
            console.error("Lỗi upload nhãn:", error);
            alert(error.message || "Không thể tải lên ảnh nhãn, vui lòng thử lại.");
        } finally {
            setIsUploadingLabel(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // Chuẩn bị payload phối hương
    const buildPayload = (): CreateCustomScentPayload => {
        const items = recipeRows.map((r) => {
            const scent = factoryScents.find((s) => s.id === r.productId);
            const pct = (r.volumeMl / totalVolumeMl) * 100;
            return {
                productId: r.productId!,
                scentName: scent ? scent.name : undefined,
                percentage: Number(pct.toFixed(1)),
                volumeMl: Number(r.volumeMl.toFixed(1)),
            };
        });

        let selectedBottleUrl = customLabelUrl;
        if (activeBottleIndex > 0 && availableBottleSamples[activeBottleIndex - 1]) {
            selectedBottleUrl = availableBottleSamples[activeBottleIndex - 1].imageUrl;
        }

        return {
            factoryId: selectedFactoryId!,
            name: customProductName.trim() || "Thiên nhiên gỗ",
            bottleType: `Mẫu chai #${activeBottleIndex}`,
            labelDesign: selectedBottleUrl || "default",
            totalVolumeMl: totalVolumeMl,
            price: unitPrice,
            customNote: customNotes.trim() || undefined,
            quantity: quantity,
            items: items,
        };
    };

    const validateForm = (): boolean => {
        if (!selectedFactoryId) {
            alert("Vui lòng chọn xưởng thực hiện chế tác!");
            return false;
        }
        if (recipeRows.length === 0) {
            alert("Vui lòng thêm ít nhất một nguyên liệu phối hương (bấm dấu +)!");
            return false;
        }
        if (recipeRows.some((r) => !r.productId)) {
            alert("Vui lòng chọn sản phẩm nguyên liệu cho tất cả các dòng phối hương!");
            return false;
        }
        if (!isSumValid) {
            alert(
                `Tổng tỷ lệ phối hương chưa đủ 100% (Hiện tại: ${currentSumMl}/${totalVolumeMl} ml). Hãy bấm nút "Chia đều tỉ lệ" để cân bằng chính xác!`
            );
            return false;
        }
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return false;
        }
        return true;
    };

    // Thêm vào giỏ hàng
    const handleAddToCart = async () => {
        if (!validateForm() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const payload = buildPayload();
            await FactoryApiService.addCustomScentToCart(payload);
            await refreshCart();
            showCartNotice(`Đã thêm lọ tinh dầu phối hương "${customProductName || 'Bespoke'}" vào giỏ hàng!`);
        } catch (error: any) {
            console.error("Lỗi thêm vào giỏ hàng:", error);
            alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Đặt hàng ngay (Lưu xuống DB product_custom với user_id và chuyển sang Checkout)
    const handleBuyNow = async () => {
        if (!validateForm() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const payload = buildPayload();
            const res = await FactoryApiService.createCustomProduct(payload);

            const checkoutUrl = getBuyNowUrl({
                productId: res.productId,
                productMilId: res.productMilId,
                quantity: res.quantity,
            });
            navigate(checkoutUrl);
        } catch (error: any) {
            console.error("Lỗi đặt hàng phối hương:", error);
            alert(error.response?.data?.message || "Không thể tạo đơn hàng, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Danh sách mẫu lọ từ product_image có is_custom_example
    const availableBottleSamples = useMemo(() => {
        return bottleSamples.length > 0 ? bottleSamples : DEFAULT_BOTTLE_SAMPLES;
    }, [bottleSamples]);

    // Xác định ảnh preview cho Lọ/Nhãn (lấy mẫu từ product_image có is_custom_example)
    const previewImageUrl = useMemo(() => {
        if (activeBottleIndex === 0 && customLabelUrl) {
            return customLabelUrl;
        }
        if (activeBottleIndex > 0 && availableBottleSamples[activeBottleIndex - 1]) {
            return availableBottleSamples[activeBottleIndex - 1].imageUrl;
        }
        if (availableBottleSamples.length > 0) {
            return availableBottleSamples[0].imageUrl;
        }
        return "/images/home/lavender-france.png";
    }, [activeBottleIndex, customLabelUrl, availableBottleSamples]);

    return (
        <div className="custom-scent-page py-4 py-lg-5">
            <div className="container px-3 px-lg-4">
                <div className="detail-view-container animate-fade-in">
                    {/* Thanh trên cùng: Quay lại + Tên xưởng + Tên sản phẩm custom */}
                    <div className="detail-top-bar">
                        <button
                            type="button"
                            className="btn-back-custom"
                            onClick={() => navigate(ROUTES.CUSTOM_SCENT)}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Quay lại
                        </button>

                        <div className="top-bar-inputs">
                            <div className="factory-select-box">
                                <label>Tên xưởng</label>
                                <select
                                    className="detail-input-control"
                                    value={selectedFactoryId || ""}
                                    onChange={(e) => handleFactoryChange(Number(e.target.value))}
                                >
                                    {factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="custom-name-box">
                                <label>Tên của sản phẩm custom này</label>
                                <input
                                    type="text"
                                    className="detail-input-control"
                                    placeholder="Nhập tên sản phẩm phối hương (vd: Thiên nhiên gỗ)..."
                                    value={customProductName}
                                    onChange={(e) => setCustomProductName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bố cục 2 Cột */}
                    <div className="detail-content-columns">
                        {/* CỘT TRÁI: PREVIEW LỌ & TẢI NHÃN */}
                        <div className="bottle-preview-column">
                            <div className="preview-box-main">


                                <img
                                    src={previewImageUrl}
                                    alt="Mẫu chai & nhãn"
                                    className="preview-bottle-image"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = "/images/home/relax-gift-box.png";
                                    }}
                                />

                                {/* Nhãn decal phủ lên thân chai */}
                                <div className="preview-label-overlay">
                                    <span className="preview-label-name">
                                        {customProductName || "Bespoke Scent"}
                                    </span>
                                    <span className="preview-label-sub">
                                        {totalVolumeMl} ml • 100% PURE
                                    </span>
                                </div>
                            </div>

                            {/* Hàng nút số: [0] [1] [2] [3] ... */}
                            <div className="number-buttons-row">
                                {/* Nút 0: Chỉ hiển thị khi có nhãn riêng hoặc người dùng đã upload */}
                                {customLabelUrl ? (
                                    <button
                                        type="button"
                                        className={`btn-sample-number ${activeBottleIndex === 0 ? "active" : ""}`}
                                        onClick={() => setActiveBottleIndex(0)}
                                        title="Lọ từ label_design của đơn (ảnh nhãn riêng)"
                                    >
                                        0
                                    </button>
                                ) : null}

                                {/* Các nút mẫu chai 1..n từ product_image có is_custom_example */}
                                {availableBottleSamples.map((sample, idx) => (
                                    <button
                                        key={`sample-btn-${sample.id}`}
                                        type="button"
                                        className={`btn-sample-number ${activeBottleIndex === idx + 1 ? "active" : ""}`}
                                        onClick={() => setActiveBottleIndex(idx + 1)}
                                        title={`Mẫu lọ số ${idx + 1}`}
                                    >
                                        {idx + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Nút tải lên ảnh nhãn mong muốn */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: "none" }}
                                accept="image/*"
                                onChange={handleLabelUpload}
                            />
                            <button
                                type="button"
                                className="btn-upload-label"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploadingLabel}
                            >
                                <FontAwesomeIcon icon={faUpload} />
                                {isUploadingLabel ? "Đang tải ảnh lên..." : "Tải lên ảnh nhãn mong muốn"}
                            </button>
                        </div>

                        {/* CỘT PHẢI: BẢNG NGUYÊN LIỆU PHỐI HƯƠNG */}
                        <div className="recipe-column">
                            {/* Header actions: [+] [Chia đều tỉ lệ] [Tổng: 30 Ml] */}
                            <div className="recipe-top-toolbar">
                                <div className="recipe-toolbar-left">
                                    <button
                                        type="button"
                                        className="btn-add-ingredient"
                                        onClick={handleAddIngredientRow}
                                        title="Thêm dòng sản phẩm"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-distribute-ratio"
                                        onClick={handleDistributeEvenly}
                                    >
                                        <FontAwesomeIcon icon={faScaleBalanced} className="me-1" />
                                        Chia đều tỉ lệ
                                    </button>
                                </div>

                                <div className="recipe-total-volume-box">
                                    <span>Tổng:</span>
                                    <input
                                        type="number"
                                        className="input-total-volume"
                                        min="5"
                                        max="500"
                                        step="5"
                                        value={totalVolumeMl}
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value);
                                            setTotalVolumeMl(isNaN(val) || val <= 0 ? 30 : val);
                                        }}
                                    />
                                    <span>Ml</span>
                                </div>
                            </div>

                            {/* Danh sách các dòng nguyên liệu */}
                            <div className="recipe-rows-wrapper">
                                {recipeRows.length === 0 ? (
                                    <div className="p-4 text-center border rounded-3 bg-light text-muted">
                                        <p className="mb-2 fw-semibold">Chưa có nguyên liệu nào trong công thức.</p>
                                        <p className="small mb-3">Bấm nút <strong className="text-primary">+</strong> ở trên để thêm dòng nguyên liệu từ xưởng.</p>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-primary fw-semibold"
                                            onClick={handleAddIngredientRow}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="me-1" />
                                            Thêm nguyên liệu đầu tiên
                                        </button>
                                    </div>
                                ) : (
                                    recipeRows.map((row) => {
                                        const percentage = totalVolumeMl > 0
                                            ? ((row.volumeMl / totalVolumeMl) * 100).toFixed(1)
                                            : "0";

                                        return (
                                            <div key={row.id} className="recipe-ingredient-row">
                                                {/* Dropdown chọn sản phẩm tiêu chuẩn của xưởng */}
                                                <select
                                                    className="ingredient-select"
                                                    value={row.productId || ""}
                                                    onChange={(e) =>
                                                        handleRowProductChange(row.id, Number(e.target.value))
                                                    }
                                                >
                                                    <option value="" disabled>
                                                        -- Chọn sản phẩm tiêu chuẩn --
                                                    </option>
                                                    {factoryScents.map((scent) => (
                                                        <option key={scent.id} value={scent.id}>
                                                            {scent.name} ({scent.price?.toLocaleString("vi-VN")} đ)
                                                        </option>
                                                    ))}
                                                </select>

                                                {/* Input dung tích ml */}
                                                <div className="ingredient-ml-input-group">
                                                    <input
                                                        type="number"
                                                        className="ingredient-ml-input"
                                                        min="0"
                                                        max={totalVolumeMl}
                                                        step="0.5"
                                                        value={row.volumeMl}
                                                        onChange={(e) => handleRowVolumeChange(row.id, e.target.value)}
                                                    />
                                                    <span className="ingredient-ml-unit">Ml</span>
                                                </div>

                                                {/* Badge tỷ lệ % tương ứng */}
                                                <div className="ingredient-pct-badge">{percentage}%</div>

                                                {/* Nút xóa dòng */}
                                                <button
                                                    type="button"
                                                    className="btn-delete-row"
                                                    onClick={() => handleDeleteIngredientRow(row.id)}
                                                    title="Xóa dòng nguyên liệu"
                                                >
                                                    <FontAwesomeIcon icon={faMinus} />
                                                </button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Trạng thái cân bằng tỷ lệ 100% */}
                            {recipeRows.length > 0 && (
                                <div className={`recipe-status-bar ${isSumValid ? "valid" : "invalid"}`}>
                                    <span>
                                        <FontAwesomeIcon
                                            icon={isSumValid ? faCheckCircle : faExclamationTriangle}
                                            className="me-2"
                                        />
                                        Đã phối: {currentSumMl.toFixed(1)} / {totalVolumeMl} ml (
                                        {totalVolumeMl > 0
                                            ? ((currentSumMl / totalVolumeMl) * 100).toFixed(1)
                                            : 0}
                                        %)
                                    </span>
                                    <span>
                                        {isSumValid
                                            ? "Tỷ lệ chuẩn 100%"
                                            : "Cần đảm bảo đủ tỷ lệ 100%"}
                                    </span>
                                </div>
                            )}

                            {/* Ô nhập Ghi Chú */}
                            <div className="recipe-notes-box">
                                <label>Ghi Chú</label>
                                <textarea
                                    className="recipe-notes-input"
                                    placeholder="Nhập ghi chú yêu cầu cho xưởng chế tác (vd: độ tỏa hương, phong cách đóng gói, quà tặng...)"
                                    value={customNotes}
                                    onChange={(e) => setCustomNotes(e.target.value)}
                                    rows={2}
                                />
                            </div>

                            {/* Thanh chân trang: [Số lượng] [Tổng tiền] [Thêm giỏ hàng] [Đặt hàng Ngay] */}
                            <div className="recipe-footer-bar">
                                {/* Số lượng */}
                                <div className="quantity-stepper">
                                    <button
                                        type="button"
                                        className="btn-stepper"
                                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    >
                                        <FontAwesomeIcon icon={faMinus} />
                                    </button>
                                    <span className="stepper-value">{quantity}</span>
                                    <button
                                        type="button"
                                        className="btn-stepper"
                                        onClick={() => setQuantity((q) => q + 1)}
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                    </button>
                                </div>

                                {/* Tổng tiền */}
                                <div className="recipe-price-total">
                                    <span className="price-total-label">Tổng tiền</span>
                                    <span className="price-total-value">
                                        {totalPrice.toLocaleString("vi-VN")} đ
                                    </span>
                                </div>

                                {/* Các nút hành động */}
                                <div className="recipe-footer-actions">
                                    <button
                                        type="button"
                                        className="btn-add-cart-custom"
                                        onClick={handleAddToCart}
                                        disabled={isSubmitting || !isSumValid}
                                    >
                                        <FontAwesomeIcon icon={faCartShopping} />
                                        Thêm giỏ hàng
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-buy-now-custom"
                                        onClick={handleBuyNow}
                                        disabled={isSubmitting || !isSumValid}
                                    >
                                        <FontAwesomeIcon icon={faBolt} />
                                        Đặt hàng Ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

