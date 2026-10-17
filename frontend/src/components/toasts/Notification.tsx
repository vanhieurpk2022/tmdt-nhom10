interface NotificationProps {
    title: string;
    content: string;
    type?: "success" | "danger" | "warning" | "info";
}

export function Notification({
    title,
    content,
    type = "success",
}: NotificationProps) {

    return (
        <div
            aria-live="polite"
            aria-atomic="true"
        >
            <div className="toast-container position-fixed top-0 end-0 p-3">

                <div
                    className={`toast show text-bg-${type}`}
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                >
                    <div className="toast-header">
                        <strong className="me-auto">
                            {title}
                        </strong>

                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="toast"
                            aria-label="Close"
                        />
                    </div>

                    <div className="toast-body">
                        {content}
                    </div>
                </div>

            </div>
        </div>
    );
}