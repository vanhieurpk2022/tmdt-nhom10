import { Navigate } from "react-router";
import { ROUTES } from "../routes/routes";

export default function AdminOrderDispatchPage() {
    return <Navigate to={ROUTES.ADMIN_ORDER} replace />;
}
