import { useState } from "react";
import type { ReactNode } from "react";
import { STORAGE_KEY, AdminSidebarContext } from "./AdminSidebarContext";

export function AdminSidebarProvider({ children }: { children: ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
        try {
            return localStorage.getItem(STORAGE_KEY) === "true";
        } catch {
            return false;
        }
    });

    const toggleSidebar = () => {
        setIsCollapsed((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(STORAGE_KEY, String(next));
                window.dispatchEvent(new Event("admin-sidebar-toggle"));
            } catch {
                /* ignore */
            }
            return next;
        });
    };

    const handleSetCollapsed = (val: boolean) => {
        setIsCollapsed(val);
        try {
            localStorage.setItem(STORAGE_KEY, String(val));
            window.dispatchEvent(new Event("admin-sidebar-toggle"));
        } catch {
            /* ignore */
        }
    };

    return (
        <AdminSidebarContext.Provider value={{ isCollapsed, toggleSidebar, setIsCollapsed: handleSetCollapsed }}>
            {children}
        </AdminSidebarContext.Provider>
    );
}
