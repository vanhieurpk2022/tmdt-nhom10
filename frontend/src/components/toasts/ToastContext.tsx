import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Notification, type ToastType } from "./Notification";

interface ToastState {
    show: boolean;
    title: string;
    content: string;
    type: ToastType;
}



interface ToastContextValue {
    showToast: (title: string, content: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastState>({
        show: false,
        title: "",
        content: "",
        type: "success",
    });

    const showToast = useCallback(
        (title: string, content: string, type: ToastType = "success") => {
            setToast({ show: true, title, content, type });
        },
        []
    );

    const hideToast = () => setToast((prev) => ({ ...prev, show: false }));

    return (
        <ToastContext.Provider value={{ showToast }
        }>
            {children}
            < Notification {...toast} onClose={hideToast} />
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext phải được dùng bên trong ToastProvider");
    }
    return context;
}