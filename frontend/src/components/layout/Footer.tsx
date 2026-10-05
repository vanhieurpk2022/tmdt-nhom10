import FooterBrand from "./footer/FooterBrand";
import FooterLinks from "./footer/FooterLink";
import FooterSubscribe from "./footer/FooterSubscribe";

export default function Footer() {
    return (
        <footer className="bg-white w-100">
            <div className="container-fluid px-4 px-lg-5 py-5">
                <div className="row align-items-start">
                    <div className="col-12 col-lg-3 mb-4 mb-lg-0">
                        <FooterBrand />
                    </div>

                    <div className="col-12 col-lg-6 mb-4 mb-lg-0">
                        <FooterLinks />
                    </div>

                    <div className="col-12 col-lg-3">
                        <FooterSubscribe />
                    </div>
                </div>

                <hr className="my-4" />

                <div className="text-center">
                    <small className="text-muted footer-copyright">
                        © 2026 Oilia Inc. All rights reserved
                    </small>
                </div>
            </div>
        </footer>
    );
}
