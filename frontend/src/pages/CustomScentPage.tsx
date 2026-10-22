import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faArrowLeft,
    faPenToSquare,
    faPlus,
    faMinus,
    faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import {
    BOTTLE_DESIGN_OPTIONS,
    VOLUME_OPTIONS,
    type ScentNoteOption,
    type BottleDesignOption,
    type VolumeOption,
} from "../data/customScentData";
import { FactoryApiService, type FactoryItem, type CreateCustomScentPayload } from "../api/FactoryService";
import { useAuth } from "../api/AuthContext";
import { useCart } from "../api/CartContext";
import { getBuyNowUrl } from "../api/CheckoutSelection";
import { ROUTES } from "../routes/routes";
import "../css/pages/customScent.css";

export default function CustomScentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showCartNotice, refreshCart } = useCart();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Danh sách xưởng lấy từ backend
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);

    // Danh sách mùi hương lấy trực tiếp từ CSDL theo xưởng
    const [factoryScents, setFactoryScents] = useState<ScentNoteOption[]>([]);

    // Số tầng hương do khách tự chọn (1 đến 5 tầng, mặc định 3 tầng)
    const [tierCount, setTierCount] = useState<number>(3);
    const [selectedTiers, setSelectedTiers] = useState<(ScentNoteOption | null)[]>([null, null, null]);

    // Tỷ lệ % cho từng tầng theo số lượng tầng được chọn
    const tierRatios = useMemo(() => {
        if (tierCount === 1) return [100];
        if (tierCount === 2) return [50, 50];
        if (tierCount === 3) return [30, 50, 20];
        if (tierCount === 4) return [25, 25, 25, 25];
        if (tierCount === 5) return [20, 20, 20, 20, 20];
        const equalRatio = Math.floor(100 / tierCount);
        const list = Array(tierCount).fill(equalRatio);
        list[0] += 100 - (equalRatio * tierCount);
        return list;
    }, [tierCount]);

    const handleTierCountChange = (count: number) => {
        setTierCount(count);
        setSelectedTiers((prev) => {
            const next = Array(count).fill(null);
            for (let i = 0; i < Math.min(prev.length, count); i++) {
                next[i] = prev[i];
            }
            return next;
        });
    };

    const getTierTitle = (idx: number, total: number) => {
        if (total === 1) return "Tầng 1: Hương chủ đạo duy nhất (Đơn hương)";
        if (total === 2) {
            return idx === 0 ? "Tầng 1: Nốt mở đầu (Top Note)" : "Tầng 2: Nốt lưu hương (Base Note)";
        }
        if (total === 3) {
            const titles = [
                "Tầng 1: Nốt đầu (Top Note)",
                "Tầng 2: Nốt giữa (Heart Note)",
                "Tầng 3: Nốt đáy (Base Note)"
            ];
            return titles[idx] || `Tầng ${idx + 1}`;
        }
        if (total === 4) {
            const titles = [
                "Tầng 1: Nốt dạo đầu (Opening)",
                "Tầng 2: Nốt chuyển tiếp (Transition)",
                "Tầng 3: Nốt hương trung tâm (Heart Note)",
                "Tầng 4: Nốt lắng đọng (Deep Base)"
            ];
            return titles[idx] || `Tầng ${idx + 1}`;
        }
        if (total === 5) {
            const titles = [
                "Tầng 1: Nốt khởi đầu (Top Note)",
                "Tầng 2: Nốt dạo sớm (Upper Heart)",
                "Tầng 3: Nốt hương trái tim (Core Heart)",
                "Tầng 4: Nốt nền ấm áp (Warm Base)",
                "Tầng 5: Nốt đọng sâu thẳm (Deep Base)"
            ];
            return titles[idx] || `Tầng ${idx + 1}`;
        }
        return `Tầng ${idx + 1}`;
    };

    const getTierShortTitle = (idx: number, total: number) => {
        if (total === 1) return "tầng hương duy nhất";
        return `tầng ${idx + 1}`;
    };

    // Dung tích & Mẫu bao bì
    const [selectedVolume, setSelectedVolume] = useState<VolumeOption>(VOLUME_OPTIONS[1]); // 30ml
    const [selectedDesign, setSelectedDesign] = useState<BottleDesignOption>(BOTTLE_DESIGN_OPTIONS[0]);

    // Ghi chú khắc laser / in nhãn
    const [customNote, setCustomNote] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    // 1. Tải danh sách xưởng từ API
    useEffect(() => {
        FactoryApiService.getAllFactories()
            .then((res) => {
                setFactories(res);
            })
            .catch((err) => console.error("Lỗi khi tải danh sách xưởng:", err));
    }, []);

    // 2. Khi đổi xưởng -> Tải danh sách mùi hương thực tế của xưởng đó từ Database và reset các nốt hương đã chọn
    useEffect(() => {
        if (!selectedFactoryId) {
            setFactoryScents([]);
            setSelectedTiers(Array(tierCount).fill(null));
            return;
        }

        // Reset lựa chọn mùi cũ khi người dùng đổi sang xưởng khác
        setSelectedTiers(Array(tierCount).fill(null));

        FactoryApiService.getScentsByFactory(selectedFactoryId)
            .then((scentsDb) => {
                if (scentsDb && scentsDb.length > 0) {
                    const mapped: ScentNoteOption[] = scentsDb.map((s) => ({
                        id: s.id,
                        tier: s.tier,
                        name: s.name,
                        description: s.description,
                        color: "#fef08a",
                        defaultRatio: 100 / tierCount,
                        extraPrice: Math.round(s.price * 0.1), // Phụ phí hương trích tỷ lệ theo giá gốc tinh dầu của xưởng
                        origin: s.factoryName,
                    }));
                    setFactoryScents(mapped);
                } else {
                    setFactoryScents([]);
                }
            })
            .catch((err) => {
                console.warn("Lỗi khi tải mùi hương theo xưởng:", err);
                setFactoryScents([]);
            });
    }, [selectedFactoryId, tierCount]);

    // Xưởng đang chọn
    const activeFactory = useMemo(() => {
        return factories.find((f) => f.id === selectedFactoryId) || null;
    }, [factories, selectedFactoryId]);

    // Phí gia công lấy trực tiếp từ trường customServiceFee của xưởng trong CSDL
    const factoryFee = useMemo(() => {
        if (activeFactory && typeof activeFactory.customServiceFee === "number") {
            return activeFactory.customServiceFee;
        }
        return 0;
    }, [activeFactory]);

    // Tính tổng tiền động theo dung tích, các tầng hương đã chọn, mẫu bao bì và phí xưởng từ CSDL
    const unitPrice = useMemo(() => {
        const base = selectedVolume.basePrice;
        const notesExtra = selectedTiers.reduce((acc, note) => acc + (note?.extraPrice || 0), 0);
        const designExtra = selectedDesign.extraPrice || 0;
        return base + notesExtra + designExtra + factoryFee;
    }, [selectedVolume, selectedTiers, selectedDesign, factoryFee]);

    const totalPrice = useMemo(() => {
        return unitPrice * quantity;
    }, [unitPrice, quantity]);

    // Tạo mã lô mẻ pha chế độc bản
    const batchCode = useMemo(() => {
        let hash = 1000;
        selectedTiers.forEach((note, idx) => {
            const id = note?.id || (idx + 1);
            hash = (hash + (id * (idx + 1) * 17)) % 9000;
        });
        return `#OL-${hash + 1000}`;
    }, [selectedTiers]);

    // Kiểm tra xem đã hoàn thành việc chọn xưởng và đủ các tầng hương chưa
    const isReadyToOrder = Boolean(
        selectedFactoryId && selectedTiers.length === tierCount && selectedTiers.every((t) => t !== null)
    );

    // Chuẩn bị payload phối hương
    const buildPayload = (): CreateCustomScentPayload => {
        const customItems = selectedTiers.map((t, idx) => ({
            productId: t!.id,
            percentage: tierRatios[idx],
            volumeMl: (selectedVolume.ml * tierRatios[idx]) / 100,
        }));

        return {
            factoryId: selectedFactoryId!,
            bottleType: selectedDesign.title,
            labelDesign: String(selectedDesign.id),
            totalVolumeMl: selectedVolume.ml,
            price: unitPrice,
            customNote: customNote.trim() || undefined,
            quantity: quantity,
            items: customItems,
        };
    };

    const validateOrder = (): boolean => {
        if (!selectedFactoryId) {
            alert("Vui lòng chọn xưởng chưng cất trước khi tiếp tục!");
            return false;
        }

        if (!selectedTiers.every((t) => t !== null)) {
            alert(`Vui lòng chọn đầy đủ cả ${tierCount} tầng hương trước khi tiếp tục!`);
            return false;
        }

        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return false;
        }
        return true;
    };

    // 1. Thêm sản phẩm phối hương vào giỏ hàng
    const handleAddToCart = async () => {
        if (!validateOrder() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const payload = buildPayload();
            await FactoryApiService.addCustomScentToCart(payload);
            await refreshCart();
            showCartNotice(`Đã thêm lọ tinh dầu phối hương Bespoke (${selectedVolume.label}) vào giỏ hàng!`);
        } catch (error: any) {
            console.error("Lỗi thêm phối hương vào giỏ hàng:", error);
            alert(error.response?.data?.message || "Không thể thêm vào giỏ hàng, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // 2. Mua ngay: Lưu phối hương và chuyển thẳng sang trang Thanh toán (Checkout)
    const handleBuyNow = async () => {
        if (!validateOrder() || isSubmitting) return;

        try {
            setIsSubmitting(true);
            const payload = buildPayload();
            const res = await FactoryApiService.createCustomProduct(payload);
            
            // Chuyển hướng sang trang Checkout với thông tin BuyNow của sản phẩm phối hương vừa tạo
            const checkoutUrl = getBuyNowUrl({
                productId: res.productId,
                productMilId: res.productMilId,
                quantity: res.quantity,
            });
            navigate(checkoutUrl);
        } catch (error: any) {
            console.error("Lỗi đặt hàng phối hương:", error);
            alert(error.response?.data?.message || "Không thể tạo đơn đặt hàng, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="custom-scent-page py-4 py-lg-5">
            <div className="container px-3 px-lg-4">
                {/* NÚT QUAY LẠI GÓC TRÁI TRÊN CÙNG */}
                <div className="mb-3">
                    <Link
                        to={ROUTES.PRODUCTS}
                        className="btn btn-sm btn-white bg-white text-secondary border rounded-pill px-3 py-1 fw-semibold shadow-xs d-inline-flex align-items-center gap-2 hover-shadow"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="small" />
                        <span>Quay lại danh sách sản phẩm</span>
                    </Link>
                </div>

                <div className="row g-4 g-xl-5 align-items-start">

                    {/* CỘT TRÁI: PREVIEW CHAI TINH DẦU & CHỌN MẪU THIẾT KẾ */}
                    <div className="col-12 col-lg-5 col-xl-5">
                        <div className="card border-0 shadow-sm rounded-4 p-4 p-xl-5 bg-white position-relative">
                            <span className="scent-preview-badge">
                                <span className="scent-preview-badge-dot" />
                                Preview vỏ lọ nhãn bao bì
                            </span>

                            {/* MÔ PHỎNG CHAI TINH DẦU THEO THIẾT KẾ ĐỘC BẢN */}
                            <div className="bottle-visual-wrapper">
                                <div className={`bottle-cap cap-${selectedDesign.capStyle}`} />
                                <div className={`bottle-body ${selectedDesign.bottleShape} glass-${selectedDesign.glassStyle}`}>
                                    <div className="bottle-liquid-shine" />

                                    {/* Nhãn in khắc laser trên chai theo style từng mẫu */}
                                    <div className={`bottle-label-sticker label-${selectedDesign.labelStyle}`}>
                                        <div className="bottle-label-brand">OILIA ATELIER</div>
                                        <div className="bottle-label-title">SIGNATURE</div>
                                        <div className="bottle-label-subtitle">Bespoke Blend</div>
                                        <div className="bottle-label-desc">
                                            {customNote.trim() ? `"${customNote.slice(0, 24)}"` : "Hòa hương thủ công"}
                                        </div>
                                        <div className="bottle-label-volume">{selectedVolume.label} • 1.0 fl.oz</div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mb-3">
                                <h6 className="fw-bold text-dark mb-1">{selectedDesign.title}</h6>
                                <p className="text-secondary small mb-0">
                                    {selectedDesign.description}
                                </p>
                            </div>

                            {/* CHỌN MẪU THIẾT KẾ 1, 2, 3 - CĂN GIỮA CHUẨN GỌN GÀNG */}
                            <div className="d-flex align-items-center justify-content-center gap-2 pt-1">
                                <span className="fw-semibold text-secondary small me-1">Mẫu</span>
                                {BOTTLE_DESIGN_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`design-sample-btn ${selectedDesign.id === opt.id ? "active" : ""}`}
                                        onClick={() => setSelectedDesign(opt)}
                                        title={`${opt.title} - ${opt.description}`}
                                    >
                                        {opt.id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: BẢNG CHỌN TẦNG HƯƠNG, DUNG TÍCH, XƯỞNG & ĐẶT HÀNG */}
                    <div className="col-12 col-lg-7 col-xl-7">

                        {/* BƯỚC 1: CHỌN XƯỞNG CHƯNG CẤT TRƯỚC TIÊN */}
                        <div className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="fw-bold text-dark fs-6 mb-0">Chọn xưởng chưng cất thủ công</label>
                                <span className={`badge border rounded-pill px-3 py-1 ${activeFactory ? "bg-danger-subtle text-danger border-danger-subtle fw-bold" : "bg-secondary-subtle text-secondary"}`}>
                                    {activeFactory ? `Phí xưởng: +${factoryFee.toLocaleString("vi-VN")}đ` : "Bắt buộc"}
                                </span>
                            </div>
                            <select
                                className="form-select form-select-lg rounded-3 fs-6"
                                value={selectedFactoryId || ""}
                                onChange={(e) => {
                                    const val = e.target.value ? Number(e.target.value) : null;
                                    setSelectedFactoryId(val);
                                }}
                            >
                                <option value="">-- Vui lòng chọn xưởng chưng cất --</option>
                                {factories.map((f) => {
                                    const fee = typeof f.customServiceFee === "number" ? f.customServiceFee : 0;
                                    return (
                                        <option key={f.id} value={f.id}>
                                            {f.name} (+{fee.toLocaleString("vi-VN")}đ) - {f.address}
                                        </option>
                                    );
                                })}
                            </select>
                            {!selectedFactoryId && (
                                <div className="form-text text-danger small mt-2">
                                    * Hãy chọn xưởng trước để xem danh mục tinh dầu và giá điều chế tương ứng.
                                </div>
                            )}
                        </div>

                        {/* BƯỚC 2: CHỌN SỐ TẦNG & TỪNG TẦNG HƯƠNG (CHỈ HIỂN THỊ KHI ĐÃ CHỌN XƯỞNG) */}
                        {!selectedFactoryId ? (
                            <div className="card border border-dashed rounded-4 p-4 mb-3 text-center bg-light text-muted">
                                <div className="py-3">
                                    <div className="fs-5 fw-semibold text-secondary mb-1">Chưa chọn xưởng điều chế</div>
                                    <div className="small">Vui lòng chọn một xưởng chưng cất ở trên để mở khóa bảng tinh dầu và tùy chọn số tầng hương.</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* CHỌN SỐ LƯỢNG TẦNG HƯƠNG */}
                                <div className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="fw-bold text-dark fs-6 mb-0">Chọn số tầng hương muốn phối</label>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">
                                            {tierCount} tầng {tierCount === 1 ? "(Đơn hương)" : tierCount === 3 ? "(Chuẩn 3 tầng)" : "(Tự do)"}
                                        </span>
                                    </div>
                                    <div className="d-flex gap-2">
                                        {[1, 2, 3, 4, 5].map((count) => (
                                            <button
                                                key={count}
                                                type="button"
                                                className={`btn flex-fill py-2 rounded-3 fw-bold border ${
                                                    tierCount === count
                                                        ? "btn-outline-danger border-2 bg-danger-subtle text-danger fw-bold shadow-xs"
                                                        : "btn-outline-secondary text-dark"
                                                }`}
                                                onClick={() => handleTierCountChange(count)}
                                            >
                                                {count} Tầng
                                            </button>
                                        ))}
                                    </div>
                                    <div className="small text-muted mt-2">
                                        {tierCount === 1 && "1 Tầng: Tinh dầu đơn hương thuần khiết 100% nguyên bản."}
                                        {tierCount === 2 && "2 Tầng: Hòa quyện cân bằng nhị phân (50% mở đầu - 50% lưu hương)."}
                                        {tierCount === 3 && "3 Tầng: Cấu trúc kinh điển nghệ thuật nước hoa (30% nốt đầu - 50% nốt giữa - 20% nốt đáy)."}
                                        {tierCount === 4 && "4 Tầng: Hòa phối tứ giác chuyển hương 4 chiều phức hợp đa sắc (25% mỗi tầng)."}
                                        {tierCount === 5 && "5 Tầng: Kiệt tác nước hoa cao cấp 5 tầng hương chuyển biến đa cung bậc (20% mỗi tầng)."}
                                    </div>
                                </div>

                                {/* CÁC THẺ CHỌN MÙI CHO TỪNG TẦNG */}
                                {Array.from({ length: tierCount }).map((_, idx) => (
                                    <div key={idx} className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <span className="fw-bold text-dark fs-6">{getTierTitle(idx, tierCount)}</span>
                                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">
                                                {tierRatios[idx]}%
                                            </span>
                                        </div>
                                        <select
                                            className="form-select form-select-lg rounded-3 fs-6"
                                            value={selectedTiers[idx]?.id || ""}
                                            onChange={(e) => {
                                                const val = Number(e.target.value);
                                                const note = factoryScents.find((n) => n.id === val) || null;
                                                const newSelected = [...selectedTiers];
                                                newSelected[idx] = note;
                                                setSelectedTiers(newSelected);
                                            }}
                                        >
                                            <option value="">-- Chọn mùi hương {getTierShortTitle(idx, tierCount)} ({factoryScents.length} mùi) --</option>
                                            {factoryScents.map((n) => (
                                                <option key={n.id} value={n.id}>
                                                    {n.name} {n.extraPrice > 0 ? `(+${n.extraPrice.toLocaleString("vi-VN")}đ)` : "(Tiêu chuẩn)"}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}
                            </>
                        )}

                        {/* CHỌN DUNG TÍCH */}
                        <div className="mb-4">
                            <label className="fw-bold text-dark fs-7 mb-2 d-block">Dung tích</label>
                            <div className="row g-2">
                                {VOLUME_OPTIONS.map((vol) => (
                                    <div key={vol.ml} className="col-4">
                                        <button
                                            type="button"
                                            className={`btn w-100 py-2 rounded-3 text-center border ${selectedVolume.ml === vol.ml
                                                ? "btn-outline-danger border-2 bg-danger-subtle text-danger fw-bold"
                                                : "btn-outline-secondary text-dark"
                                                }`}
                                            onClick={() => setSelectedVolume(vol)}
                                        >
                                            <div className="fs-6 fw-bold">{vol.label}</div>
                                            <div className="small text-muted">{vol.sublabel}</div>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* TỔNG KẾT CÔNG THỨC PHỐI HƯƠNG */}
                        <div className="card border border-dashed rounded-4 p-3 p-md-4 mb-4 bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <span className="fw-bold text-dark small text-uppercase">Tổng kết công thức phối hương:</span>
                                <span className="badge bg-secondary font-monospace">Mã: {batchCode}</span>
                            </div>

                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-secondary">Hòa phối ({tierCount} tầng):</span>
                                <span className="fw-semibold text-dark text-end">
                                    {selectedTiers.length === tierCount && selectedTiers.every((t) => t !== null) ? (
                                        selectedTiers.map((t, idx) => `${t!.name.replace("Tinh dầu ", "")} (${tierRatios[idx]}%)`).join(" + ")
                                    ) : (
                                        <span className="text-warning fw-normal">Chưa chọn đủ {tierCount} tầng hương</span>
                                    )}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-secondary">Bao bì & Vỏ lọ:</span>
                                <span className="fw-semibold text-dark text-end">
                                    {selectedDesign.title} {selectedDesign.extraPrice > 0 ? `(+${selectedDesign.extraPrice.toLocaleString("vi-VN")}đ)` : "(Mặc định)"}
                                </span>
                            </div>

                            <div className="d-flex justify-content-between small mb-2">
                                <span className="text-secondary">Dung tích:</span>
                                <span className="fw-semibold text-dark text-end">
                                    Extrait Pur {selectedVolume.label} ({selectedVolume.sublabel}) - {selectedVolume.basePrice.toLocaleString("vi-VN")}đ
                                </span>
                            </div>

                            <div className="d-flex justify-content-between small">
                                <span className="text-secondary">Xưởng chưng cất:</span>
                                <span className="fw-semibold text-dark text-end text-truncate" style={{ maxWidth: "260px" }}>
                                    {activeFactory ? `${activeFactory.name} (+${factoryFee.toLocaleString("vi-VN")}đ)` : <span className="text-warning fw-normal">Chưa chọn xưởng</span>}
                                </span>
                            </div>
                        </div>

                        {/* GHI CHÚ ĐIỀU CHẾ & KHẮC LASER */}
                        <div className="mb-4">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="fw-bold text-dark fs-7 d-flex align-items-center gap-1">
                                    <FontAwesomeIcon icon={faPenToSquare} className="text-danger" />
                                    Ghi chú điều chế & Nhãn in
                                </label>
                                <span className="text-muted small">Tối đa 120 ký tự</span>
                            </div>
                            <input
                                type="text"
                                className="form-control rounded-3"
                                maxLength={120}
                                placeholder="Ví dụ: Khắc tên 'An Nhiên', giảm nhẹ tỷ lệ nốt đầu, kèm thiệp quà tặng..."
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                            />
                        </div>

                        {/* ACTION BAR: SỐ LƯỢNG, GIÁ & 2 NÚT HÀNH ĐỘNG CÙNG 1 HÀNG */}
                        <div className="d-flex align-items-center justify-content-between gap-3 pt-3 border-top flex-wrap">
                            <div className="d-flex align-items-center gap-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="fw-semibold text-secondary small">SL:</span>
                                    <div className="d-flex align-items-center justify-content-between border rounded-3 px-2 py-1 bg-white shadow-xs" style={{ width: "100px" }}>
                                        <button
                                            type="button"
                                            className="btn btn-link text-secondary p-0 text-decoration-none"
                                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                            disabled={quantity <= 1}
                                            style={{ width: "24px", height: "24px" }}
                                        >
                                            <FontAwesomeIcon icon={faMinus} className="small" />
                                        </button>
                                        <span className="fw-bold text-dark px-2">{quantity}</span>
                                        <button
                                            type="button"
                                            className="btn btn-link text-secondary p-0 text-decoration-none"
                                            onClick={() => setQuantity((q) => Math.min(50, q + 1))}
                                            disabled={quantity >= 50}
                                            style={{ width: "24px", height: "24px" }}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="small" />
                                        </button>
                                    </div>
                                </div>

                                <div className="ms-1 border-start ps-3">
                                    <div className="text-muted small lh-1">Tổng tiền</div>
                                    <div className="fs-4 fw-bolder text-danger lh-sm">
                                        {totalPrice.toLocaleString("vi-VN")}đ
                                    </div>
                                </div>
                            </div>

                            <div className="d-flex gap-2 align-items-center flex-grow-1 justify-content-end">
                                <button
                                    type="button"
                                    className={`btn px-3 py-2 rounded-3 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm ${
                                        isReadyToOrder && !isSubmitting ? "btn-outline-danger" : "btn-light text-muted border"
                                    }`}
                                    disabled={!isReadyToOrder || isSubmitting}
                                    onClick={handleAddToCart}
                                >
                                    <FontAwesomeIcon icon={faCartShopping} />
                                    <span>{isSubmitting ? "Đang xử lý..." : "Thêm giỏ hàng"}</span>
                                </button>

                                <button
                                    type="button"
                                    className={`btn px-4 py-2 rounded-3 fw-bold d-inline-flex align-items-center justify-content-center gap-2 shadow-sm ${
                                        isReadyToOrder && !isSubmitting ? "btn-danger" : "btn-secondary opacity-75"
                                    }`}
                                    disabled={!isReadyToOrder || isSubmitting}
                                    onClick={handleBuyNow}
                                >
                                    <span>{isSubmitting ? "Đang xử lý..." : "Đặt hàng ngay"}</span>
                                    <FontAwesomeIcon icon={faArrowRight} />
                                </button>
                            </div>
                        </div>



                    </div>
                </div>
            </div>
        </div>
    );
}
