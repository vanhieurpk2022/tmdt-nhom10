import { ROUTES } from "../routes/routes";
import { useAuth } from "./AuthContext";
import { Navigate, useLocation, Outlet } from "react-router";

interface ProtectedRouteProps {
    children?: React.ReactNode;
    requiredRole?: string | string[];
    redirectPath?: string;
}

export default function ProtectedRoute({ children, requiredRole, redirectPath }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return null;

    if (!user) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    if (requiredRole) {
        const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        const userRoles = Array.isArray(user.role) ? user.role : (user.role ? [user.role] : []);
        const hasPermission = required.some(req => {
            const cleanReq = req.replace(/^ROLE_/, "").toUpperCase();
            return userRoles.some(r => r.replace(/^ROLE_/, "").toUpperCase() === cleanReq);
        });

        if (!hasPermission) {
            return <Navigate to={redirectPath || ROUTES.HOME} replace />;
        }
    }

    return children ? <>{children}</> : <Outlet />;
}

export function AdminProtectedRoute({ children }: { children?: React.ReactNode }) {
    return <ProtectedRoute requiredRole="ADMIN">{children}</ProtectedRoute>;
}
