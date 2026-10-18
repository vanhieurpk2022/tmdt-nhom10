import {
    faArrowLeft,
    faPlus
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { ProductImage } from "../../../../models/ProductImage";
import { useCallback, useEffect, useState } from "react";
import { FactoryServiceManager, type HalProductImages } from "../../../../api/factory/FactoryService";
import type { FactoryProductVariantItem } from "../../../../dto/factory/FactoryProductRes";

interface VariantHeaderProps {
    productId: number;
}

export function VariantHeader({ productId }: VariantHeaderProps) {
    const [images, setImages] = useState<ProductImage[]>([]);


    useEffect(() => {
        const getImage = async () => {
            try {
                const res = await FactoryServiceManager.getProductImages(productId);

                const images = res._embedded.productImages;
                setImages(images);
            } catch (error) {
                console.log("Lỗi không tải được ảnh", error);
            }
        };

    }, [productId]);

    const setThumbnail = (id: number) => {

    }

    return (
        <div className="mb-4">

            {/* ================= HEADER ================= */}
            <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">

                {/* ================= LEFT ================= */}
                <div className="d-flex align-items-center gap-3">

                    {/* Back */}
                    <button
                        type="button"
                        className="btn btn-outline-secondary d-flex align-items-center gap-2 px-3 py-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} />

                        <span>
                            Quay lại
                        </span>
                    </button>

                    {/* Title */}
                    <div>

                        {/* Breadcrumb */}
                        <div className="small text-secondary mb-1">
                            <span>
                                Sản phẩm
                            </span>

                            <span className="mx-2">
                                /
                            </span>

                            <span className="text-danger">
                                Biến thể
                            </span>
                        </div>

                        {/* Heading */}
                        <div className="d-flex align-items-center gap-2">

                            <h2 className="fw-bold mb-0">
                                Quản lý biến thể sản phẩm
                            </h2>

                            <span className="badge text-bg-light border text-dark">
                                #{productId}
                            </span>

                        </div>
                    </div>
                </div>

                {/* ================= RIGHT ================= */}
                <button
                    type="button"
                    className="btn btn-danger fw-semibold d-flex align-items-center gap-2 px-4 py-2"
                >
                    <FontAwesomeIcon icon={faPlus} />

                    <span>
                        Thêm biến thể mới
                    </span>
                </button>
            </div>


            {/* ================= PRODUCT IMAGES ================= */}
            <div className="card border shadow-sm">

                <div className="card-header bg-white py-3">
                    <div className="d-flex justify-content-between align-items-center">

                        <div>
                            <h5 className="fw-bold mb-1">
                                Hình ảnh sản phẩm
                            </h5>

                            <div className="small text-secondary">
                                Quản lý hình ảnh và thumbnail của sản phẩm
                            </div>
                        </div>

                        <span className="badge text-bg-light border text-dark">
                            {images.length} ảnh
                        </span>

                    </div>
                </div>


                <div className="card-body">

                    {images.length === 0 ? (

                        <div className="text-center py-5">

                            <div className="text-secondary mb-2">
                                Sản phẩm chưa có ảnh.
                            </div>

                            <button
                                type="button"
                                className="btn btn-outline-danger btn-sm"
                            >
                                Thêm ảnh
                            </button>

                        </div>

                    ) : (

                        <div className="row g-3">

                            {images.map((image, index) => {

                                const isThumbnail = image.isThumbnail;

                                return (
                                    <div
                                        key={image.id ?? index}
                                        className="col-12"
                                    >

                                        <div className="card border">

                                            <div className="card-body">

                                                <div className="d-flex align-items-center gap-3">

                                                    {/* ================= IMAGE ================= */}
                                                    <div
                                                        className="position-relative flex-shrink-0"
                                                        style={{
                                                            width: 120,
                                                            height: 100,
                                                        }}
                                                    >

                                                        <img
                                                            src={image.imageUrl}
                                                            alt={`Ảnh sản phẩm ${index + 1}`}
                                                            className="w-100 h-100 rounded-3 border"
                                                            style={{
                                                                objectFit: "cover",
                                                            }}
                                                        />

                                                        {isThumbnail && (
                                                            <span className="position-absolute top-0 start-0 m-2 badge text-bg-danger">
                                                                Thumbnail
                                                            </span>
                                                        )}

                                                    </div>


                                                    {/* ================= INFO ================= */}
                                                    <div className="flex-grow-1">

                                                        <div className="fw-semibold">
                                                            Ảnh sản phẩm {index + 1}
                                                        </div>

                                                        <div className="small text-secondary mt-1">
                                                            ID: #{image.id}
                                                        </div>

                                                        {image.uploadedAt && (
                                                            <div className="small text-secondary">
                                                                Đã tải lên:{" "}
                                                                {new Date(
                                                                    image.uploadedAt
                                                                ).toLocaleDateString(
                                                                    "vi-VN"
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="mt-3">

                                                            <button
                                                                type="button"
                                                                className={`btn btn-sm ${isThumbnail
                                                                    ? "btn-danger"
                                                                    : "btn-outline-danger"
                                                                    }`}
                                                                disabled={isThumbnail}
                                                                onClick={() => {
                                                                    if (
                                                                        image.id !==
                                                                        undefined
                                                                    ) {
                                                                        setThumbnail(
                                                                            image.id
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {isThumbnail
                                                                    ? "Đang là thumbnail"
                                                                    : "Đặt làm thumbnail"}
                                                            </button>

                                                        </div>

                                                    </div>


                                                    {/* ================= DELETE ================= */}
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-secondary align-self-start"
                                                    >
                                                        ×
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>
                    )}

                </div>
            </div>

        </div>
    );
}