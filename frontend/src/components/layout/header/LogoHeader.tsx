import { Link } from "react-router";

interface LogoHeaderProps {
    logo: string;
    branch: string;
}

export default function LogoHeader({ logo, branch }: LogoHeaderProps) {
    return (
        <Link to="/" className="text-decoration-none">
            <div className="d-flex flex-row align-items-center gap-2">
                {logo ? (
                    <img width={27} height={27} src={logo} alt={branch} />
                ) : (
                    <div className="rounded-3 bg-dark" style={{ width: "27px", height: "27px" }} />
                )}
                <span className="fw-bold" style={{ fontSize: "18.7px", color: "var(--color-bg-dark)" }}>
                    {branch}
                </span>
            </div>
        </Link>
    );
}
