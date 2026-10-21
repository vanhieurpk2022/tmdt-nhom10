import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faLocationDot, faPhone, faUser, faSpinner, faTrash, faPenToSquare, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import AccountLayout from "../components/layout/AccountLayout";
import { addressService, type AddressItem, type AddressPayload } from "../api/AddressService";
import { locationService, type LocationItem } from "../api/LocationService";

// Trang Sổ địa chỉ - Quản lý danh sách địa chỉ giao hàng của người dùng
export default function AddressBookPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [addresses, setAddresses] = useState<AddressItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoading, setActionLoading] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<AddressItem | null>(null);
    const [message, setMessage] = useState<{ text: string; type: "success" | "danger" } | null>(null);
    const returnTo = searchParams.get("returnTo");
    const canReturnAfterSelect = Boolean(returnTo?.startsWith("/") && !returnTo.startsWith("//"));

    // State danh mục địa giới hành chính (Tỉnh / Huyện / Xã)
    const [provinces, setProvinces] = useState<LocationItem[]>([]);
    const [districts, setDistricts] = useState<LocationItem[]>([]);
    const [wards, setWards] = useState<LocationItem[]>([]);

    const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | number>("");
    const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | number>("");
    const [selectedWardCode, setSelectedWardCode] = useState<string | number>("");

    const [loadingLocations, setLoadingLocations] = useState<{
        provinces: boolean;
        districts: boolean;
        wards: boolean;
    }>({
        provinces: false,
        districts: false,
        wards: false,
    });

    // Dữ liệu form thêm / sửa địa chỉ
    const [formData, setFormData] = useState<AddressPayload>({
        recipentName: "",
        phoneNumber: "",
        city: "",
        district: "",
        ward: "",
        street: "",
        isDefault: false,
    });

    // Tải danh sách địa chỉ và danh mục tỉnh thành khi mở trang
    useEffect(() => {
        fetchAddresses();
        loadProvinces();
    }, []);

    // Tải danh sách Tỉnh / Thành phố
    const loadProvinces = async () => {
        setLoadingLocations((prev) => ({ ...prev, provinces: true }));
        try {
            const list = await locationService.getProvinces();
            setProvinces(list);
            return list;
        } catch (error) {
            console.error("Lỗi khi tải danh sách tỉnh/thành:", error);
            return [];
        } finally {
            setLoadingLocations((prev) => ({ ...prev, provinces: false }));
        }
    };

    // Hàm gọi API lấy danh sách địa chỉ
    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const data = await addressService.getAddresses();
            setAddresses(data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách địa chỉ:", error);
            setMessage({ text: "Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.", type: "danger" });
        } finally {
            setLoading(false);
        }
    };

    // Mở modal thêm địa chỉ mới
    const handleOpenAddModal = async () => {
        setEditingAddress(null);
        setSelectedProvinceCode("");
        setSelectedDistrictCode("");
        setSelectedWardCode("");
        setDistricts([]);
        setWards([]);
        setFormData({
            recipentName: "",
            phoneNumber: "",
            city: "",
            district: "",
            ward: "",
            street: "",
            isDefault: addresses.length === 0,
        });
        setShowModal(true);

        if (provinces.length === 0) {
            await loadProvinces();
        }
    };

    // Mở modal sửa địa chỉ (tự động so khớp chuẩn hóa với danh mục GHN)
    const handleOpenEditModal = async (addr: AddressItem) => {
        setEditingAddress(addr);
        setFormData({
            recipentName: addr.recipentName || "",
            phoneNumber: addr.phoneNumber || "",
            city: addr.city || "",
            district: addr.district || "",
            ward: addr.ward || "",
            street: addr.street || "",
            isDefault: addr.isDefault,
        });
        setShowModal(true);

        // Nạp và so khớp danh mục phân cấp
        let currentProvinces = provinces;
        if (currentProvinces.length === 0) {
            currentProvinces = await loadProvinces();
        }

        const matchedProvince = locationService.findMatchingLocation(currentProvinces, addr.city);
        if (matchedProvince) {
            setSelectedProvinceCode(matchedProvince.code);
            setLoadingLocations((prev) => ({ ...prev, districts: true }));
            try {
                const districtList = await locationService.getDistricts(matchedProvince.code);
                setDistricts(districtList);

                const matchedDistrict = locationService.findMatchingLocation(districtList, addr.district);
                if (matchedDistrict) {
                    setSelectedDistrictCode(matchedDistrict.code);
                    setLoadingLocations((prev) => ({ ...prev, wards: true }));
                    try {
                        const wardList = await locationService.getWards(matchedDistrict.code);
                        setWards(wardList);

                        const matchedWard = locationService.findMatchingLocation(wardList, addr.ward);
                        if (matchedWard) {
                            setSelectedWardCode(matchedWard.code);
                        } else {
                            setSelectedWardCode("");
                        }
                    } finally {
                        setLoadingLocations((prev) => ({ ...prev, wards: false }));
                    }
                } else {
                    setSelectedDistrictCode("");
                    setSelectedWardCode("");
                    setWards([]);
                }
            } finally {
                setLoadingLocations((prev) => ({ ...prev, districts: false }));
            }
        } else {
            setSelectedProvinceCode("");
            setSelectedDistrictCode("");
            setSelectedWardCode("");
            setDistricts([]);
            setWards([]);
        }
    };

    // Khi người dùng chọn Tỉnh / Thành phố
    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const selected = provinces.find((p) => String(p.code) === String(code));
        setSelectedProvinceCode(code);
        setSelectedDistrictCode("");
        setSelectedWardCode("");
        setDistricts([]);
        setWards([]);
        setFormData((prev) => ({
            ...prev,
            city: selected ? selected.name : "",
            district: "",
            ward: "",
        }));

        if (code) {
            setLoadingLocations((prev) => ({ ...prev, districts: true }));
            try {
                const list = await locationService.getDistricts(code);
                setDistricts(list);
            } finally {
                setLoadingLocations((prev) => ({ ...prev, districts: false }));
            }
        }
    };

    // Khi người dùng chọn Quận / Huyện
    const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const selected = districts.find((d) => String(d.code) === String(code));
        setSelectedDistrictCode(code);
        setSelectedWardCode("");
        setWards([]);
        setFormData((prev) => ({
            ...prev,
            district: selected ? selected.name : "",
            ward: "",
        }));

        if (code) {
            setLoadingLocations((prev) => ({ ...prev, wards: true }));
            try {
                const list = await locationService.getWards(code);
                setWards(list);
            } finally {
                setLoadingLocations((prev) => ({ ...prev, wards: false }));
            }
        }
    };

    // Khi người dùng chọn Phường / Xã
    const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const code = e.target.value;
        const selected = wards.find((w) => String(w.code) === String(code));
        setSelectedWardCode(code);
        setFormData((prev) => ({
            ...prev,
            ward: selected ? selected.name : "",
        }));
    };

    // Xử lý gửi form thêm hoặc cập nhật địa chỉ
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (
            !formData.recipentName.trim() ||
            !formData.phoneNumber.trim() ||
            !formData.street.trim() ||
            !formData.city.trim() ||
            !formData.district.trim() ||
            !formData.ward.trim()
        ) {
            alert("Vui lòng điền đầy đủ họ tên, số điện thoại, chọn Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và địa chỉ cụ thể.");
            return;
        }

        setActionLoading(true);
        try {
            if (editingAddress) {
                // Cập nhật địa chỉ
                await addressService.updateAddress(editingAddress.id, formData);
                setMessage({ text: "Cập nhật địa chỉ thành công!", type: "success" });
            } else {
                // Thêm địa chỉ mới
                await addressService.addAddress(formData);
                setMessage({ text: "Thêm địa chỉ mới thành công!", type: "success" });
            }
            setShowModal(false);
            await fetchAddresses();
            if (canReturnAfterSelect && formData.isDefault) {
                navigate(returnTo as string);
            }
        } catch (error) {
            console.error("Lỗi khi lưu địa chỉ:", error);
            setMessage({ text: "Lưu địa chỉ thất bại. Vui lòng thử lại.", type: "danger" });
        } finally {
            setActionLoading(false);
        }
    };

    // Xử lý xóa địa chỉ
    const handleDelete = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
        setActionLoading(true);
        try {
            await addressService.deleteAddress(id);
            setMessage({ text: "Đã xóa địa chỉ thành công!", type: "success" });
            await fetchAddresses();
        } catch (error) {
            console.error("Lỗi khi xóa địa chỉ:", error);
            setMessage({ text: "Xóa địa chỉ thất bại. Vui lòng thử lại.", type: "danger" });
        } finally {
            setActionLoading(false);
        }
    };

    // Xử lý đặt địa chỉ làm mặc định
    const handleSelectAddress = async (address: AddressItem) => {
        if (canReturnAfterSelect && address.isDefault) {
            navigate(returnTo as string);
            return;
        }

        setActionLoading(true);
        try {
            await addressService.setDefaultAddress(address.id);
            setMessage({ text: "Đã đặt làm địa chỉ mặc định!", type: "success" });
            await fetchAddresses();
            if (canReturnAfterSelect) {
                navigate(returnTo as string);
            }
        } catch (error) {
            console.error("Lỗi khi đặt địa chỉ mặc định:", error);
            setMessage({ text: "Không thể đặt địa chỉ mặc định. Vui lòng thử lại.", type: "danger" });
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <AccountLayout breadcrumbCurrent="Sổ địa chỉ">
            <div className="bg-white rounded-4 shadow-sm p-4 px-lg-5 pb-lg-5 pt-lg-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
                    <div>
                        <h2 className="h4 fw-bold text-dark mb-2">Sổ địa chỉ</h2>
                        <p className="text-muted fs-7 mb-0">Quản lý địa chỉ giao hàng và thông tin liên hệ của bạn.</p>
                    </div>
                    <button
                        className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2 text-nowrap"
                        onClick={handleOpenAddModal}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Thêm địa chỉ mới
                    </button>
                </div>

                {/* Thông báo kết quả thao tác */}
                {message && (
                    <div className={`alert alert-${message.type} alert-dismissible fade show rounded-3 fs-7 mb-4`} role="alert">
                        {message.text}
                        <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close"></button>
                    </div>
                )}

                {/* Trạng thái đang tải dữ liệu */}
                {loading ? (
                    <div className="text-center py-5">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-primary fs-3 mb-2" />
                        <p className="text-muted fs-7 mb-0">Đang tải danh sách địa chỉ...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    /* Trạng thái chưa có địa chỉ */
                    <div className="text-center py-5 border rounded-4 bg-light">
                        <FontAwesomeIcon icon={faLocationDot} className="text-muted fs-1 mb-3" />
                        <h5 className="fw-bold text-dark mb-2">Chưa có địa chỉ nào</h5>
                        <p className="text-muted fs-7 mb-3">Hãy thêm địa chỉ giao hàng để thuận tiện hơn khi đặt hàng.</p>
                        <button className="btn btn-primary fw-bold px-4 py-2 rounded-3" onClick={handleOpenAddModal}>
                            <FontAwesomeIcon icon={faPlus} className="me-2" />
                            Thêm địa chỉ ngay
                        </button>
                    </div>
                ) : (
                    /* Danh sách địa chỉ */
                    <div className="d-flex flex-column gap-3">
                        {addresses.map((addr) => {
                            // Ghép chuỗi địa chỉ đầy đủ
                            const fullAddressParts = [addr.street, addr.ward, addr.district, addr.city].filter(Boolean);
                            const fullAddress = fullAddressParts.join(", ");

                            return (
                                <div
                                    key={addr.id}
                                    className={`rounded-4 p-4 position-relative border ${
                                        addr.isDefault
                                            ? "border-primary bg-primary bg-opacity-10"
                                            : "bg-light bg-opacity-50"
                                    }`}
                                >
                                    {addr.isDefault && (
                                        <span className="badge bg-primary position-absolute top-0 end-0 mt-3 me-3 px-3 py-2 rounded-pill">
                                            <FontAwesomeIcon icon={faCheck} className="me-1" />
                                            Mặc định
                                        </span>
                                    )}

                                    <div className="d-flex flex-column gap-2 mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <FontAwesomeIcon icon={faUser} className="text-muted" style={{ width: "16px" }} />
                                            <span className="fw-bold fs-5 text-dark">{addr.recipentName}</span>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 text-muted">
                                            <FontAwesomeIcon icon={faPhone} style={{ width: "16px" }} />
                                            <span>{addr.phoneNumber}</span>
                                        </div>
                                        <div className="d-flex align-items-start gap-2 text-muted">
                                            <FontAwesomeIcon icon={faLocationDot} className="mt-1" style={{ width: "16px" }} />
                                            <span>{fullAddress || "Chưa cập nhật địa chỉ"}</span>
                                        </div>
                                    </div>

                                    <div className="d-flex gap-2 align-items-center">
                                        <button
                                            className={`btn btn-sm fw-bold px-3 ${
                                                addr.isDefault ? "btn-outline-primary" : "btn-outline-dark"
                                            }`}
                                            onClick={() => handleOpenEditModal(addr)}
                                            disabled={actionLoading}
                                        >
                                            <FontAwesomeIcon icon={faPenToSquare} className="me-1" />
                                            Cập nhật
                                        </button>
                                        {!addr.isDefault && (
                                            <>
                                                <button
                                                    className="btn btn-sm btn-outline-danger fw-bold px-3"
                                                    onClick={() => handleDelete(addr.id)}
                                                    disabled={actionLoading}
                                                >
                                                    <FontAwesomeIcon icon={faTrash} className="me-1" />
                                                    Xóa
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-link text-muted text-decoration-none fw-bold ms-auto"
                                                    onClick={() => handleSelectAddress(addr)}
                                                    disabled={actionLoading}
                                                >
                                                    {canReturnAfterSelect ? "Chọn địa chỉ này" : "Đặt làm mặc định"}
                                                </button>
                                            </>
                                        )}
                                        {canReturnAfterSelect && addr.isDefault && (
                                            <button
                                                className="btn btn-sm btn-link text-muted text-decoration-none fw-bold ms-auto"
                                                onClick={() => handleSelectAddress(addr)}
                                                disabled={actionLoading}
                                            >
                                                Chọn địa chỉ này
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal Thêm / Chỉnh sửa địa chỉ */}
            {showModal && (
                <div
                    className="modal fade show"
                    style={{ display: "block", zIndex: 1055, backgroundColor: "rgba(0,0,0,0.5)" }}
                    tabIndex={-1}
                    aria-modal="true"
                    role="dialog"
                >
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                            <div className="modal-header border-0 bg-light p-4 pb-3">
                                <h5 className="modal-title fw-bold text-dark">
                                    {editingAddress ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                    disabled={actionLoading}
                                ></button>
                            </div>
                            <div className="modal-body p-4 pt-3">
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-bold text-dark fs-7">Họ và tên người nhận</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 py-2 text-dark"
                                                placeholder="Nhập họ và tên người nhận"
                                                value={formData.recipentName}
                                                onChange={(e) => setFormData({ ...formData, recipentName: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="col-12 col-md-6">
                                            <label className="form-label fw-bold text-dark fs-7">Số điện thoại liên hệ</label>
                                            <input
                                                type="text"
                                                className="form-control rounded-3 py-2 text-dark"
                                                placeholder="Ví dụ: 0901234567"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="row g-3 mb-3">
                                        <div className="col-12 col-md-4">
                                            <label className="form-label fw-bold text-dark fs-7">
                                                Tỉnh / Thành phố <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select rounded-3 py-2 text-dark"
                                                value={selectedProvinceCode}
                                                onChange={handleProvinceChange}
                                                disabled={loadingLocations.provinces}
                                                required
                                            >
                                                <option value="">
                                                    {loadingLocations.provinces
                                                        ? "-- Đang tải danh sách... --"
                                                        : "-- Chọn Tỉnh / Thành phố --"}
                                                </option>
                                                {provinces.map((p) => (
                                                    <option key={p.code} value={p.code}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label fw-bold text-dark fs-7">
                                                Quận / Huyện <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select rounded-3 py-2 text-dark"
                                                value={selectedDistrictCode}
                                                onChange={handleDistrictChange}
                                                disabled={!selectedProvinceCode || loadingLocations.districts}
                                                required
                                            >
                                                <option value="">
                                                    {loadingLocations.districts
                                                        ? "-- Đang tải danh sách... --"
                                                        : !selectedProvinceCode
                                                        ? "-- Chọn Tỉnh/TP trước --"
                                                        : "-- Chọn Quận / Huyện --"}
                                                </option>
                                                {districts.map((d) => (
                                                    <option key={d.code} value={d.code}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-12 col-md-4">
                                            <label className="form-label fw-bold text-dark fs-7">
                                                Phường / Xã <span className="text-danger">*</span>
                                            </label>
                                            <select
                                                className="form-select rounded-3 py-2 text-dark"
                                                value={selectedWardCode}
                                                onChange={handleWardChange}
                                                disabled={!selectedDistrictCode || loadingLocations.wards}
                                                required
                                            >
                                                <option value="">
                                                    {loadingLocations.wards
                                                        ? "-- Đang tải danh sách... --"
                                                        : !selectedDistrictCode
                                                        ? "-- Chọn Quận/Huyện trước --"
                                                        : "-- Chọn Phường / Xã --"}
                                                </option>
                                                {wards.map((w) => (
                                                    <option key={w.code} value={w.code}>
                                                        {w.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label fw-bold text-dark fs-7">Địa chỉ cụ thể (Số nhà, tên đường)</label>
                                        <textarea
                                            className="form-control rounded-3 py-2 text-dark"
                                            rows={3}
                                            placeholder="Ví dụ: 123 Đường Nguyễn Văn Linh"
                                            value={formData.street}
                                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>

                                    <div className="form-check mb-4">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id="defaultAddress"
                                            checked={formData.isDefault}
                                            disabled={editingAddress?.isDefault}
                                            onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                                        />
                                        <label className="form-check-label fs-7 text-dark" htmlFor="defaultAddress">
                                            Đặt làm địa chỉ mặc định
                                        </label>
                                    </div>

                                    <div className="d-flex justify-content-end gap-3">
                                        <button
                                            type="button"
                                            className="btn btn-white border fw-bold px-4 py-2 rounded-3 text-dark"
                                            onClick={() => setShowModal(false)}
                                            disabled={actionLoading}
                                        >
                                            Hủy
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary fw-bold px-4 py-2 rounded-3 d-flex align-items-center gap-2"
                                            disabled={actionLoading}
                                        >
                                            {actionLoading && <FontAwesomeIcon icon={faSpinner} spin />}
                                            {editingAddress ? "LƯU THAY ĐỔI" : "LƯU ĐỊA CHỈ"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AccountLayout>
    );
}
