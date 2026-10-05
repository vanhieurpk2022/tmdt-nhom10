export default function FooterBrand() {
    return (
        <div className="footer-brand">
            <div className="d-flex align-items-center gap-2 mb-3">
                <div className="bg-dark rounded-1" style={{ width: "28px", height: "28px" }} />
                <span className="fs-5 fw-semibold">Oilia</span>
            </div>

            <p className="text-muted small mb-0 footer-description">
                Oilia mang tinh dầu thiên nhiên, nến thơm và bộ quà thư giãn đến gần hơn với từng không gian sống.
                <br />
                Mỗi sản phẩm được chọn lọc từ thảo mộc tinh khiết và quy trình thân thiện với môi trường.
            </p>
        </div>
    );
}
