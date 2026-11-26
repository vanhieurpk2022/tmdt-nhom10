import { createContext, useContext, useState, useEffect } from "react";


interface AdminSidebarContextType {
    isCollapsed: boolean;
    toggleSidebar: () => void;
    setIsCollapsed: (collapsed: boolean) => void;
}

export const STORAGE_KEY = "admin_sidebar_collapsed";

export const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function useAdminSidebar() {
    const context = useContext(AdminSidebarContext);
    const [localCollapsed, setLocalCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });

    useEffect(() => {
        const handleSync = () => {
            try {
                setLocalCollapsed(localStorage.getItem(STORAGE_KEY) === "true");
            } catch {
                /* ignore */
            }
        };
        window.addEventListener("admin-sidebar-toggle", handleSync);
        return () => window.removeEventListener("admin-sidebar-toggle", handleSync);
    }, []);

    if (context) {
        return context;
    }

    return {
        isCollapsed: localCollapsed,
        toggleSidebar: () => {
            const next = !localCollapsed;
            setLocalCollapsed(next);
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
                window.dispatchEvent(new Event("admin-sidebar-toggle"));
            } catch {
                /* ignore */
            }
        },
        setIsCollapsed: (val: boolean) => {
            setLocalCollapsed(val);
            try {
                localStorage.setItem(STORAGE_KEY, String(val));
                window.dispatchEvent(new Event("admin-sidebar-toggle"));
            } catch {
                /* ignore */
            }
        },
    };
}
