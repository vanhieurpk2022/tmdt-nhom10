import { faBoxOpen, faCircleCheck, faCirclePlus, faCircleXmark, faDownload, faTag } from "@fortawesome/free-solid-svg-icons";
import StatCard from "../dashboard/StartCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FactoryProductCreateRequest, FactoryProductStats } from "../../../dto/factory/FactoryProductRes";
import { useCallback, useState } from "react";
import { ModalApprove } from "../dashboard/ModalApprove";
import AddProductModal from "./AddProductModal";

interface ProductHeaderProps {
    stats: FactoryProductStats;
    onProduct: () => void;
}

export function ProductHeader({ stats, onProduct }: ProductHeaderProps) {
    const STAT_CARDS = (stats: FactoryProductStats) => [
        { label: "TỔNG SẢN PHẨM", value: stats.totalProducts, icon: faBoxOpen, tone: "danger", note: "Tất cả sản phẩm" },
        { label: "ĐANG BÁN", value: stats.forSale, icon: faCircleCheck, tone: "success", note: "Sản phẩm hoạt động" },
        { label: "HẾT HÀNG", value: stats.outOfStock, icon: faCircleXmark, tone: "warning", note: "Cần nhập thêm hàng" },
        { label: "TỔNG ĐÃ BÁN", value: stats.totalSold, icon: faTag, tone: "info", note: "Tổng sản phẩm đã bán" },
    ] as const;
    return <>
        {/* Header */}
        {/* Tiêu đề + hành động */}
        <header className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
                <h2 className="fw-bold text-dark mb-1">Sản phẩm của gian hàng</h2>
                <p className="text-secondary mb-0">
                    Quản lý sản phẩm đang bán trên sàn, theo dõi tồn kho và doanh số.
                </p>
            </div>

            <div className="d-flex gap-2">
                <button type="button" className="btn btn-light border fw-semibold">
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Xuất danh sách
                </button>
                <button type="button" onClick={onProduct} className="btn btn-danger fw-semibold">
                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                    Thêm sản phẩm
                </button>
            </div>
        </header>

        {/* Thống kê */}
        <section className="row g-3">
            {STAT_CARDS(stats).map(card => (
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


    </>
}