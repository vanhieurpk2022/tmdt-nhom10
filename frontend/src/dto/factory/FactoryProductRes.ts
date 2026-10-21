import type { ProductStatus } from "../../enums/ProductStatus";
import type { ProductType } from "../../enums/ProductType";


export interface FactoryProductStats {
    totalProducts: number;
    forSale: number;
    outOfStock: number;
    totalSold: number;
}

export interface FactoryProductVariantItem {
    id: number;
    productName: string;
    mil: number;
    price: number;
    basePrice?: number | null;
    stockQuantity: number;
    isActive: boolean;
}

export interface FactoryProductMil {
    mil: number | null;
    price: number | null;
    basePrice?: number | null;
    stockQuantity: number | null;
}

export interface EditableVariant {
    id: number;
    mil: number;
    basePrice: number;
    price: number;
    stockQuantity: number;
}

export interface FactoryProductItem {
    id: number;
    name: string;
    stock: number;
    sold: number;
    createdAt: string;
    category: string;
    status?: ProductStatus;
    type?: ProductType;
    thumbnailUrl: string;
}


export interface FactoryProductCreateRequest {
    id: number | null,
    name: string,
    category: string,
    type: ProductType,
    description: string,
    imageUrls: string[]
}

export interface FactoryProductResponse {
    stats: FactoryProductStats;
    products: FactoryProductItem[];
}
