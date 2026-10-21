import React, { useEffect, useState } from 'react';

interface ToastData {
    message: string;
}

const ToastNotification: React.FC = () => {
    const [toastData, setToastData] = useState<ToastData | null>(null);
    const [show, setShow] = useState<boolean>(false); // Dùng state để quản lý ẩn/hiện

    useEffect(() => {
        const handleSessionExpired = (event: Event) => {
            const customEvent = event as CustomEvent<ToastData>;
            setToastData(customEvent.detail);
            setShow(true); // Mở toast lên

            // Tự động đóng sau 2.5 giây
            setTimeout(() => {
                setShow(false);
            }, 2500);
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);
        return () => {
            window.removeEventListener('auth:session-expired', handleSessionExpired);
        };
    }, []);

    return (
        <div className="toast-container position-fixed top-0 end-0 p-3" style={{ zIndex: 1100 }}>
            {/* Thêm class "show" hoặc "hide" dựa vào biến state 'show' */}
            <div
                className={`toast align-items-center text-white bg-danger border-0 ${show ? 'show' : 'hide'}`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body">
                        {toastData ? toastData.message : ''}
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        onClick={() => setShow(false)} // Bấm nút X thì tắt toast
                        aria-label="Close"
                    ></button>
                </div>
            </div>
        </div>
    );
};

export default ToastNotification;
