// components/admin/dashboard/orderTable.ts
import {
    tableFeatures, createSortedRowModel, createFilteredRowModel, createPaginatedRowModel,
    rowSortingFeature, rowPaginationFeature, columnFilteringFeature, globalFilteringFeature,
    filterFn_includesString, sortFn_alphanumeric, sortFn_basic,
    type Table,
    type RowData,
    useTable,
} from "@tanstack/react-table";

export const features = tableFeatures({
    rowSortingFeature,
    rowPaginationFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    paginatedRowModel: createPaginatedRowModel(),
    sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
    filterFns: { includesString: filterFn_includesString },
});

export type AppTable<TData extends RowData> =
    ReturnType<typeof useTable<typeof features, TData>>;