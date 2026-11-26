import { useEffect, useState } from "react";
import { authService } from "./AuthService";
import { type UserResponse, AuthContext } from "./AuthContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<UserResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const loadUser = async () => {
            try {
                const res = await authService.getCurrentUser();

                if (cancelled) return;

                if (res?.status === 200) {
                    setUser(res.data);
                } else {
                    setUser(null);
                }
            } catch {
                if (!cancelled) {
                    setUser(null);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadUser();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        const onSessionExpired = () => {
            setUser(null);
        };
        window.addEventListener("auth:session-expired", onSessionExpired);
        return () => window.removeEventListener("auth:session-expired", onSessionExpired);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                setUser,
                setLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
