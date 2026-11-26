import { createContext, useContext } from "react";
import { type ToastType } from "./Notification";


export interface ToastState {
    show: boolean;
    title: string;
    content: string;
    type: ToastType;
}



interface ToastContextValue {
    showToast: (title: string, content: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

export function useToastContext() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext phải được dùng bên trong ToastProvider");
    }
    return context;
}