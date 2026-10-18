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
    mil: number;
    price: number;
    basePrice?: number | null;
    stockQuantity: number;
    isActive: boolean;
    imageUrl?: string;
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
}

export interface FactoryProductCreateRequest {
    name: string,
    category: string,
    type: ProductType,
    status: ProductStatus,
    description: string,
    imageUrls: string[]
}

export interface FactoryProductResponse {
    stats: FactoryProductStats;
    products: FactoryProductItem[];
}
