import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";


interface UserNavProps {
    username: string;
    avatar?: string;
    email: string;
}

export default function UserNav({ username, avatar, email }: UserNavProps) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="position-relative d-flex align-items-center" role="button" data-bs-toggle="dropdown" aria-expanded={isOpen} onClick={() => setIsOpen(!isOpen)}>
            {avatar ? <img src={avatar} width={40} height={40} className="rounded-circle" alt="Avatar" /> :
                <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 40, height: 40 }}>{username.charAt(0).toUpperCase()}</div>}
            <div className="d-flex flex-column ms-2">
                <span>{username}</span>
                <span>{email}</span>
            </div>
            <span className="badge position-absolute text-bg-danger" style={{ bottom: "55%", left: "70%" }}>VIP</span>
            <FontAwesomeIcon className="position-absolute top-50 translate-middle start-100" icon={isOpen ? faCaretDown : faCaretUp} />
        </div>
    );
}