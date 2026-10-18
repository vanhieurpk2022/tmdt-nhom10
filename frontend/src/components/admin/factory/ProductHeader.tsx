import { faBoxOpen, faCircleCheck, faCirclePlus, faCircleXmark, faDownload, faTag } from "@fortawesome/free-solid-svg-icons";
import StatCard from "../dashboard/StartCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { FactoryProductStats } from "../../../dto/factory/FactoryProductRes";
import { useCallback, useState } from "react";
import { ModalApprove } from "../dashboard/ModalApprove";
import AddProductModal from "./AddProductModal";

interface ProductHeaderProps {
    stats: FactoryProductStats;
    onReload: () => void;
}

export function ProductHeader({ stats, onReload }: ProductHeaderProps) {
    const [stateModal, setStateModal] = useState(false);
    const handleCloseModal = useCallback(() => setStateModal(false), []);

    return <>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
            <div>
                <div className="text-danger fw-semibold small mb-2">QUẢN LÝ SẢN PHẨM</div>
                <h2 className="fw-bold text-dark mb-2">Sản phẩm của gian hàng</h2>
                <p className="text-secondary mb-0">
                    Quản lý danh sách sản phẩm đang bán trên sàn, theo dõi tồn kho và doanh số.
                </p>
            </div>

            <div className="d-flex gap-2">
                <button type="button" className="btn btn-light border fw-semibold">
                    <FontAwesomeIcon icon={faDownload} className="me-2" />
                    Xuất danh sách
                </button>
                <button type="button" onClick={() => setStateModal(true)} className="btn btn-danger fw-semibold">
                    <FontAwesomeIcon icon={faCirclePlus} className="me-2" />
                    Thêm sản phẩm
                </button>
            </div>
        </div>

        <section className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
                <StatCard
                    label="TỔNG SẢN PHẨM"
                    value={String(stats.totalProducts)}
                    icon={faBoxOpen}
                    tone="danger"
                    note="Tất cả sản phẩm"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-3">
                <StatCard
                    label="ĐANG BÁN"
                    value={String(stats.forSale)}
                    icon={faCircleCheck}
                    tone="success"
                    note="Sản phẩm hoạt động"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-3">
                <StatCard
                    label="HẾT HÀNG"
                    value={String(stats.outOfStock)}
                    icon={faCircleXmark}
                    tone="warning"
                    note="Cần nhập thêm hàng"
                />
            </div>

            <div className="col-12 col-md-6 col-xl-3">
                <StatCard
                    label="TỔNG ĐÃ BÁN"
                    value={String(stats.totalSold)}
                    icon={faTag}
                    tone="info"
                    note="Tổng sản phẩm đã bán"
                />
            </div>

        </section>

        <AddProductModal show={stateModal} onClose={handleCloseModal} onSuccess={onReload} />
    </>
}