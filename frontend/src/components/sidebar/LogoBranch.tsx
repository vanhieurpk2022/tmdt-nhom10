import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDroplet } from "@fortawesome/free-solid-svg-icons";

export function LogoBranch() {
  return (
    <>
      <div className=" d-flex justify-content-center align-items-center" style={{ width: "66px", height: "66px", backgroundColor: "var(--color-primary)", borderRadius: "15px", }}>
        <FontAwesomeIcon icon={faDroplet} style={{ color: "white", fontSize: "30px", }}
        />
      </div>
    </>
  );
}
