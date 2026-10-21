import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "./AuthService";

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: UserResponse;
}

export interface UserResponse {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    role: string[]
}

interface AuthContextType {
    user: UserResponse | null;
    loading: boolean;
    setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

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

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }

    return context;
}