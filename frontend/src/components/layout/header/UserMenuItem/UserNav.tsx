import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";


interface UserNavProps {
    fullname: string;
    avatar?: string;
    email: string;
}

export default function UserNav({ fullname, avatar, email }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className="position-relative d-flex align-items-center me-3"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            style={{ cursor: 'pointer' }}
        >
            {/* Khối Avatar */}
            <div className="flex-shrink-0">
                {avatar ? (
                    <img src={avatar} width={40} height={40} className="rounded-circle" alt="Avatar" />
                ) : (
                    <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 40, height: 40 }}>
                        {fullname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                )}
            </div>

            <div className="d-flex flex-column ms-2" style={{ maxWidth: "150px" }}>
                <span className="fw-semibold text-truncate" style={{ fontSize: "14px" }}>
                    {fullname || "Người dùng"}
                </span>
                <span className="text-muted text-truncate" style={{ fontSize: "12px" }} title={email}>
                    {email}
                </span>
            </div>

            <span className="badge text-bg-danger ms-2" style={{ fontSize: "10px" }}>VIP</span>

            <FontAwesomeIcon className="ms-2 text-muted" icon={isOpen ? faCaretUp : faCaretDown} />
        </div>
    );
}
