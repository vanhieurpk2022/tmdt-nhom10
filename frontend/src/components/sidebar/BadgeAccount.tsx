interface BadgeAccountProps {
  name: string;
  role: string;
  src: string;
}

export function BadgeAccount({ name, role, src }: BadgeAccountProps) {
  return (
    <>
      <div className="ms-3">
        <div className="d-flex align-items-center">
          <img className="rounded-5 " src={src} width={42} height={42} alt="" />
          <div className="d-flex flex-column justify-content-start">
            <span className="text-white text-start ms-3" > {name}</span>
            <span className="text-uppercase ms-3" style={{ color: "var(--color-primary)" }}> {role} </span>
          </div>
        </div>
        <button className="btn w-100 fw-bold mt-3 logout"> Đăng xuất</button>

      </div >
    </>
  );
}
