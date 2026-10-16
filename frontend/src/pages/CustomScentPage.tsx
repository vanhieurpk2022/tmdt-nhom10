import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faArrowRight,
    faPenToSquare,
    faPlus,
    faMinus,
} from "@fortawesome/free-solid-svg-icons";
import {
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
    const [selectedFactoryId, setSelectedFactoryId] = useState<number | null>(null);

    // Danh sách mùi hương lấy trực tiếp từ CSDL theo xưởng
    const [factoryScents, setFactoryScents] = useState<ScentNoteOption[]>([]);

    // Lựa chọn 3 tầng hương theo xưởng
    const topNotes = useMemo(() => {
        return factoryScents.filter((n) => n.tier === 1);
    }, [factoryScents]);

    const heartNotes = useMemo(() => {
        return factoryScents.filter((n) => n.tier === 2);
    }, [factoryScents]);

    const baseNotes = useMemo(() => {
        return factoryScents.filter((n) => n.tier === 3);
    }, [factoryScents]);

    const [selectedTopNote, setSelectedTopNote] = useState<ScentNoteOption | null>(null);
    const [selectedHeartNote, setSelectedHeartNote] = useState<ScentNoteOption | null>(null);
    const [selectedBaseNote, setSelectedBaseNote] = useState<ScentNoteOption | null>(null);

    // Tỷ lệ phần trăm 3 tầng hương chuẩn công thức
    const ratioTop = 30;
    const ratioHeart = 50;
    const ratioBase = 20;

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
            setSelectedTopNote(null);
            setSelectedHeartNote(null);
            setSelectedBaseNote(null);
            return;
        }

        // Reset lựa chọn mùi cũ khi người dùng đổi sang xưởng khác
        setSelectedTopNote(null);
        setSelectedHeartNote(null);
        setSelectedBaseNote(null);

        FactoryApiService.getScentsByFactory(selectedFactoryId)
            .then((scentsDb) => {
                if (scentsDb && scentsDb.length > 0) {
                    const mapped: ScentNoteOption[] = scentsDb.map((s) => ({
                        id: s.id,
                        tier: s.tier,
                        name: s.name,
                        description: s.description,
                        color: "#fef08a",
                        defaultRatio: s.tier === 1 ? 30 : s.tier === 2 ? 50 : 20,
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
    }, [selectedFactoryId]);

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

    // Tính tổng tiền động theo dung tích, 3 tầng hương đã chọn, mẫu bao bì và phí xưởng từ CSDL
    const unitPrice = useMemo(() => {
        const base = selectedVolume.basePrice;
        const notesExtra = (selectedTopNote?.extraPrice || 0) +
            (selectedHeartNote?.extraPrice || 0) +
            (selectedBaseNote?.extraPrice || 0);
        const designExtra = selectedDesign.extraPrice || 0;
        return base + notesExtra + designExtra + factoryFee;
    }, [selectedVolume, selectedTopNote, selectedHeartNote, selectedBaseNote, selectedDesign, factoryFee]);

    const totalPrice = useMemo(() => {
        return unitPrice * quantity;
    }, [unitPrice, quantity]);

    // Tạo mã lô mẻ pha chế độc bản
    const batchCode = useMemo(() => {
        const topId = selectedTopNote?.id || 0;
        const heartId = selectedHeartNote?.id || 0;
        const baseId = selectedBaseNote?.id || 0;
        const hash = ((topId * 17) + (heartId * 31) + (baseId * 53)) % 9000 + 1000;
        return `#OL-${hash}`;
    }, [selectedTopNote, selectedHeartNote, selectedBaseNote]);

    // Kiểm tra xem đã hoàn thành việc chọn xưởng và 3 tầng hương chưa
    const isReadyToOrder = Boolean(
        selectedFactoryId && selectedTopNote && selectedHeartNote && selectedBaseNote
    );

    // Xử lý đặt hàng phối hương
    const handleOrder = () => {
        if (!selectedFactoryId) {
            alert("Vui lòng chọn xưởng chưng cất trước khi tiếp tục!");
            return;
        }

        if (!selectedTopNote || !selectedHeartNote || !selectedBaseNote) {
            alert("Vui lòng chọn đầy đủ cả 3 tầng hương (Nốt đầu, Nốt giữa, Nốt đáy)!");
            return;
        }

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

                        {/* BƯỚC 2: CHỌN 3 TẦNG HƯƠNG (CHỈ HIỂN THỊ KHI ĐÃ CHỌN XƯỞNG) */}
                        {!selectedFactoryId ? (
                            <div className="card border border-dashed rounded-4 p-4 mb-3 text-center bg-light text-muted">
                                <div className="py-3">
                                    <div className="fs-5 fw-semibold text-secondary mb-1">Chưa chọn xưởng điều chế</div>
                                    <div className="small">Vui lòng chọn một xưởng chưng cất ở trên để mở khóa bảng tinh dầu 3 tầng hương đặc trưng của xưởng đó.</div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* TẦNG 1: TOP NOTE */}
                                <div className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-dark fs-6">Tầng 1 (Nốt đầu)</span>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">{ratioTop}%</span>
                                    </div>
                                    <select
                                        className="form-select form-select-lg rounded-3 fs-6"
                                        value={selectedTopNote?.id || ""}
                                        onChange={(e) => {
                                            const note = topNotes.find((n) => n.id === Number(e.target.value));
                                            setSelectedTopNote(note || null);
                                        }}
                                    >
                                        <option value="">-- Chọn nốt đầu ({topNotes.length} mùi) --</option>
                                        {topNotes.map((n) => (
                                            <option key={n.id} value={n.id}>
                                                {n.name} {n.extraPrice > 0 ? `(+${n.extraPrice.toLocaleString("vi-VN")}đ)` : "(Tiêu chuẩn)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* TẦNG 2: HEART NOTE */}
                                <div className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-dark fs-6">Tầng 2 (Nốt giữa)</span>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">{ratioHeart}%</span>
                                    </div>
                                    <select
                                        className="form-select form-select-lg rounded-3 fs-6"
                                        value={selectedHeartNote?.id || ""}
                                        onChange={(e) => {
                                            const note = heartNotes.find((n) => n.id === Number(e.target.value));
                                            setSelectedHeartNote(note || null);
                                        }}
                                    >
                                        <option value="">-- Chọn nốt giữa ({heartNotes.length} mùi) --</option>
                                        {heartNotes.map((n) => (
                                            <option key={n.id} value={n.id}>
                                                {n.name} {n.extraPrice > 0 ? `(+${n.extraPrice.toLocaleString("vi-VN")}đ)` : "(Tiêu chuẩn)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* TẦNG 3: BASE NOTE */}
                                <div className="card border rounded-4 p-3 mb-3 shadow-none bg-white">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="fw-bold text-dark fs-6">Tầng 3 (Nốt đáy)</span>
                                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill px-3 py-1">{ratioBase}%</span>
                                    </div>
                                    <select
                                        className="form-select form-select-lg rounded-3 fs-6"
                                        value={selectedBaseNote?.id || ""}
                                        onChange={(e) => {
                                            const note = baseNotes.find((n) => n.id === Number(e.target.value));
                                            setSelectedBaseNote(note || null);
                                        }}
                                    >
                                        <option value="">-- Chọn nốt đáy ({baseNotes.length} mùi) --</option>
                                        {baseNotes.map((n) => (
                                            <option key={n.id} value={n.id}>
                                                {n.name} {n.extraPrice > 0 ? `(+${n.extraPrice.toLocaleString("vi-VN")}đ)` : "(Tiêu chuẩn)"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                                <span className="text-secondary">Hòa phối 3 nốt:</span>
                                <span className="fw-semibold text-dark text-end">
                                    {selectedTopNote && selectedHeartNote && selectedBaseNote ? (
                                        `${selectedTopNote.name.replace("Tinh dầu ", "")} (${ratioTop}%) + ${selectedHeartNote.name.replace("Tinh dầu ", "")} (${ratioHeart}%) + ${selectedBaseNote.name.replace("Tinh dầu ", "")} (${ratioBase}%)`
                                    ) : (
                                        <span className="text-warning fw-normal">Chưa chọn đủ 3 tầng hương</span>
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

                        {/* ACTION BAR: SỐ LƯỢNG, GIÁ & NÚT ĐẶT HÀNG */}
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

                            <div className="d-flex gap-2">
                                <Link to={ROUTES.PRODUCTS} className="btn btn-outline-secondary px-3 rounded-3 fw-semibold">
                                    Quay lại
                                </Link>
                                <button
                                    type="button"
                                    className={`btn px-4 py-2 rounded-3 fw-bold d-inline-flex align-items-center gap-2 shadow-sm ${isReadyToOrder ? "btn-danger" : "btn-secondary opacity-75"
                                        }`}
                                    disabled={!isReadyToOrder}
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
