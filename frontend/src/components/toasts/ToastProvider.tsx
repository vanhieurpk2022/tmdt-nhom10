import { useCallback, useState, type ReactNode } from "react";
import { Notification, type ToastType } from "./Notification";
import { type ToastState, ToastContext } from "./ToastContext";

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
