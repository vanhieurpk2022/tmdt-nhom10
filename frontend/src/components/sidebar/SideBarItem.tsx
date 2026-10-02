import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface SideBarItemProps {
  place: IconProp;
  content: string;
  isActive: boolean;
}

function SideBarItem({ place, content, isActive }: SideBarItemProps) {
  return (
    <>
      <button className={`btn SideBar-buttonItems w-100 d-flex align-items-center gap-2 p-2 px-4 fw-semibold text-start ${isActive ? `active` : ""}`}>
        <FontAwesomeIcon icon={place} />
        <span>{content}</span>
      </button >
    </>
  );
}

export default SideBarItem;
