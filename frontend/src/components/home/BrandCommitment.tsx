import { faFlask, faLeaf, faRecycle, faShieldHeart } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { commitments } from "../../data/homeData";

const commitmentIcons: Record<string, IconDefinition> = {
    leaf: faLeaf,
    flask: faFlask,
    recycle: faRecycle,
    shield: faShieldHeart,
};

export default function BrandCommitment() {
    return (
        <section className="home-commitment">
            <div className="home-commitment-intro">
                <span className="home-commitment-icon d-inline-flex align-items-center justify-content-center">
                    <FontAwesomeIcon icon={faLeaf} />
                </span>
                <h2>Cam Kết Từ Aura Essential</h2>
                <p>
                    Từng giọt tinh dầu được chưng cất hơi nước thủ công theo quy trình nghiêm ngặt,
                    giữ trọn năng lượng thanh lành của thảo mộc. Chúng tôi cam kết mang lại sự
                    thuần khiết nguyên bản nhất từ mẹ thiên nhiên cho ngôi nhà của bạn.
                </p>
            </div>

            <div className="row g-3">
                {commitments.map((item) => (
                    <div className="col-12 col-sm-6 col-lg-3" key={item.title}>
                        <article className="home-commitment-card d-flex flex-column align-items-center">
                            <span className="d-inline-flex align-items-center justify-content-center">
                                <FontAwesomeIcon icon={commitmentIcons[item.icon]} />
                            </span>
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                        </article>
                    </div>
                ))}
            </div>
        </section>
    );
}
