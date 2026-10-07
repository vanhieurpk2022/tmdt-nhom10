import { createContext, useContext, useState } from "react";

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
}

interface AuthContextType {
    user: UserResponse | null;
    isAuthenticated: boolean;
    setUser: React.Dispatch<React.SetStateAction<UserResponse | null>>;
    setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

    const [user, setUser] = useState<UserResponse | null>(null);

    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                setUser,
                setIsAuthenticated
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