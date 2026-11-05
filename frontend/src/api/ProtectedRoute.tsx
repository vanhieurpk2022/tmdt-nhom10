import { ROUTES } from "../routes/routes";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation } from "react-router";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (requiredRole && !user.role.includes(requiredRole)) {
        return <Navigate to={ROUTES.HOME} replace />;
    }

    return <>{children}</>;
}
