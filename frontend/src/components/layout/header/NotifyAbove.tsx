import { Link } from "react-router";

interface NotifyAboveProps {
    firstContent: string;
    secondContent: string;
}

export default function NotifyAbove({ firstContent, secondContent }: NotifyAboveProps) {

    return <>
        <div className="d-flex " style={{ backgroundColor: "var(--color-bg-dark)" }}>
            <div className=" flex-grow-1 text-white d-flex flex-row gap-3 align-items-center justify-content-center">
                <span className="text-uppercase"> {firstContent}</span>
                <div className="bg-secondary rounded-circle" style={{ content: " ", width: "8px", height: "8px" }}></div>
                <span className="fs-6" style={{ color: "#F3F4F6" }}>{secondContent} </span>
            </div>
            <Link to="#" className="ms-auto text-decoration-none me-5" style={{ color: "#9CA3AF" }}>Help & Support</Link>
        </div>
    </>
}