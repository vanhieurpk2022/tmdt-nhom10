export const VourcherStatusAdmin = {
    RUNNING: "RUNNING",
    SCHEDULED: "SCHEDULED",
    PAUSED: "PAUSED",
    EXPIRED: "EXPIRED",
} as const;


export type VourcherStatusAdmin = (typeof VourcherStatusAdmin)[keyof typeof VourcherStatusAdmin];