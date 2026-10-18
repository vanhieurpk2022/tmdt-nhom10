

import SearchBox from "../../../layout/header/SearchBox";

const VariantToolbar = () => {

    return (
        <div className="card border-0 shadow-sm rounded-4 mb-4">

            <div className="card-body p-3 p-lg-4">

                <div className="d-flex flex-column flex-xl-row align-items-xl-center justify-content-between gap-3">

                    {/* LEFT */}
                    <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">

                        {/* Search */}
                        <div
                            className="input-group"
                            style={{ maxWidth: "320px" }}
                        >

                            <SearchBox />
                        </div>


                    </div>



                </div>

            </div>

        </div>
    );
};

export default VariantToolbar;