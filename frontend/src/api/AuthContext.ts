import { createContext, useContext } from "react";


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

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth phải được sử dụng bên trong AuthProvider");
    }

    return context;
}