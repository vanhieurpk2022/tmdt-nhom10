import { LoginForm } from '../components/layout/login/LoginForm';
import LoginSideBar from '../components/layout/login/LoginSideBar';

export default function LoginPage() {
    return (
        <div className="login-page d-flex align-items-center justify-content-center bg-light" style={{ minHeight: 'calc(100vh - 100px)' }}>
            <div className="container py-5">
                <div className="row g-0 rounded-4 overflow-hidden shadow-lg login-container bg-white mx-auto" style={{ maxWidth: '1100px' }}>
                    <LoginSideBar />
                    <LoginForm />
                </div>

                <div className="text-center mt-4">
                    <p className="text-secondary mx-auto" style={{ fontSize: '12px', maxWidth: '700px' }}>
                        Oilia là nền tảng trung gian giúp khách hàng tiếp cận sản phẩm tinh dầu từ nhiều xưởng cung cấp trong một hệ thống thống nhất.
                    </p>
                </div>
            </div>
        </div>
    );
}
