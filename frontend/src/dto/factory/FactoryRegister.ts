import type { FactoryStatus } from "../../enums/FactoryStatus";

export interface FactoryRegisterResponse {
    id?: number;
    name?: string;
    address?: string;
    description?: string;
    factoryStatus?: FactoryStatus;
    avatarUrl?: string;
    identity?: string;
    licenseUrl?: string;
    originInvoiceUrl?: string;
    tcssDocUrl?: string;
}