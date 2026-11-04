import {
    faBoxOpen,
    faCircleCheck,
    faCircleXmark,
    faTag,
} from "@fortawesome/free-solid-svg-icons";
import StatCard from "../dashboard/StartCard";
import type { FactoryProductStats } from "../../../dto/factory/FactoryProductRes";

interface ProductHeaderProps {
    stats: FactoryProductStats;
    onProduct?: (type?: any) => void;
    onExportCsv?: () => void;
}

export function ProductHeader({ stats }: ProductHeaderProps) {
    const STAT_CARDS = (stats: FactoryProductStats) => [
        { label: "TỔNG SẢN PHẨM", value: stats.totalProducts, icon: faBoxOpen, tone: "danger", note: "Tất cả sản phẩm gian hàng" },
        { label: "ĐANG KINH DOANH", value: stats.forSale, icon: faCircleCheck, tone: "success", note: "Sản phẩm đang mở bán" },
        { label: "HẾT HÀNG / TỒN THẤP", value: stats.outOfStock, icon: faCircleXmark, tone: "warning", note: "Cần chiết rót / nhập kho" },
        { label: "TỔNG ĐÃ BÁN", value: stats.totalSold, icon: faTag, tone: "info", note: "Sản phẩm đã xuất bán" },
    ] as const;

    return (
        <div className="d-flex flex-column gap-4">
            {/* Tiêu đề trang */}
            <header className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div>
                    <h2 className="fw-bold text-dark mb-1">Quản lý Sản phẩm Gian hàng</h2>
                    <p className="text-secondary mb-0">
                        Phân loại rõ sản phẩm tiêu chuẩn, sản phẩm phối hương (Custom) và nhãn chai mặc định.
                    </p>
                </div>
            </header>

            {/* Thống kê */}
            <section className="row g-3">
                {STAT_CARDS(stats).map((card) => (
                    <div key={card.label} className="col-12 col-sm-6 col-xl-3">
                        <StatCard
                            label={card.label}
                            value={String(card.value)}
                            icon={card.icon}
                            tone={card.tone}
                            note={card.note}
                        />
                    </div>
                ))}
            </section>
        </div>
    );
}
export default ProductHeader;
