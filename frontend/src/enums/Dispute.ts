import type { User } from "../models/User";
import type { Factory } from "../models/Factory";

export const DisputeStatus = {
    PENDING: "PENDING",
    PROCESSING: "PROCESSING",
    RESOLVED: "RESOLVED",
    CLOSED: "CLOSED",
} as const


export const DisputeType = {
    PRODUCT_QUALITY: "PRODUCT_QUALITY",
    WRONG_PRODUCT: "WRONG_PRODUCT",
    DELIVERY: "DELIVERY",
    REFUND: "REFUND",
    OTHER: "OTHER",
} as const

export interface Dispute {
    id: number;
    orderCode: string;
    user: User;
    factory: Factory;
    type: DisputeType;
    title: string;
    description: string;
    evidenceImages: string[];
    requestedResolution: string;
    status: DisputeStatus;
    createdAt: string;
    resolvedAt?: string;
    adminNote?: string;
}

export type DisputeStatus = (typeof DisputeStatus)[keyof typeof DisputeStatus];
export type DisputeType = (typeof DisputeType)[keyof typeof DisputeType];