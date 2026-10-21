import { Navigate, useSearchParams, Outlet } from "react-router";
import { ROUTES } from "../routes/routes";

export default function RequireVerifyEmail() {
    const [searchParam] = useSearchParams();

    const email = searchParam.get("email");
    const code = searchParam.get("code");

    if (!email || !code) {
        return <Navigate to={ROUTES.HOME} replace />;;
    }


    return <Outlet />
}