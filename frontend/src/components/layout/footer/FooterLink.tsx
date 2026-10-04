import { Link } from "react-router";

interface FooterLink {
    label: string;
    path: string;
}

interface FooterLinkGroup {
    title: string;
    links: FooterLink[];
}

const footerLinkGroups: FooterLinkGroup[] = [
    {
        title: "Categories",
        links: [
            { label: "Fashion", path: "/fashion" },
            { label: "Jewelry", path: "/jewelry" },
            { label: "Sportswear", path: "/sportswear" },
            { label: "Electronics", path: "/electronics" },
            { label: "Indoor", path: "/indoor" },
        ],
    },
    {
        title: "Shopping",
        links: [
            { label: "Payments", path: "/payments" },
            { label: "Delivery options", path: "/delivery" },
            { label: "Buyer protection", path: "/buyer-protection" },
        ],
    },
    {
        title: "Customer care",
        links: [
            { label: "Help center", path: "/help" },
            { label: "Terms & Conditions", path: "/terms" },
            { label: "Privacy policy", path: "/privacy" },
            { label: "Returns & refund", path: "/returns" },
            { label: "Survey & feedback", path: "/feedback" },
        ],
    },
    {
        title: "Pages",
        links: [
            { label: "About Us", path: "/about" },
            { label: "Shop", path: "/shop" },
            { label: "Contact Us", path: "/contact" },
            { label: "Services", path: "/services" },
            { label: "Blog", path: "/blog" },
        ],
    },
];

export default function FooterLinks() {
    return (
        <div className="row row-cols-2 row-cols-md-4 g-3">
            {footerLinkGroups.map((group) => (
                <div className="col" key={group.title}>
                    <h6 className="fw-bold footer-title"> {group.title}</h6>

                    <ul className="list-unstyled mb-0">
                        {group.links.map((link) => (
                            <li key={link.path} className="mb-1">
                                <Link to={link.path} className="text-decoration-none text-dark footer-link"  > {link.label} </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}