import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

interface FindProps {
    PlaceHolder?: string;
}

export default function SearchBox({ PlaceHolder }: FindProps) {
    return (
        <div className="search-box d-flex align-items-center p-3" style={{ width: "340px" }}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon me-2" />
            <input type="text" className="search-input" placeholder={PlaceHolder} />
        </div>
    );
}