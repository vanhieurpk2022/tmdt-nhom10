import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCartShopping } from "@fortawesome/free-solid-svg-icons";
import { Basket2 } from "react-bootstrap-icons";
import { Link } from "react-router";

interface CartProps {
    quantity: number;
    total: number;
}

export default function Cart({ quantity, total }: CartProps) {
    return (
        <Link to="#" className="text-decoration-none text-reset">
            <div className="d-flex align-items-center gap-3">
                {/* Cart icon */}
                <div className="position-relative">
                    <Basket2 className="fs-3" />
                    {quantity > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "10px" }}>
                            {quantity}
                        </span>
                    )}
                </div>

                {/* Cart information */}
                <div className="d-flex flex-column">
                    <span className="text-uppercase text-secondary" style={{ fontSize: "14px" }}>Cart</span>

                    <span className="fw-bold fs-5">
                        ${total.toFixed(2)}
                    </span>
                </div>
            </div>
        </Link>
    );
}