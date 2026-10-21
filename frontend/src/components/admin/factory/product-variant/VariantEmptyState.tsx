import { faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const VariantEmptyState = () => {

    return (
        <div className="py-5">

            <div className="d-flex flex-column align-items-center">

                <FontAwesomeIcon
                    icon={faBoxOpen}
                    className="fs-1 text-secondary opacity-50 mb-3"
                />

                <p className="text-secondary mb-0">
                    Chưa có biến thể nào.
                    Hãy bấm
                    <span className="fw-semibold mx-1">
                        'Thêm biến thể mới'
                    </span>
                    để tạo!
                </p>

            </div>

        </div>
    );
};

export default VariantEmptyState;