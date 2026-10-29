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

export interface CustomProductComponent {
    productId: number;
    productName: string;
    percentage: number;
    note?: string;
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
    imageUrl?: string;
    price?: number;
    description?: string;
    components?: CustomProductComponent[];
}


export interface FactoryProductCreateRequest {
    id: number | null,
    name: string,
    category: string,
    type: ProductType,
    description: string,
    imageUrls: string[],
    components?: CustomProductComponent[]
}

export interface FactoryProductResponse {
    stats: FactoryProductStats;
    products: FactoryProductItem[];
}

/** Response trả về từ GET /manager/products/{id} */
export interface FactoryProductEditRes {
    id: number | null;
    name: string;
    category: string;
    type: ProductType;
    status?: ProductStatus;
    description: string;
}

export interface FactoryCustomRecipeItem {
    id?: number;
    productId: number;
    productName?: string;
    percentage: number;
    volumeMl?: number;
    note?: string;
}

export interface FactoryCustomRecipeDto {
    productCustomId: number | null;
    bottleType?: string | null;
    labelDesign?: string | null;
    notes: string;
    items: FactoryCustomRecipeItem[];
}

export interface FactoryCustomRecipeSaveRequest {
    bottleType?: string;
    labelDesign?: string;
    notes: string;
    items: {
        productId: number;
        percentage: number;
        volumeMl?: number;
        note?: string;
    }[];
}
