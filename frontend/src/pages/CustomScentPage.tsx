import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faArrowLeft,
    faUpload,
    faPenToSquare,
    faCheck,
    faSliders,
    faSparkles,
} from "@fortawesome/free-solid-svg-icons";
import {
    SCENT_NOTE_OPTIONS,
    BOTTLE_DESIGN_OPTIONS,
    VOLUME_OPTIONS,
    type ScentNoteOption,
    type BottleDesignOption,
    type VolumeOption,
} from "../data/customScentData";
import { FactoryApiService, type FactoryItem } from "../api/FactoryService";
import { useAuth } from "../api/AuthContext";
import { useCart } from "../api/CartContext";
import { ROUTES } from "../routes/routes";
import "../css/pages/customScent.css";

export default function CustomScentPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const { showCartNotice } = useCart();

    // Danh sách xưởng lấy từ backend
    const [factories, setFactories] = useState<FactoryItem[]>([]);
    const [selectedFactoryId, setSelectedFactoryId] = useState<number>(1);

    // Lựa chọn 3 tầng hương
    const topNotes = useMemo(() => SCENT_NOTE_OPTIONS.filter((n) => n.tier === 1), []);
    const heartNotes = useMemo(() => SCENT_NOTE_OPTIONS.filter((n) => n.tier === 2), []);
    const baseNotes = useMemo(() => SCENT_NOTE_OPTIONS.filter((n) => n.tier === 3), []);

    const [selectedTopNote, setSelectedTopNote] = useState<ScentNoteOption>(topNotes[0]);
    const [selectedHeartNote, setSelectedHeartNote] = useState<ScentNoteOption>(heartNotes[0]);
    const [selectedBaseNote, setSelectedBaseNote] = useState<ScentNoteOption>(baseNotes[0]);

    // Tỷ lệ phần trăm 3 tầng hương
    const [ratioTop, setRatioTop] = useState<number>(30);
    const [ratioHeart, setRatioHeart] = useState<number>(50);
    const [ratioBase, setRatioBase] = useState<number>(20);

    // Dung tích & Mẫu bao bì
    const [selectedVolume, setSelectedVolume] = useState<VolumeOption>(VOLUME_OPTIONS[1]); // 30ml
    const [selectedDesign, setSelectedDesign] = useState<BottleDesignOption>(BOTTLE_DESIGN_OPTIONS[0]);

    // Ghi chú khắc laser / in nhãn
    const [customNote, setCustomNote] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(1);

    // Tải xưởng từ API
    useEffect(() => {
        FactoryApiService.getAllFactories()
            .then((res) => {
                setFactories(res);
                if (res.length > 0) {
                    setSelectedFactoryId(res[0].id);
                }
            })
            .catch((err) => console.error("Lỗi khi tải danh sách xưởng:", err));
    }, []);

    // Xưởng đang chọn
    const activeFactory = useMemo(() => {
        return factories.find((f) => f.id === selectedFactoryId) || {
            id: 1,
            name: "Xưởng Đà Lạt Organic — Cao nguyên Lâm Viên",
            address: "Lâm Đồng",
        };
    }, [factories, selectedFactoryId]);

    // Tính tổng tiền
    const totalPrice = useMemo(() => {
        return selectedVolume.basePrice * quantity;
    }, [selectedVolume, quantity]);

    // Tạo mã lô mẻ pha chế độc bản
    const batchCode = useMemo(() => {
        const hash = ((selectedTopNote.id * 17) + (selectedHeartNote.id * 31) + (selectedBaseNote.id * 53)) % 9000 + 1000;
        return `#OL-${hash}`;
    }, [selectedTopNote, selectedHeartNote, selectedBaseNote]);

    // Xử lý đặt hàng phối hương
    const handleOrder = () => {
        if (!user) {
            navigate(ROUTES.LOGIN, { state: { from: location } });
            return;
        }

        showCartNotice(
            `Đã lưu công thức Bespoke ${selectedVolume.label} (${selectedTopNote.name} + ${selectedHeartNote.name} + ${selectedBaseNote.name}) thành công!`
        );
        // Chuyển tới giỏ hàng
        navigate(ROUTES.CART);
    };

    return (
        <div className="custom-scent-page py-4 py-lg-5">
            <div className="container px-3 px-lg-4">
                <div className="row g-4 g-xl-5 align-items-start">
                    
                    {/* CỘT TRÁI: PREVIEW CHAI TINH DẦU & CHỌN MẪU THIẾT KẾ */}
                    <div className="col-12 col-lg-5 col-xl-5">
                        <div className="scent-preview-card">
                            <span className="scent-preview-badge">
                                <span className="scent-preview-badge-dot" />
                                Preview vỏ lọ nhãn bao bì
                            </span>

                            {/* MÔ PHỎNG CHAI TINH DẦU */}
                            <div className="bottle-visual-wrapper">
                                <div className="bottle-cap" />
                                <div className={`bottle-body ${selectedDesign.bottleShape}`}>
                                    <div className="bottle-liquid-shine" />
                                    
                                    {/* Nhãn in khắc laser trên chai */}
                                    <div className="bottle-label-sticker">
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

                            <p className="bottle-caption-text">
                                {selectedDesign.description}
                            </p>

                            {/* CHỌN MẪU 1, 2, 3 HOẶC UPLOAD */}
                            <div className="design-sample-selector">
                                <span className="fw-semibold text-secondary small me-1">Mẫu</span>
                                {BOTTLE_DESIGN_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        className={`design-sample-btn ${selectedDesign.id === opt.id ? "active" : ""}`}
                                        onClick={() => setSelectedDesign(opt)}
                                    >
                                        {opt.id}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    className="btn-upload-design"
                                    onClick={() => alert("Tính năng tải lên file nhãn thiết kế (.ai, .psd, .png) chuẩn bị khả dụng!")}
                                >
                                    <FontAwesomeIcon icon={faUpload} />
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CỘT PHẢI: BẢNG CHỌN TẦNG HƯƠNG, DUNG TÍCH, XƯỞNG & ĐẶT HÀNG */}
                    <div className="col-12 col-lg-7 col-xl-7">
                        
                        {/* TẦNG 1: TOP NOTE */}
                        <div className="scent-tier-card">
                            <div className="scent-tier-header">
                                <span className="scent-tier-title">Tầng 1 (Nốt đầu)</span>
                                <span className="scent-tier-ratio-badge">{ratioTop}%</span>
                            </div>
                            <select
                                className="form-select scent-select-box"
                                value={selectedTopNote.id}
                                onChange={(e) => {
                                    const note = topNotes.find((n) => n.id === Number(e.target.value));
                                    if (note) setSelectedTopNote(note);
                                }}
                            >
                                {topNotes.map((n) => (
                                    <option key={n.id} value={n.id}>
                                        {n.name} — {n.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TẦNG 2: HEART NOTE */}
                        <div className="scent-tier-card">
                            <div className="scent-tier-header">
                                <span className="scent-tier-title">Tầng 2 (Nốt giữa)</span>
                                <span className="scent-tier-ratio-badge">{ratioHeart}%</span>
                            </div>
                            <select
                                className="form-select scent-select-box"
                                value={selectedHeartNote.id}
                                onChange={(e) => {
                                    const note = heartNotes.find((n) => n.id === Number(e.target.value));
                                    if (note) setSelectedHeartNote(note);
                                }}
                            >
                                {heartNotes.map((n) => (
                                    <option key={n.id} value={n.id}>
                                        {n.name} — {n.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* TẦNG 3: BASE NOTE */}
                        <div className="scent-tier-card">
                            <div className="scent-tier-header">
                                <span className="scent-tier-title">Tầng 3 (Nốt đáy)</span>
                                <span className="scent-tier-ratio-badge">{ratioBase}%</span>
                            </div>
                            <select
                                className="form-select scent-select-box"
                                value={selectedBaseNote.id}
                                onChange={(e) => {
                                    const note = baseNotes.find((n) => n.id === Number(e.target.value));
                                    if (note) setSelectedBaseNote(note);
                                }}
                            >
                                {baseNotes.map((n) => (
                                    <option key={n.id} value={n.id}>
                                        {n.name} — {n.description}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* CHỌN DUNG TÍCH */}
                        <div className="mb-4">
                            <label className="fw-bold text-dark fs-7 mb-2 d-block">Dung tích</label>
                            <div className="volume-selector-grid">
                                {VOLUME_OPTIONS.map((vol) => (
                                    <div
                                        key={vol.ml}
                                        className={`volume-option-btn ${selectedVolume.ml === vol.ml ? "active" : ""}`}
                                        onClick={() => setSelectedVolume(vol)}
                                    >
                                        <div className="volume-option-ml">{vol.label}</div>
                                        <div className="volume-option-sub">{vol.sublabel}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CHỌN XƯỞNG CHƯNG CẤT */}
                        <div className="mb-4">
                            <label className="fw-bold text-dark fs-7 mb-2 d-block">Xưởng chưng cất</label>
                            <select
                                className="form-select scent-select-box"
                                value={selectedFactoryId}
                                onChange={(e) => setSelectedFactoryId(Number(e.target.value))}
                            >
                                {factories.length > 0 ? (
                                    factories.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} — {f.address}
                                        </option>
                                    ))
                                ) : (
                                    <option value={1}>Xưởng Đà Lạt Organic — Cao nguyên Lâm Viên • Dầu thông & Oải hương</option>
                                )}
                            </select>
                        </div>

                        {/* TỔNG KẾT CÔNG THỨC PHỐI HƯƠNG */}
                        <div className="scent-summary-box">
                            <div className="scent-summary-header">
                                <span className="scent-summary-title">Tổng kết công thức phối hương:</span>
                                <span className="scent-summary-batch">Mã lô: {batchCode}</span>
                            </div>

                            <div className="scent-summary-row">
                                <span className="scent-summary-label">Hòa phối 3 nốt:</span>
                                <span className="scent-summary-value">
                                    {selectedTopNote.name.split(" ")[0]} ({ratioTop}%) + {selectedHeartNote.name.split(" ")[0]} ({ratioHeart}%) + {selectedBaseNote.name.split(" ")[0]} ({ratioBase}%)
                                </span>
                            </div>

                            <div className="scent-summary-row">
                                <span className="scent-summary-label">Dung tích:</span>
                                <span className="scent-summary-value">
                                    Extrait Pur {selectedVolume.label} ({selectedVolume.sublabel})
                                </span>
                            </div>

                            <div className="scent-summary-row mb-0">
                                <span className="scent-summary-label">Xưởng chưng cất:</span>
                                <span className="scent-summary-value text-truncate" style={{ maxWidth: "260px" }}>
                                    {activeFactory.name}
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
                                <span className="text-muted fs-8">Tối đa 120 ký tự</span>
                            </div>
                            <input
                                type="text"
                                className="form-control custom-notes-input"
                                maxLength={120}
                                placeholder="Ví dụ: Khắc tên 'An Nhiên', giảm nhẹ tỷ lệ nốt đầu, kèm thiệp quà tặng..."
                                value={customNote}
                                onChange={(e) => setCustomNote(e.target.value)}
                            />
                        </div>

                        {/* ACTION BAR: SỐ LƯỢNG, GIÁ & NÚT ĐẶT HÀNG */}
                        <div className="scent-action-bar">
                            <div className="d-flex align-items-center gap-3">
                                <span className="fw-semibold text-secondary small">SL:</span>
                                <input
                                    type="number"
                                    min={1}
                                    max={50}
                                    className="scent-qty-input"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                                />
                                <div className="d-flex align-items-baseline gap-2 ms-2">
                                    <span className="text-muted small">Tổng tiền:</span>
                                    <span className="scent-total-price">
                                        {totalPrice.toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                            </div>

                            <div className="d-flex gap-2">
                                <Link to={ROUTES.PRODUCTS} className="btn btn-outline-secondary px-3 rounded-3 fw-semibold">
                                    Quay lại
                                </Link>
                                <button
                                    type="button"
                                    className="btn-order-bespoke"
                                    onClick={handleOrder}
                                >
                                    <span>Đặt hàng</span>
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
