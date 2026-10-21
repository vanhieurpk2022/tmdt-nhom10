import { useNavigate } from "react-router";
import { authService } from "../../../api/AuthService";
import { useState } from "react";
import { useAuth } from "../../../api/AuthContext";
import { ROUTES } from "../../../routes/routes";

interface BadgeAccountProps {
    name: string;
    role: string;
    src: string;
}

export function BadgeAccount({ name, role, src }: BadgeAccountProps) {

    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleLogout = async () => {
        setUser(null);
        navigate(ROUTES.HOME, { replace: true });

        try {
            await authService.logout();
        } catch (error) {
            console.error("Đăng xuất thất bại:", error);
        }
    };

    return (
        <>
            <div className="ms-3 mb-2">
                <div className="d-flex align-items-center">
                    <img className="rounded-5 " src={src} width={42} height={42} alt="" />
                    <div className="d-flex flex-column justify-content-start">
                        <span className="text-white text-start ms-3" > {name}</span>
                        <span className="text-uppercase ms-3" style={{ color: "var(--color-primary)" }}> {role} </span>
                    </div>
                </div>
                <button onClick={handleLogout} className="btn w-100 fw-bold mt-3 logout"> Đăng xuất</button>

            </div >
        </>
    );
}