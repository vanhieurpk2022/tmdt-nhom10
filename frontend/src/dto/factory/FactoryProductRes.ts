

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
    description?: string;
}

export interface FactoryProductItem {
    id: number;
    name: string;
    stock: number;
    sold: number;
    createdAt: string;
    category: string;
    price?: number;
    status?: "ACTIVE" | "INACTIVE" | string;
    type?: string;
    description?: string;
    imageUrl?: string;
    items?: FactoryProductVariantItem[];
}

export interface FactoryProductResponse {
    stats: FactoryProductStats;
    products: FactoryProductItem[];
}