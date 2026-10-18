import {
    faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FactoryServiceManager } from "../../../../api/factory/FactoryService";
import { useEffect, useState } from "react";
import type { FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";

interface VariantTableProps {
    productId: number;
}
const VariantTable = ({ productId }: VariantTableProps) => {
    const [variants, setVariant] = useState<FactoryProductVariantItem[]>([]);

    useEffect(() => {
        const getVariant = async () => {
            try {
                const res = await FactoryServiceManager.getProductMils(productId);
                setVariant(res.data);

            } catch (error) {
                console.log("Lỗi không tải được ảnh", error);
            }
        };
        getVariant();
    }, [productId])
    return (
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden">

            <div className="table-responsive">

                <table className="table table-hover align-middle mb-0">

                    {/* ================= HEADER ================= */}
                    <thead className="table-light">

                        <tr>
                            <th className="px-3 py-3">
                                Mã
                            </th>

                            <th className="py-3">
                                Ảnh
                            </th>

                            <th className="py-3">
                                Biến thể
                            </th>

                            <th className="py-3">
                                Dung tích
                            </th>

                            <th className="py-3">
                                Giá bán
                            </th>

                            <th className="py-3">
                                Giá niêm yết
                            </th>

                            <th className="py-3">
                                Tồn kho
                            </th>

                            <th className="py-3">
                                Trạng thái
                            </th>

                            <th className="py-3 text-center">
                                Hành động
                            </th>
                        </tr>

                    </thead>


                    {/* ================= BODY ================= */}
                    <tbody>

                        {variants.length === 0 ? (

                            <tr>

                                <td
                                    colSpan={9}
                                    className="text-center py-5"
                                >

                                    <div className="d-flex flex-column align-items-center justify-content-center">

                                        {/* Icon */}
                                        <div className="text-secondary opacity-50 mb-3">
                                            <FontAwesomeIcon
                                                icon={faBoxOpen}
                                                className="fs-1"
                                            />
                                        </div>

                                        {/* Message */}
                                        <div className="text-secondary">
                                            Chưa có biến thể nào.
                                            Hãy bấm
                                            <span className="fw-semibold mx-1">
                                                'Thêm biến thể mới'
                                            </span>
                                            để tạo!
                                        </div>

                                    </div>

                                </td>

                            </tr>

                        ) : (

                            variants.map((variant) => (

                                <tr key={variant.id}>

                                    <td>
                                        #{variant.id}
                                    </td>

                                    <td>
                                        <img
                                            src={variant.image}
                                            alt={variant.name}
                                            className="rounded"
                                            width="50"
                                            height="50"
                                        />
                                    </td>

                                    <td>
                                        {variant.name}
                                    </td>

                                    <td>
                                        {variant.volume} ml
                                    </td>

                                    <td>
                                        {variant.price}
                                    </td>

                                    <td>
                                        {variant.originalPrice}
                                    </td>

                                    <td>
                                        {variant.stock}
                                    </td>

                                    <td>
                                        <span className="badge text-bg-success">
                                            Đang bán
                                        </span>
                                    </td>

                                    <td className="text-center">
                                        ...
                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
};

export default VariantTable;