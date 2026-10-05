import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router";
import { searchSuggestions } from "../../data/homeData";

export default function SearchSuggestions() {
    return (
        <section className="home-search-suggestions" aria-label="Gợi ý tìm kiếm">
            <div className="container-fluid px-4 px-lg-5">
                <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className="home-suggestion-label">
                        <FontAwesomeIcon icon={faMagnifyingGlass} />
                        Gợi ý tìm kiếm:
                    </span>
                    {searchSuggestions.map((suggestion) => (
                        <Link to="#" className="home-suggestion-chip" key={suggestion}>
                            {suggestion}
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
