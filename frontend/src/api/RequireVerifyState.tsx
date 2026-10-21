// RequireVerifyState.tsx
import { Navigate, Outlet, useLocation } from "react-router";
import { ROUTES } from "../routes/routes";

export default function RequireVerifyState() {
    const location = useLocation();
    const email = location.state?.email;
    const source = sessionStorage.getItem("pendingVerifySource");

    if (!email) {
        if (source === "register") {
            return <Navigate to={ROUTES.REGISTER} replace />;
        }
        return <Navigate to={ROUTES.LOGIN} replace />; // mặc định
    }

    return <Outlet />;
}