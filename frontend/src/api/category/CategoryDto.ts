import type { Category } from "../../models/Category";
import api from "../api";

interface CategoryResponse {
    _embedded: {
        categories: Category[];
    };
}

export const CategoryService = {
    getCategory: async () => {
        const res = await api.get<CategoryResponse>("/v1/category");
        return res.data;
    }
}