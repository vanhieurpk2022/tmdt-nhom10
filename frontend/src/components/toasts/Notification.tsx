import { Toast, ToastContainer } from "react-bootstrap";
export type ToastType = "success" | "danger" | "warning" | "info";

interface NotificationProps {
    show: boolean;
    onClose: () => void;
    title: string;
    content: string;
    type?: ToastType;
}

export function Notification({ show, onClose, title, content, type }: NotificationProps) {
    return (
        <ToastContainer position="top-end" className="p-3" style={{ zIndex: 2000 }}>
            <Toast show={show} onClose={onClose} delay={3000} autohide bg={type}>
                <Toast.Header>
                    <strong className="me-auto">{title}</strong>
                </Toast.Header>
                <Toast.Body className={type === "warning" || type === "info" ? "" : "text-white"}>
                    {content}
                </Toast.Body>
            </Toast>
        </ToastContainer>
    );
}