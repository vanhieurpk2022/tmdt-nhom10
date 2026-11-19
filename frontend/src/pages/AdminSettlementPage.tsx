import { useState, useEffect, useCallback, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NumericFormat } from "react-number-format";
import {
    faHandHoldingDollar,
    faCoins,
    faPercent,
    faMoneyBillWave,
    faRotate,
    faBuilding,
    faCreditCard,
    faReceipt,
    faCheckCircle,
    faClock,
    faCircleExclamation,
    faChevronRight,
    faChevronDown,
    faCheck,
    faFileInvoiceDollar,
    faSpinner,
    faXmark,
    faSearch,
} from "@fortawesome/free-solid-svg-icons";
import SidebarAdmin from "../components/admin/dashboard/SideBarAdmin";
import { useAdminSidebar } from "../api/AdminSidebarContext";
import { useToastContext } from "../components/toasts/ToastContext";
import "../css/pages/user-admin.css";
import "../css/pages/dashboard/admin.css";
import {
    AdminSettlementService,
    type AdminSettlementOverview,
    type FactorySettlementSummary,
    type FactoryOrderSettlement,
    type SettlementHistoryItem,
} from "../api/admin/AdminSettlementService";

const formatVnd = (val?: number) => (val || 0).toLocaleString("vi-VN") + " đ";

function readVietnameseCurrency(num?: number): string {
    if (!num || isNaN(num) || num <= 0) return "Không đồng";
    const units = ["", "nghìn", "triệu", "tỷ", "nghìn tỷ", "triệu tỷ"];
    const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

    function readThreeDigits(n: number, full: boolean) {
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const u = n % 10;
        let res = "";
        if (h > 0 || full) {
            res += digits[h] + " trăm ";
        }
        if (t > 1) {
            res += digits[t] + " mươi ";
            if (u === 1) res += "mốt ";
            else if (u === 5) res += "lăm ";
            else if (u > 0) res += digits[u] + " ";
        } else if (t === 1) {
            res += "mười ";
            if (u === 5) res += "lăm ";
            else if (u > 0) res += digits[u] + " ";
        } else {
            if ((h > 0 || full) && u > 0) res += "lẻ ";
            if (u > 0) res += digits[u] + " ";
        }
        return res.trim();
    }

    let n = Math.floor(num);
    const chunks: number[] = [];
    while (n > 0) {
        chunks.push(n % 1000);
        n = Math.floor(n / 1000);
    }

    const words: string[] = [];
    for (let i = chunks.length - 1; i >= 0; i--) {
        const chunk = chunks[i];
        if (chunk > 0) {
            const chunkStr = readThreeDigits(chunk, i < chunks.length - 1);
            words.push(chunkStr + " " + units[i]);
        }
    }

    const result = words.join(" ").replace(/\s+/g, " ").trim() + " đồng";
    return result.charAt(0).toUpperCase() + result.slice(1);
}

const FEE_OPTIONS = [
    { value: 0.05, label: "5%", name: "Ưu đãi", note: "Áp dụng cho xưởng chiến lược", badgeClass: "bg-success-subtle text-success border border-success-subtle" },
    { value: 0.08, label: "8%", name: "Tiêu chuẩn", note: "Mặc định chuẩn toàn sàn", badgeClass: "bg-danger-subtle text-danger border border-danger-subtle" },
    { value: 0.10, label: "10%", name: "Phổ thông", note: "Gói bán hàng cơ bản", badgeClass: "bg-primary-subtle text-primary border border-primary-subtle" },
    { value: 0.12, label: "12%", name: "Cao cấp", note: "Gói hỗ trợ marketing & vận hành", badgeClass: "bg-warning-subtle text-warning border border-warning-subtle" },
];

