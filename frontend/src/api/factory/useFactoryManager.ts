import type { ProductImage } from "../../models/ProductImage";
import { FactoryServiceManager } from "./FactoryService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";


// Quản lý key tập trung để khỏi gõ sai chuỗi
export const factoryKeys = {
    dashboard: ["factory", "dashboard"] as const,
    products: ["factory", "products"] as const,
    mils: (productId: number) => ["factory", "products", productId, "mils"] as const,
};

/* ===================== ĐỌC (useQuery) ===================== */

export const useUserDashBoard = () =>
    useQuery({
        queryKey: factoryKeys.dashboard,
        queryFn: FactoryServiceManager.getUserDashBoard,
    });

export const useFactoryProducts = () =>
    useQuery({
        queryKey: factoryKeys.products,
        queryFn: FactoryServiceManager.getProducts,
    });

export const useProductMils = (productId: number) =>
    useQuery({
        queryKey: factoryKeys.mils(productId), // khác productId thì cache riêng
        queryFn: () => FactoryServiceManager.getProductMils(productId),
        enabled: !!productId,                  // chỉ chạy khi có productId
    });

/* ===================== GHI SẢN PHẨM (useMutation) ===================== */

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Parameters<typeof FactoryServiceManager.createProduct>[0]) =>
            FactoryServiceManager.createProduct(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: factoryKeys.products }),
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Parameters<typeof FactoryServiceManager.updateProduct>[1] }) =>
            FactoryServiceManager.updateProduct(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: factoryKeys.products }),
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => FactoryServiceManager.deleteProduct(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: factoryKeys.products }),
    });
};

export const useToggleStatusProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            FactoryServiceManager.toggleStatusProduct(id, status),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: factoryKeys.products }),
    });
};

/* ===================== GHI BIẾN THỂ / MIL (useMutation) ===================== */

export const useCreateProductMil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data: Parameters<typeof FactoryServiceManager.createProductMil>[1] }) =>
            FactoryServiceManager.createProductMil(productId, data),
        onSuccess: (_res, vars) =>
            queryClient.invalidateQueries({ queryKey: factoryKeys.mils(vars.productId) }),
    });
};

export const useUpdateProductMil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, milId, data }: { productId: number; milId: number; data: Parameters<typeof FactoryServiceManager.updateProductMil>[2] }) =>
            FactoryServiceManager.updateProductMil(productId, milId, data),
        onSuccess: (_res, vars) =>
            queryClient.invalidateQueries({ queryKey: factoryKeys.mils(vars.productId) }),
    });
};

export const useDeleteProductMil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, milId }: { productId: number; milId: number }) =>
            FactoryServiceManager.deleteProductMil(productId, milId),
        onSuccess: (_res, vars) =>
            queryClient.invalidateQueries({ queryKey: factoryKeys.mils(vars.productId) }),
    });
};

export const useToggleStatusProductMil = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, milId, isActive }: { productId: number; milId: number; isActive: boolean }) =>
            FactoryServiceManager.toggleStatusProductMil(productId, milId, isActive),
        onSuccess: (_res, vars) =>
            queryClient.invalidateQueries({ queryKey: factoryKeys.mils(vars.productId) }),
    });
};

