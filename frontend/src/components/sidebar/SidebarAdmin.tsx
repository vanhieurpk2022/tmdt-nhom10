import SideBarItem from "./SideBarItem";
import { faHouse, faBuilding, faUsers, faTicket, faBoxArchive, faTag, faClipboardCheck, faHeadset } from "@fortawesome/free-solid-svg-icons";
import { LogoBranch } from "./LogoBranch";
import { BadgeAccount } from "./BadgeAccount";

function SidebarAdmin() {
  return (
    <>
      <div className="d-flex flex-column h-100" style={{ backgroundColor: "var(--color-bg-dark)" }}>
        <div className="d-flex flex-row align-items-center justify-content-start gap-3">
          <div className="ms-3">
            <LogoBranch />
          </div>

          <div className="d-flex flex-column">
            <span className="fs-2 text-start ms-2" style={{ color: "var(--color-text-light)" }}>Oilia</span>
            <span className="fs-6 p-2 px-3 rounded-5 badge" style={{ color: "var(--color-text-light)", backgroundColor: "var(--color-primary)" }}>Quản lí vận hành</span>
          </div>
        </div>
        <div className="mt-3">
          <SideBarItem place={faHouse} content="Tổng quan" isActive={true} />
          <SideBarItem place={faBuilding} content="Xưởng" isActive={false} />
          <SideBarItem place={faUsers} content="Khách hàng" isActive={false} />
          <SideBarItem place={faBoxArchive} content="Đơn hàng" isActive={false} />
          <SideBarItem place={faTag} content="Khuyến mãi" isActive={false} />
          <SideBarItem place={faHeadset} content="Phản hồi" isActive={false} />
        </div>
        <div className="mt-auto">
          <BadgeAccount name="Minh Hậu" role="quản trị viên " src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuDGi1_AVK3XUdN5cS9tUBuYhgg9UhK3zN0hA_3b6M-Q&s=10" />
        </div>

      </div >
    </>
  );
}

export default SidebarAdmin;