export default function AdminSettlementPage() {
    const { isCollapsed: isSidebarCollapsed } = useAdminSidebar();
    const [feeRate, setFeeRate] = useState<number>(0.08); // 8% mặc định
    const [isFeeDropdownOpen, setIsFeeDropdownOpen] = useState<boolean>(false);
    const [customFeeInput, setCustomFeeInput] = useState<string>("");
    const [customFeeError, setCustomFeeError] = useState<string>("");
    const feeDropdownRef = useRef<HTMLDivElement | null>(null);

    // Format tỷ lệ phần trăm (nguyên thì không có số thập phân, lẻ thì hiển thị tối đa 2 số thập phân)
    const formatFeePercent = (rate: number): string => {
        const pct = rate * 100;
        return Number.isInteger(pct) ? `${pct}%` : `${pct.toFixed(2).replace(/\.?0+$/, "")}%`;
    };

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (feeDropdownRef.current && !feeDropdownRef.current.contains(event.target as Node)) {
                setIsFeeDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const matchedPreset = FEE_OPTIONS.find((opt) => Math.abs(opt.value - feeRate) < 0.0001);
    const currentFeeLabel = matchedPreset
        ? `${matchedPreset.label} (${matchedPreset.name})`
        : `${formatFeePercent(feeRate)} (Tùy chỉnh)`;
    const currentFeeBadgeClass = matchedPreset
        ? matchedPreset.badgeClass
        : "bg-danger-subtle text-danger border border-danger-subtle";

    const handleApplyCustomFee = () => {
        const raw = customFeeInput.trim().replace(",", ".");
        if (!raw) {
            setCustomFeeError("Vui lòng nhập tỷ lệ %");
            return;
        }
        const num = parseFloat(raw);
        if (isNaN(num)) {
            setCustomFeeError("Giá trị không hợp lệ");
            return;
        }
        if (num < 0 || num >= 100) {
            setCustomFeeError("Tỷ lệ phí phải >= 0% và < 100%");
            return;
        }
        const rate = num / 100;
        setFeeRate(rate);
        setIsFeeDropdownOpen(false);
        setCustomFeeError("");
    };

    const [overview, setOverview] = useState<AdminSettlementOverview | null>(null);
    const [factories, setFactories] = useState<FactorySettlementSummary[]>([]);
    const [history, setHistory] = useState<SettlementHistoryItem[]>([]);
    const [activeTab, setActiveTab] = useState<"factories" | "history">("factories");
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // Modal Giải ngân
    const [selectedFactoryForDisburse, setSelectedFactoryForDisburse] = useState<FactorySettlementSummary | null>(null);
    const [disburseAmount, setDisburseAmount] = useState<number>(0);
    const [disburseBankName, setDisburseBankName] = useState<string>("");
    const [disburseAccNumber, setDisburseAccNumber] = useState<string>("");
    const [disburseAccHolder, setDisburseAccHolder] = useState<string>("");
    const [disburseTxCode, setDisburseTxCode] = useState<string>("");
    const [disburseNote, setDisburseNote] = useState<string>("");
    const [submittingDisburse, setSubmittingDisburse] = useState<boolean>(false);
    const [disburseError, setDisburseError] = useState<string>("");

    // Modal Chi tiết Đơn hàng của Xưởng
    const [selectedFactoryForOrders, setSelectedFactoryForOrders] = useState<FactorySettlementSummary | null>(null);
    const [factoryOrders, setFactoryOrders] = useState<FactoryOrderSettlement[]>([]);
    const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
    const [orderFilterTab, setOrderFilterTab] = useState<"pending" | "settled" | "all">("pending");
    const [expandedOrderIds, setExpandedOrderIds] = useState<Set<number>>(new Set());
    const [orderPage, setOrderPage] = useState<number>(1);
    const [orderPageSize, setOrderPageSize] = useState<number>(10);

    const toggleOrderCollapse = (orderId: number) => {
        setExpandedOrderIds((prev) => {
            const next = new Set(prev);
            if (next.has(orderId)) {
                next.delete(orderId);
            } else {
                next.add(orderId);
            }
            return next;
        });
    };

    // Toast thông báo hệ thống
    const { showToast } = useToastContext();

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [overviewData, factoriesData, historyData] = await Promise.all([
                AdminSettlementService.getOverview(feeRate),
                AdminSettlementService.getFactorySummaries(feeRate),
                AdminSettlementService.getHistory(),
            ]);
            setOverview(overviewData);
            setFactories(factoriesData);
            setHistory(historyData);
        } catch (error) {
            console.error("Lỗi tải dữ liệu đối soát:", error);
        } finally {
            setLoading(false);
        }
    }, [feeRate]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Mở modal giải ngân
    const handleOpenDisburseModal = (factory: FactorySettlementSummary) => {
        setSelectedFactoryForDisburse(factory);
        setDisburseAmount(factory.remainingAmount > 0 ? factory.remainingAmount : 0);
        setDisburseBankName(factory.bankName || "MB Bank");
        setDisburseAccNumber(factory.accountNumber || "");
        setDisburseAccHolder(factory.accountHolder || "");
        setDisburseTxCode(`DISB-${Date.now().toString().slice(-6)}-${factory.factoryId}`);
        setDisburseNote(`Giải ngân tiền hàng cho xưởng ${factory.factoryName}`);
        setDisburseError("");
    };

    // Xác nhận gửi yêu cầu giải ngân
    const handleSubmitDisburse = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFactoryForDisburse) return;

        if (disburseAmount <= 0) {
            setDisburseError("Số tiền giải ngân phải lớn hơn 0 đ");
            return;
        }

        if (disburseAmount > selectedFactoryForDisburse.remainingAmount + 500) {
            setDisburseError(`Số tiền giải ngân không được vượt quá số dư còn lại (${formatVnd(selectedFactoryForDisburse.remainingAmount)})`);
            return;
        }

        setSubmittingDisburse(true);
        setDisburseError("");

        try {
            await AdminSettlementService.disburse({
                factoryId: selectedFactoryForDisburse.factoryId,
                amount: disburseAmount,
                feeRate: feeRate,
                bankName: disburseBankName,
                accountNumber: disburseAccNumber,
                accountHolder: disburseAccHolder,
                transactionCode: disburseTxCode,
                note: disburseNote,
            });

            showToast(
                "Giải ngân thành công",
                `Đã giải ngân thành công ${formatVnd(disburseAmount)} cho ${selectedFactoryForDisburse.factoryName}`,
                "success"
            );
            setSelectedFactoryForDisburse(null);
            await loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || "Giải ngân thất bại, vui lòng thử lại";
            setDisburseError(msg);
            showToast("Thao tác thất bại", msg, "danger");
        } finally {
            setSubmittingDisburse(false);
        }
    };

    // Mở modal xem đơn hàng của xưởng
    const handleOpenOrdersModal = async (factory: FactorySettlementSummary) => {
        setSelectedFactoryForOrders(factory);
        setOrderFilterTab(factory.remainingAmount > 0 ? "pending" : "all");
        setLoadingOrders(true);
        try {
            const orders = await AdminSettlementService.getFactoryOrders(factory.factoryId, feeRate);
            setFactoryOrders(orders);
        } catch (err) {
            console.error("Lỗi lấy đơn hàng xưởng:", err);
            setFactoryOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Lọc xưởng theo tìm kiếm
    const filteredFactories = factories.filter((f) =>
        f.factoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.accountHolder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.accountNumber.includes(searchTerm)
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "COMPLETED":
                return <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1 text-nowrap fw-semibold" style={{ fontSize: "11px" }}>Đã giải ngân đủ</span>;
            case "PARTIAL":
                return <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 text-nowrap fw-semibold" style={{ fontSize: "11px" }}>Đã giải ngân 1 phần</span>;
            case "PENDING":
                return <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-1 text-nowrap fw-semibold" style={{ fontSize: "11px" }}>Chờ giải ngân</span>;
            default:
                return <span className="badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 text-nowrap fw-semibold" style={{ fontSize: "11px" }}>Chưa phát sinh</span>;
        }
    };

    // Phân loại đơn hàng trong modal theo trạng thái giải ngân
    const pendingOrdersList = factoryOrders.filter((o) => !o.isSettled);
    const settledOrdersList = factoryOrders.filter((o) => !!o.isSettled);
    const displayedOrders = orderFilterTab === "pending"
        ? pendingOrdersList
        : orderFilterTab === "settled"
        ? settledOrdersList
        : factoryOrders;

    const totalPendingAmount = pendingOrdersList.reduce((sum, o) => sum + o.netAmount, 0);
    const totalSettledAmount = settledOrdersList.reduce((sum, o) => sum + o.netAmount, 0);

    const orderTotalPages = Math.ceil(displayedOrders.length / orderPageSize) || 1;
    const paginatedOrders = displayedOrders.slice((orderPage - 1) * orderPageSize, orderPage * orderPageSize);

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
                <SidebarAdmin isSettlement={true} />
            </aside>

            {/* Main Content Area */}
            <main
                className="flex-grow-1 p-3 p-lg-4 admin-content overflow-x-auto d-flex flex-column gap-4"
                style={{ minWidth: 0 }}
            >
                {/* Header */}
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                    <div>
                        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                            <span className="badge p-2 rounded-3 bg-danger-subtle text-danger">
                                <FontAwesomeIcon icon={faHandHoldingDollar} />
                            </span>
                            Quản Lý Giải Ngân & Đối Soát Xưởng
                        </h4>
                        <p className="text-secondary small mb-0">
                            Khấu trừ chi phí sàn và giải ngân doanh thu thực tế cho các xưởng chế tác đối tác
                        </p>
                    </div>

                    <div className="d-flex flex-wrap align-items-center gap-2">
                        {/* Tỷ lệ phí sàn áp dụng - Dropdown hiện đại */}
                        <div className="position-relative" ref={feeDropdownRef}>
                            <button
                                type="button"
                                className="btn btn-white bg-white d-flex align-items-center gap-2 px-3 py-2 rounded-pill shadow-sm border text-decoration-none"
                                style={{ borderColor: "#e2e8f0", transition: "all 0.2s" }}
                                onClick={() => {
                                    setIsFeeDropdownOpen(!isFeeDropdownOpen);
                                    if (!matchedPreset) {
                                        setCustomFeeInput((feeRate * 100).toString());
                                    }
                                }}
                                title="Thay đổi tỷ lệ phí sàn"
                            >
                                <span
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-danger-subtle text-danger"
                                    style={{ width: "22px", height: "22px", fontSize: "0.75rem" }}
                                >
                                    <FontAwesomeIcon icon={faPercent} />
                                </span>
                                <span className="small text-secondary fw-semibold">Tỷ lệ phí sàn:</span>
                                <span className={`badge rounded-pill ${currentFeeBadgeClass} px-2 py-1 small fw-bold`}>
                                    {currentFeeLabel}
                                </span>
                                <FontAwesomeIcon
                                    icon={faChevronDown}
                                    className="text-secondary small ms-1"
                                    style={{
                                        fontSize: "0.7rem",
                                        transition: "transform 0.2s",
                                        transform: isFeeDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                                    }}
                                />
                            </button>

                            {/* Dropdown Menu Popup */}
                            {isFeeDropdownOpen && (
                                <div
                                    className="position-absolute end-0 mt-2 bg-white rounded-4 shadow-lg border p-2"
                                    style={{
                                        minWidth: "310px",
                                        zIndex: 1050,
                                        borderColor: "#e2e8f0",
                                    }}
                                >
                                    <div className="px-3 py-2 border-bottom mb-1">
                                        <div className="fw-semibold small text-dark">Cấu hình tỷ lệ phí sàn</div>
                                        <div className="text-secondary" style={{ fontSize: "0.75rem" }}>
                                            Khấu trừ hoa hồng khi giải ngân xưởng
                                        </div>
                                    </div>
                                    <div className="d-flex flex-column gap-1">
                                        {FEE_OPTIONS.map((opt) => {
                                            const isSelected = Math.abs(feeRate - opt.value) < 0.0001;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`w-100 text-start btn btn-sm border-0 d-flex align-items-center justify-content-between p-2 rounded-3 text-decoration-none ${
                                                        isSelected ? "bg-danger-subtle" : ""
                                                    }`}
                                                    style={{
                                                        transition: "background-color 0.15s ease",
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSelected) e.currentTarget.style.backgroundColor = "#f8fafc";
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSelected) e.currentTarget.style.backgroundColor = "transparent";
                                                    }}
                                                    onClick={() => {
                                                        setFeeRate(opt.value);
                                                        setIsFeeDropdownOpen(false);
                                                        setCustomFeeError("");
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span className={`badge rounded-pill ${opt.badgeClass} px-2 py-1 fw-bold`} style={{ minWidth: "44px", textAlign: "center" }}>
                                                            {opt.label}
                                                        </span>
                                                        <div>
                                                            <div className={`small fw-semibold ${isSelected ? "text-danger" : "text-dark"}`}>
                                                                {opt.name}
                                                            </div>
                                                            <div className="text-secondary" style={{ fontSize: "0.72rem" }}>
                                                                {opt.note}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isSelected && (
                                                        <FontAwesomeIcon icon={faCheck} className="text-danger small ms-2" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Nhập tỷ lệ phí sàn tùy chỉnh (< 100%) */}
                                    <div className="border-top mt-2 pt-2 px-2 pb-1">
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <span className="small fw-semibold text-dark" style={{ fontSize: "0.78rem" }}>
                                                Tùy chỉnh tỷ lệ:
                                            </span>
                                            <span className="text-muted" style={{ fontSize: "0.7rem" }}>
                                                0% &le; Tỷ lệ &lt; 100%
                                            </span>
                                        </div>
                                        <div className="input-group input-group-sm">
                                            <input
                                                type="number"
                                                className={`form-control form-control-sm ${customFeeError ? "is-invalid" : ""}`}
                                                placeholder="VD: 7.5 hoặc 15"
                                                min="0"
                                                max="99.99"
                                                step="any"
                                                value={customFeeInput}
                                                onChange={(e) => {
                                                    setCustomFeeInput(e.target.value);
                                                    setCustomFeeError("");
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        handleApplyCustomFee();
                                                    }
                                                }}
                                            />
                                            <span className="input-group-text small bg-light text-secondary fw-semibold">%</span>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-danger px-3 fw-semibold shadow-none"
                                                onClick={handleApplyCustomFee}
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                        {customFeeError && (
                                            <div className="text-danger mt-1" style={{ fontSize: "0.72rem" }}>
                                                {customFeeError}
                                            </div>
                                        )}
                                        {!matchedPreset && (
                                            <div className="d-flex align-items-center gap-1 mt-2 text-danger small" style={{ fontSize: "0.75rem" }}>
                                                <FontAwesomeIcon icon={faCheck} />
                                                <span>Đang áp dụng tùy chỉnh: <strong>{formatFeePercent(feeRate)}</strong></span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nút làm mới */}
                        <button
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm bg-white"
                            onClick={loadData}
                            disabled={loading}
                            title="Làm mới dữ liệu đối soát"
                        >
                            <FontAwesomeIcon icon={faRotate} spin={loading} />
                            <span className="small fw-semibold">{loading ? "Đang đồng bộ..." : "Làm mới"}</span>
                        </button>
                    </div>
                </div>



                {/* 4 Thẻ KPI Tài chính Toàn sàn */}
                <div className="row g-3">
                    {/* Thẻ 1: Tổng tiền hàng hoàn tất */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Tiền hàng hoàn tất (DELIVERED)</span>
                                    <span className="badge rounded-circle p-2 bg-primary-subtle text-primary">
                                        <FontAwesomeIcon icon={faCoins} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-dark mb-1">
                                        {formatVnd(overview?.totalDeliveredGrossSales)}
                                    </h3>
                                    <span className="text-secondary small">
                                        Doanh số thực thu từ các đơn đã giao thành công
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 2: Chi phí sàn thu được */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Chi phí sàn thu được</span>
                                    <span className="badge rounded-circle p-2 bg-danger-subtle text-danger">
                                        <FontAwesomeIcon icon={faPercent} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-danger mb-1">
                                        {formatVnd(overview?.totalPlatformFee)}
                                    </h3>
                                    <span className="text-secondary small">
                                        Thu phí {formatFeePercent(overview?.defaultFeeRate || feeRate)} hoa hồng dịch vụ sàn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 3: Tổng tiền thực tế phải giải ngân */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white" style={{ borderLeft: "4px solid #10b981" }}>
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Thực tế phải giải ngân</span>
                                    <span className="badge rounded-circle p-2 bg-success-subtle text-success">
                                        <FontAwesomeIcon icon={faMoneyBillWave} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-success mb-1">
                                        {formatVnd(overview?.totalNetPayable)}
                                    </h3>
                                    <span className="text-secondary small">
                                        = Tiền hàng trừ đi Chi phí sàn
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Thẻ 4: Tiến độ giải ngân */}
                    <div className="col-12 col-sm-6 col-xl-3">
                        <div className="card border-0 shadow-sm rounded-4 h-100 bg-white">
                            <div className="card-body p-3 p-lg-4 d-flex flex-column justify-content-between">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="text-secondary small fw-semibold text-uppercase">Đã giải ngân / Còn lại</span>
                                    <span className="badge rounded-circle p-2 bg-info-subtle text-info">
                                        <FontAwesomeIcon icon={faHandHoldingDollar} />
                                    </span>
                                </div>
                                <div>
                                    <h3 className="fw-bold text-dark mb-1">
                                        {formatVnd(overview?.totalDisbursed)}
                                    </h3>
                                    <span className="text-danger small fw-semibold">
                                        Còn chờ giải ngân: {formatVnd(overview?.totalPendingDisbursement)} ({overview?.factoriesWithPendingPayout} xưởng)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs điều hướng */}
                <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
                    <div className="card-header bg-white border-bottom p-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
                        {/* Nav buttons */}
                        <div className="nav nav-pills gap-2">
                            <button
                                className={`nav-link rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 ${activeTab === "factories" ? "active bg-danger text-white" : "text-secondary bg-light"}`}
                                onClick={() => setActiveTab("factories")}
                            >
                                <FontAwesomeIcon icon={faBuilding} />
                                Đối Soát Theo Xưởng ({factories.length})
                            </button>
                            <button
                                className={`nav-link rounded-pill px-4 py-2 small fw-bold d-flex align-items-center gap-2 ${activeTab === "history" ? "active bg-danger text-white" : "text-secondary bg-light"}`}
                                onClick={() => setActiveTab("history")}
                            >
                                <FontAwesomeIcon icon={faReceipt} />
                                Lịch Sử Giải Ngân ({history.length})
                            </button>
                        </div>

                        {/* Search input (chỉ hiện ở tab xưởng) */}
                        {activeTab === "factories" && (
                            <div className="input-group input-group-sm rounded-pill bg-light border px-2" style={{ maxWidth: "280px" }}>
                                <span className="input-group-text bg-transparent border-0 text-secondary">
                                    <FontAwesomeIcon icon={faSearch} />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-transparent border-0 small shadow-none"
                                    placeholder="Tìm theo tên xưởng, STK..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="card-body p-0">
                        {/* Tab 1: Danh sách xưởng */}
                        {activeTab === "factories" && (
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: "560px",
                                    overflowY: "auto",
                                    overflowX: "auto",
                                }}
                            >
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: "1120px", fontSize: "0.825rem" }}>
                                    <thead
                                        className="text-secondary text-uppercase fw-semibold position-sticky top-0"
                                        style={{
                                            zIndex: 5,
                                            backgroundColor: "#f8fafc",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        <tr>
                                            <th className="ps-3 text-nowrap" style={{ backgroundColor: "#f8fafc", width: "160px" }}>Xưởng Chế Tác</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc", width: "180px" }}>Tài Khoản Thụ Hưởng</th>
                                            <th className="text-center text-nowrap" style={{ backgroundColor: "#f8fafc", width: "100px" }}>Đơn Hoàn Tất</th>
                                            <th className="text-end text-nowrap" style={{ backgroundColor: "#f8fafc", width: "120px" }}>Tiền Hàng (Gross)</th>
                                            <th className="text-end text-danger text-nowrap" style={{ backgroundColor: "#f8fafc", width: "110px" }}>Phí Sàn ({formatFeePercent(feeRate)})</th>
                                            <th className="text-end text-success text-nowrap" style={{ backgroundColor: "#f8fafc", width: "140px" }}>Thực Tế Phải Giải Ngân</th>
                                            <th className="text-end text-nowrap" style={{ backgroundColor: "#f8fafc", width: "120px" }}>Đã Giải Ngân</th>
                                            <th className="text-end text-danger fw-bold text-nowrap" style={{ backgroundColor: "#f8fafc", width: "125px" }}>Còn Phải Giải Ngân</th>
                                            <th className="text-center text-nowrap" style={{ backgroundColor: "#f8fafc", width: "135px" }}>Trạng Thái</th>
                                            <th className="pe-3 text-center text-nowrap" style={{ backgroundColor: "#f8fafc", width: "165px" }}>Thao Tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-5">
                                                    <FontAwesomeIcon icon={faSpinner} spin className="text-danger fs-3 mb-2" />
                                                    <div className="text-secondary small">Đang tải dữ liệu đối soát...</div>
                                                </td>
                                            </tr>
                                        ) : filteredFactories.length === 0 ? (
                                            <tr>
                                                <td colSpan={10} className="text-center py-5 text-secondary">
                                                    Không tìm thấy xưởng nào phù hợp
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredFactories.map((f) => (
                                                <tr key={f.factoryId}>
                                                    <td className="ps-3 text-nowrap">
                                                        <div className="fw-bold text-dark">{f.factoryName}</div>
                                                        <div className="text-secondary" style={{ fontSize: "11px" }}>{f.shopPhone || "Chưa có SĐT"}</div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold text-dark text-nowrap" style={{ fontSize: "12px" }}>{f.bankName}</div>
                                                        <div className="text-secondary font-monospace text-nowrap" style={{ fontSize: "11px" }}>{f.accountNumber}</div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: "11px", maxWidth: "160px" }}>{f.accountHolder}</div>
                                                    </td>
                                                    <td className="text-center text-nowrap">
                                                        <span className="badge rounded-pill bg-light text-dark border px-2 py-1" style={{ fontSize: "11px" }}>
                                                            {f.deliveredOrdersCount} đơn
                                                        </span>
                                                        {f.pendingOrdersCount > 0 && (
                                                            <div className="text-muted mt-1" style={{ fontSize: "10px" }}>
                                                                (+{f.pendingOrdersCount} đang giao)
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-end fw-semibold text-dark text-nowrap">
                                                        {formatVnd(f.grossSales)}
                                                    </td>
                                                    <td className="text-end text-danger fw-semibold text-nowrap">
                                                        -{formatVnd(f.platformFee)}
                                                    </td>
                                                    <td className="text-end text-success fw-bold text-nowrap">
                                                        {formatVnd(f.netPayable)}
                                                    </td>
                                                    <td className="text-end text-secondary text-nowrap">
                                                        {formatVnd(f.disbursedAmount)}
                                                    </td>
                                                    <td className="text-end text-danger fw-bold text-nowrap">
                                                        {f.remainingAmount > 0 ? formatVnd(f.remainingAmount) : "0 đ"}
                                                    </td>
                                                    <td className="text-center text-nowrap">
                                                        {getStatusBadge(f.status)}
                                                    </td>
                                                    <td className="pe-3 text-center text-nowrap">
                                                        <div className="d-flex justify-content-center align-items-center gap-1">
                                                            <button
                                                                className="btn btn-sm btn-outline-secondary rounded-pill px-2 py-1 text-nowrap"
                                                                style={{ fontSize: "0.78rem" }}
                                                                title="Xem danh sách đơn hoàn tất"
                                                                onClick={() => handleOpenOrdersModal(f)}
                                                                disabled={f.deliveredOrdersCount === 0}
                                                            >
                                                                <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-1" />
                                                                Xem đơn
                                                            </button>

                                                             <button
                                                                className="btn btn-sm btn-danger rounded-pill px-2 py-1 text-nowrap fw-semibold shadow-sm"
                                                                style={{ fontSize: "0.78rem" }}
                                                                onClick={() => handleOpenDisburseModal(f)}
                                                                disabled={f.remainingAmount <= 0}
                                                                title={f.remainingAmount <= 0 ? "Đã giải ngân hết số dư" : "Bấm để thực hiện giải ngân tiền cho xưởng"}
                                                            >
                                                                <FontAwesomeIcon icon={faHandHoldingDollar} className="me-1" />
                                                                Giải ngân
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Tab 2: Lịch sử giải ngân */}
                        {activeTab === "history" && (
                            <div
                                className="table-responsive"
                                style={{
                                    maxHeight: "560px",
                                    overflowY: "auto",
                                    overflowX: "auto",
                                }}
                            >
                                <table className="table table-hover align-middle mb-0" style={{ minWidth: "1100px", fontSize: "0.825rem" }}>
                                    <thead
                                        className="text-secondary text-uppercase fw-semibold position-sticky top-0"
                                        style={{
                                            zIndex: 5,
                                            backgroundColor: "#f8fafc",
                                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                                            fontSize: "0.75rem",
                                        }}
                                    >
                                        <tr>
                                            <th className="ps-3 text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Mã Giao Dịch</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Thời Gian</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Xưởng Thụ Hưởng</th>
                                            <th style={{ backgroundColor: "#f8fafc" }}>Thông Tin Chuyển Khoản</th>
                                            <th className="text-end text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Tiền Hàng Đối Soát</th>
                                            <th className="text-end text-danger text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Phí Sàn Thu</th>
                                            <th className="text-end text-success fw-bold text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Số Tiền Đã Giải Ngân</th>
                                            <th className="text-nowrap" style={{ backgroundColor: "#f8fafc" }}>Người Thực Hiện</th>
                                            <th className="pe-3" style={{ backgroundColor: "#f8fafc" }}>Ghi Chú</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {history.length === 0 ? (
                                            <tr>
                                                <td colSpan={9} className="text-center py-5 text-secondary">
                                                    Chưa có đợt giải ngân nào được thực hiện
                                                </td>
                                            </tr>
                                        ) : (
                                            history.map((h) => (
                                                <tr key={h.id}>
                                                    <td className="ps-3 text-nowrap">
                                                        <span className="font-monospace fw-bold text-dark">{h.transactionCode}</span>
                                                    </td>
                                                    <td className="text-secondary text-nowrap" style={{ fontSize: "11px" }}>
                                                        {h.disbursedAt ? new Date(h.disbursedAt).toLocaleString("vi-VN") : "—"}
                                                    </td>
                                                    <td className="fw-semibold text-dark text-nowrap">
                                                        {h.factoryName}
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold text-nowrap" style={{ fontSize: "12px" }}>{h.bankName}</div>
                                                        <div className="font-monospace text-secondary text-nowrap" style={{ fontSize: "11px" }}>{h.accountNumber}</div>
                                                        <div className="text-muted text-truncate" style={{ fontSize: "11px", maxWidth: "160px" }}>{h.accountHolder}</div>
                                                    </td>
                                                    <td className="text-end text-secondary text-nowrap">
                                                        {formatVnd(h.grossSales)}
                                                    </td>
                                                    <td className="text-end text-danger text-nowrap">
                                                        {formatVnd(h.platformFee)} ({formatFeePercent(h.platformFeeRate)})
                                                    </td>
                                                    <td className="text-end text-success fw-bold text-nowrap">
                                                        {formatVnd(h.amount)}
                                                    </td>
                                                    <td className="text-nowrap">
                                                        <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: "11px" }}>
                                                            {h.disbursedBy}
                                                        </span>
                                                    </td>
                                                    <td className="pe-3 text-secondary" style={{ maxWidth: "200px", fontSize: "12px" }}>
                                                        {h.note || "—"}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Modal Thực hiện Giải ngân */}
            {selectedFactoryForDisburse && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                            <div className="modal-header bg-danger text-white border-0 px-4 py-3">
                                <h5 className="modal-title fw-bold fs-6 d-flex align-items-center gap-2">
                                    <FontAwesomeIcon icon={faHandHoldingDollar} />
                                    Giải Ngân Cho Xưởng: {selectedFactoryForDisburse.factoryName}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedFactoryForDisburse(null)}
                                ></button>
                            </div>

                            <form onSubmit={handleSubmitDisburse}>
                                <div className="modal-body p-4 d-flex flex-column gap-3">
                                    {/* Thẻ tóm tắt số dư */}
                                    <div className="bg-light p-3 rounded-3 border">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-secondary small">Tiền hàng hoàn tất:</span>
                                            <span className="fw-semibold text-dark small">{formatVnd(selectedFactoryForDisburse.grossSales)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-danger small">Chi phí sàn ({formatFeePercent(feeRate)}):</span>
                                            <span className="fw-semibold text-danger small">- {formatVnd(selectedFactoryForDisburse.platformFee)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-success small fw-semibold">Tổng thực tế phải giải ngân:</span>
                                            <span className="fw-bold text-success small">{formatVnd(selectedFactoryForDisburse.netPayable)}</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-secondary small">Đã giải ngân trước đó:</span>
                                            <span className="text-secondary small">{formatVnd(selectedFactoryForDisburse.disbursedAmount)}</span>
                                        </div>
                                        <hr className="my-2" />
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-dark small">Số dư còn lại cần giải ngân:</span>
                                            <span className="fw-bold text-danger fs-6">{formatVnd(selectedFactoryForDisburse.remainingAmount)}</span>
                                        </div>
                                    </div>

                                    {disburseError && (
                                        <div className="alert alert-danger py-2 px-3 small rounded-3 mb-0">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="me-2" />
                                            {disburseError}
                                        </div>
                                    )}

                                    {/* Số tiền muốn giải ngân */}
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-1">
                                            <label className="form-label small fw-semibold text-dark mb-0">
                                                Số tiền giải ngân đợt này (VNĐ) <span className="text-danger">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm p-0 text-decoration-none small text-danger fw-semibold"
                                                onClick={() => setDisburseAmount(selectedFactoryForDisburse.remainingAmount)}
                                            >
                                                Giải ngân toàn bộ
                                            </button>
                                        </div>
                                        <NumericFormat
                                            className="form-control rounded-3 fw-bold text-success fs-5 shadow-none"
                                            value={disburseAmount > 0 ? disburseAmount : ""}
                                            onValueChange={(values) => {
                                                setDisburseAmount(values.floatValue || 0);
                                            }}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            suffix=" đ"
                                            allowNegative={false}
                                            placeholder="0 đ"
                                            required
                                        />
                                        <div className="form-text small text-muted">
                                            Bằng chữ: <em className="text-dark fw-medium">{readVietnameseCurrency(disburseAmount)}</em>
                                        </div>
                                    </div>

                                    {/* Thông tin tài khoản ngân hàng (Cố định theo thông tin xưởng đăng ký) */}
                                    <div className="row g-2">
                                        <div className="col-12">
                                            <div className="d-flex justify-content-between align-items-center mb-1">
                                                <label className="form-label small fw-semibold text-dark mb-0">Ngân hàng thụ hưởng</label>
                                                <span className="badge bg-light text-secondary border fw-normal" style={{ fontSize: "0.72rem" }}>
                                                    Tài khoản cố định của xưởng
                                                </span>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 shadow-none bg-light text-secondary fw-semibold border-secondary-subtle"
                                                value={disburseBankName}
                                                readOnly
                                                tabIndex={-1}
                                                style={{ cursor: "not-allowed" }}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-dark mb-1">Số tài khoản</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 font-monospace shadow-none bg-light text-secondary fw-semibold border-secondary-subtle"
                                                value={disburseAccNumber}
                                                readOnly
                                                tabIndex={-1}
                                                style={{ cursor: "not-allowed" }}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-dark mb-1">Tên chủ tài khoản</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 shadow-none bg-light text-secondary fw-semibold border-secondary-subtle"
                                                value={disburseAccHolder}
                                                readOnly
                                                tabIndex={-1}
                                                style={{ cursor: "not-allowed" }}
                                            />
                                        </div>
                                    </div>

                                    {/* Mã giao dịch & Ghi chú */}
                                    <div className="row g-2">
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-dark mb-1">Mã tham chiếu GD ngân hàng</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 font-monospace shadow-none"
                                                value={disburseTxCode}
                                                onChange={(e) => setDisburseTxCode(e.target.value)}
                                                placeholder="Mã chuyển khoản"
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small fw-semibold text-dark mb-1">Ghi chú đối soát</label>
                                            <input
                                                type="text"
                                                className="form-control form-control-sm rounded-3 shadow-none"
                                                value={disburseNote}
                                                onChange={(e) => setDisburseNote(e.target.value)}
                                                placeholder="Ghi chú đợt thanh toán"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer bg-light border-0 px-4 py-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary rounded-pill px-4 small"
                                        onClick={() => setSelectedFactoryForDisburse(null)}
                                        disabled={submittingDisburse}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-danger rounded-pill px-4 small fw-semibold shadow-sm d-flex align-items-center gap-2"
                                        disabled={submittingDisburse}
                                    >
                                        {submittingDisburse ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faCheckCircle} />}
                                        Xác Nhận Giải Ngân
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Chi Tiết Đơn Hàng Của Xưởng */}
            {selectedFactoryForOrders && (
                <div
                    className="modal fade show d-block"
                    tabIndex={-1}
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }}
                >
                    <div className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable" style={{ maxWidth: "1080px", width: "95%" }}>
                        <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden d-flex flex-column" style={{ minHeight: "580px" }}>
                            <div className="modal-header bg-dark text-white border-0 px-4 py-3 flex-shrink-0">
                                <div>
                                    <h5 className="modal-title fw-bold fs-6 mb-1">
                                        Đơn Hàng Hoàn Tất: {selectedFactoryForOrders.factoryName}
                                    </h5>
                                    <span className="text-secondary small">
                                        Tổng tiền hàng: {formatVnd(selectedFactoryForOrders.grossSales)} • Phí sàn: {formatVnd(selectedFactoryForOrders.platformFee)} • Thực nhận: {formatVnd(selectedFactoryForOrders.netPayable)}
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setSelectedFactoryForOrders(null)}
                                ></button>
                            </div>

                            <div className="modal-body p-4 flex-grow-1" style={{ minHeight: "460px", maxHeight: "68vh", overflowY: "auto" }}>
                                {loadingOrders ? (
                                    <div className="text-center py-5">
                                        <FontAwesomeIcon icon={faSpinner} spin className="text-danger fs-3 mb-2" />
                                        <div className="text-secondary small">Đang tải danh sách đơn hàng...</div>
                                    </div>
                                ) : factoryOrders.length === 0 ? (
                                    <div className="text-center py-5 text-secondary">
                                        Xưởng chưa có đơn hàng nào hoàn tất (DELIVERED)
                                    </div>
                                ) : (
                                    <>
                                        {/* Thanh Tabs Lọc Đơn Hàng Theo Trạng Thái Giải Ngân */}
                                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3 pb-3 border-bottom position-sticky top-0 bg-white" style={{ zIndex: 3, marginTop: "-8px", paddingTop: "4px" }}>
                                            <div className="nav nav-pills gap-2">
                                                <button
                                                    type="button"
                                                    className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                        orderFilterTab === "pending"
                                                            ? "active bg-warning-subtle text-warning-emphasis border border-warning"
                                                            : "bg-light text-secondary border-0"
                                                    }`}
                                                    onClick={() => {
                                                        setOrderFilterTab("pending");
                                                        setOrderPage(1);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faClock} />
                                                    Chưa giải ngân ({pendingOrdersList.length})
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                        orderFilterTab === "settled"
                                                            ? "active bg-success text-white shadow-sm"
                                                            : "bg-light text-secondary border-0"
                                                    }`}
                                                    onClick={() => {
                                                        setOrderFilterTab("settled");
                                                        setOrderPage(1);
                                                    }}
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} />
                                                    Đã giải ngân ({settledOrdersList.length})
                                                </button>

                                                <button
                                                    type="button"
                                                    className={`nav-link rounded-pill px-3 py-1 small fw-bold d-flex align-items-center gap-2 ${
                                                        orderFilterTab === "all"
                                                            ? "active bg-dark text-white shadow-sm"
                                                            : "bg-light text-secondary border-0"
                                                    }`}
                                                    onClick={() => {
                                                        setOrderFilterTab("all");
                                                        setOrderPage(1);
                                                    }}
                                                >
                                                    Tất cả ({factoryOrders.length})
                                                </button>
                                            </div>

                                            {/* Tổng tiền theo tab hiện tại & Nút thu gọn / mở rộng tất cả */}
                                            <div className="d-flex align-items-center gap-2 small">
                                                {displayedOrders.length > 0 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary py-1 px-2 border-0 small text-decoration-none"
                                                        style={{ fontSize: "12px" }}
                                                        onClick={() => {
                                                            if (expandedOrderIds.size === displayedOrders.length) {
                                                                setExpandedOrderIds(new Set());
                                                            } else {
                                                                setExpandedOrderIds(new Set(displayedOrders.map((o) => o.orderId)));
                                                            }
                                                        }}
                                                    >
                                                        <FontAwesomeIcon
                                                            icon={expandedOrderIds.size === displayedOrders.length ? faChevronDown : faChevronRight}
                                                            className="me-1"
                                                        />
                                                        {expandedOrderIds.size === displayedOrders.length ? "Thu gọn tất cả" : "Mở rộng tất cả"}
                                                    </button>
                                                )}

                                                {orderFilterTab === "pending" && (
                                                    <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-3 py-2 fw-bold">
                                                        Cần giải ngân: {formatVnd(totalPendingAmount)}
                                                    </span>
                                                )}
                                                {orderFilterTab === "settled" && (
                                                    <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-3 py-2 fw-bold">
                                                        Đã giải ngân: {formatVnd(totalSettledAmount)}
                                                    </span>
                                                )}
                                                {orderFilterTab === "all" && (
                                                    <span className="badge rounded-pill bg-light text-dark border px-3 py-2 fw-semibold">
                                                        Tổng: {formatVnd(selectedFactoryForOrders.netPayable)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Danh sách đơn hàng */}
                                        {displayedOrders.length === 0 ? (
                                            <div
                                                className="text-center py-5 text-secondary d-flex flex-column justify-content-center align-items-center"
                                                style={{ minHeight: "360px" }}
                                            >
                                                <div className="fs-1 mb-2">🎉</div>
                                                <div className="fw-semibold text-dark fs-6 mb-1">
                                                    {orderFilterTab === "pending"
                                                        ? "Tất cả đơn hàng đã được giải ngân đủ"
                                                        : orderFilterTab === "settled"
                                                        ? "Chưa có đơn hàng nào được giải ngân"
                                                        : "Không có đơn hàng nào"}
                                                </div>
                                                <div className="small text-muted">
                                                    {orderFilterTab === "pending"
                                                        ? "Tuyệt vời! Toàn bộ đơn hàng hoàn tất của xưởng này đều đã được đối soát & giải ngân đủ."
                                                        : "Vui lòng chuyển qua tab khác để xem danh sách đơn hàng đối soát."}
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="d-flex flex-column gap-2">
                                                    {paginatedOrders.map((ord) => {
                                                    const isExpanded = expandedOrderIds.has(ord.orderId);
                                                    return (
                                                        <div
                                                            key={ord.orderId}
                                                            className={`card border rounded-3 shadow-none transition-all ${
                                                                isExpanded ? "p-3" : "py-2 px-3"
                                                            } ${
                                                                ord.isSettled ? "bg-light border-light-subtle" : "bg-white border-warning-subtle"
                                                            }`}
                                                            style={{
                                                                borderLeft: ord.isSettled ? "4px solid #10b981" : "4px solid #f59e0b",
                                                            }}
                                                        >
                                                            {/* Title Row: Click để mở/thu gọn */}
                                                            <div
                                                                className={`d-flex justify-content-between align-items-center ${
                                                                    isExpanded ? "mb-2 pb-2 border-bottom" : ""
                                                                }`}
                                                                style={{ cursor: "pointer", userSelect: "none" }}
                                                                onClick={() => toggleOrderCollapse(ord.orderId)}
                                                                role="button"
                                                                title={isExpanded ? "Bấm để thu gọn" : "Bấm để xem chi tiết sản phẩm và tính phí"}
                                                            >
                                                                <div className="d-flex flex-wrap align-items-center gap-2">
                                                                    <FontAwesomeIcon
                                                                        icon={isExpanded ? faChevronDown : faChevronRight}
                                                                        className="text-secondary"
                                                                        style={{ fontSize: "11px", width: "12px" }}
                                                                    />
                                                                    <span className="fw-bold text-dark">Đơn hàng #{ord.orderId}</span>
                                                                    <span className="badge rounded-pill bg-light text-secondary border px-2 py-0" style={{ fontSize: "11px" }}>
                                                                        {ord.status}
                                                                    </span>

                                                                    {ord.isSettled ? (
                                                                        <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle px-2 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                                                                            <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                                                                            Đã giải ngân
                                                                        </span>
                                                                    ) : (
                                                                        <span className="badge rounded-pill bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2 py-1 fw-semibold" style={{ fontSize: "11px" }}>
                                                                            <FontAwesomeIcon icon={faClock} className="me-1" />
                                                                            Chưa giải ngân
                                                                        </span>
                                                                    )}

                                                                    <span className="text-secondary small">
                                                                        Khách: {ord.recipientName} ({ord.paymentMethod})
                                                                    </span>
                                                                </div>

                                                                <div className="d-flex align-items-center gap-3 text-nowrap flex-shrink-0">
                                                                    {!isExpanded && (
                                                                        <div className="d-none d-sm-flex align-items-center gap-2 small text-nowrap">
                                                                            <span className="text-muted">{ord.items.length} món</span>
                                                                            <span className="text-muted">•</span>
                                                                            <span className="text-success fw-bold">{formatVnd(ord.netAmount)}</span>
                                                                        </div>
                                                                    )}
                                                                    <span className="text-secondary small">
                                                                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("vi-VN") : ""}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Chi tiết đơn hàng khi mở rộng */}
                                                            {isExpanded && (
                                                                <>
                                                                    {/* Danh sách items */}
                                                                    <ul className="list-unstyled mb-2 d-flex flex-column gap-1 small mt-2">
                                                                        {ord.items.map((it, idx) => (
                                                                            <li key={idx} className="d-flex justify-content-between text-secondary">
                                                                                <span>
                                                                                    • {it.productName} {it.mil ? `(${it.mil}ml)` : ""} × <strong>{it.quantity}</strong>
                                                                                </span>
                                                                                <span className="fw-semibold text-dark">
                                                                                    {formatVnd(it.lineTotal)}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>

                                                                    {/* Tính toán đối soát đơn */}
                                                                    <div className="pt-2 border-top d-flex justify-content-between align-items-end flex-wrap gap-2">
                                                                        <div className="text-secondary small">
                                                                            <span className="badge bg-light text-secondary border">Thanh toán: {ord.paymentMethod}</span>
                                                                        </div>
                                                                        <div className="d-flex flex-column gap-1 small" style={{ minWidth: "260px" }}>
                                                                            <div className="d-flex justify-content-between text-secondary">
                                                                                <span>Tổng tiền:</span>
                                                                                <strong className="text-dark">{formatVnd(ord.orderGross)}</strong>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between text-danger">
                                                                                <span>Phí sàn ({formatFeePercent(feeRate)}):</span>
                                                                                <strong className="text-danger">-{formatVnd(ord.platformFee)}</strong>
                                                                            </div>
                                                                            <div className="d-flex justify-content-between align-items-center text-success fw-bold pt-1 border-top">
                                                                                <span>Thực nhận:</span>
                                                                                <span className="fs-6 text-success fw-bold">{formatVnd(ord.netAmount)}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Phân trang modal đơn hàng */}
                                            {displayedOrders.length > 0 && (
                                                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 mt-3 border-top">
                                                    <div className="d-flex align-items-center gap-2 text-secondary small">
                                                        <span>Hiển thị</span>
                                                        <select
                                                            className="form-select form-select-sm"
                                                            style={{ width: "75px" }}
                                                            value={orderPageSize}
                                                            onChange={(e) => {
                                                                setOrderPageSize(Number(e.target.value));
                                                                setOrderPage(1);
                                                            }}
                                                        >
                                                            <option value={10}>10</option>
                                                            <option value={20}>20</option>
                                                            <option value={30}>30</option>
                                                        </select>
                                                        <span>
                                                            / {displayedOrders.length} đơn (Trang {orderPage}/{orderTotalPages})
                                                        </span>
                                                    </div>

                                                    {orderTotalPages > 1 && (
                                                        <nav>
                                                            <ul className="pagination pagination-sm mb-0">
                                                                <li className={`page-item ${orderPage === 1 ? "disabled" : ""}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                                                                    >
                                                                        Trước
                                                                    </button>
                                                                </li>
                                                                {Array.from({ length: orderTotalPages }).map((_, idx) => {
                                                                    const p = idx + 1;
                                                                    if (
                                                                        orderTotalPages <= 7 ||
                                                                        p === 1 ||
                                                                        p === orderTotalPages ||
                                                                        (p >= orderPage - 1 && p <= orderPage + 1)
                                                                    ) {
                                                                        return (
                                                                            <li key={p} className={`page-item ${p === orderPage ? "active" : ""}`}>
                                                                                <button className="page-link" onClick={() => setOrderPage(p)}>
                                                                                    {p}
                                                                                </button>
                                                                            </li>
                                                                        );
                                                                    }
                                                                    if (p === orderPage - 2 || p === orderPage + 2) {
                                                                        return (
                                                                            <li key={p} className="page-item disabled">
                                                                                <span className="page-link">...</span>
                                                                            </li>
                                                                        );
                                                                    }
                                                                    return null;
                                                                })}
                                                                <li className={`page-item ${orderPage === orderTotalPages ? "disabled" : ""}`}>
                                                                    <button
                                                                        className="page-link"
                                                                        onClick={() => setOrderPage((prev) => Math.min(orderTotalPages, prev + 1))}
                                                                    >
                                                                        Sau
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </nav>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </>
                            )}
                        </div>

                            <div className="modal-footer bg-light border-0 px-4 py-2 d-flex justify-content-between align-items-center">
                                <div>
                                    {selectedFactoryForOrders.remainingAmount > 0 && (
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-danger rounded-pill px-3 fw-semibold shadow-sm"
                                            onClick={() => {
                                                const factory = selectedFactoryForOrders;
                                                setSelectedFactoryForOrders(null);
                                                handleOpenDisburseModal(factory);
                                            }}
                                        >
                                            <FontAwesomeIcon icon={faHandHoldingDollar} className="me-1" />
                                            Giải ngân ngay ({formatVnd(selectedFactoryForOrders.remainingAmount)})
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-pill px-4 small"
                                    onClick={() => setSelectedFactoryForOrders(null)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

