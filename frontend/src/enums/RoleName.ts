export const Role = {
    USER: "USER",
    ADMIN: "ADMIN",
    STAFF: "STAFF",
    FACTORY:"FACTORY"
} as const;

export type Role = (typeof Role)[keyof typeof Role]; // "USER" | "ADMIN" | "STAFF"