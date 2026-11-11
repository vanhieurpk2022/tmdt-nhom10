import ProtectedRoute from "../ProtectedRoute";

interface FactoryProtectedRouteProps {
    children?: React.ReactNode;
}

export default function FactoryProtectedRoute({ children }: FactoryProtectedRouteProps) {
    return <ProtectedRoute requiredRole={["FACTORY", "STAFF"]}>{children}</ProtectedRoute>;
}

