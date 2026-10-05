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
        title: "Danh mục",
        links: [
            { label: "Tinh dầu", path: "/products" },
            { label: "Nến thơm", path: "/candles" },
            { label: "Máy khuếch tán", path: "/diffusers" },
            { label: "Bộ quà tặng", path: "/gift-sets" },
            { label: "Workshop", path: "/workshop" },
        ],
    },
    {
        title: "Mua sắm",
        links: [
            { label: "Thanh toán", path: "/payments" },
            { label: "Giao hàng", path: "/delivery" },
            { label: "Bảo vệ người mua", path: "/buyer-protection" },
        ],
    },
    {
        title: "Chăm sóc",
        links: [
            { label: "Trung tâm hỗ trợ", path: "/help" },
            { label: "Điều khoản", path: "/terms" },
            { label: "Chính sách riêng tư", path: "/privacy" },
            { label: "Đổi trả & hoàn tiền", path: "/returns" },
            { label: "Góp ý", path: "/feedback" },
        ],
    },
    {
        title: "Oilia",
        links: [
            { label: "Về chúng tôi", path: "/about" },
            { label: "Cửa hàng", path: "/shop" },
            { label: "Liên hệ", path: "/contact" },
            { label: "Dịch vụ", path: "/services" },
            { label: "Blog", path: "/blog" },
        ],
    },
];

export default function FooterLinks() {
    return (
        <div className="row row-cols-2 row-cols-md-4 g-3">
            {footerLinkGroups.map((group) => (
                <div className="col" key={group.title}>
                    <h6 className="fw-bold footer-title">{group.title}</h6>

                    <ul className="list-unstyled mb-0">
                        {group.links.map((link) => (
                            <li key={link.path} className="mb-1">
                                <Link to={link.path} className="text-decoration-none text-dark footer-link">
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
