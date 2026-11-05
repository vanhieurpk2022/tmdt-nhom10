import { useState, useEffect } from "react";
import { FactoryApiService, type RegisterFactoryRequest } from "../api/FactoryService";
import { cloudinaryService, type UploadedAsset } from "../api/UploadApi";
import axios from "axios";
import { useToastContext } from "../components/toasts/ToastContext";

export function RegisterFactoryForm() {

    // 1. State Thông Tin Định Danh
    const [typeBussiness, setTypeBussiness] = useState(false);
    const [typeIndividual, setTypeindividual] = useState(true); // Mặc định chọn Cá nhân
    const [nameFactory, setNameFactory] = useState("");
    const [fullNameRepre, setFullNameRepre] = useState("");
    const [identity, setIdentity] = useState("");
    const [license, setLicense] = useState<File | null>(null);

    // 2. State Hồ Sơ Pháp Lý (Lưu đối tượng File)
    const [cosmeticLicense, setCosmeticLicense] = useState<File | null>(null);
    const [tccsDoc, setTccsDoc] = useState<File | null>(null); // Bổ sung state cho TCCS
    const [originInvoice, setOriginInvoice] = useState<File | null>(null);
    const [brandAuthorization, setBrandAuthorization] = useState<File | null>(null);

    // 3. State Địa Chỉ Kho & Liên Hệ
    const [shopPhone, setShopPhone] = useState("");
    const [warehouseAddress, setWarehouseAddress] = useState("");

    // 4. State Tài Khoản Nhận Tiền
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");

    const { showToast } = useToastContext();
    const [loading, setLoading] = useState(false);


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (loading) return; // chặn bấm nhiều lần

        setLoading(true);

        const uploaded: UploadedAsset[] = []; // gom lại để xoá nếu có lỗi

        try {
            // 1. Upload song song, file nào không có thì trả về undefined
            const files = [license, cosmeticLicense, tccsDoc, originInvoice, brandAuthorization];

            // allSettled để không mất tham chiếu tới các file đã upload xong khi có file lỗi
            const results = await Promise.allSettled(
                files.map((f) => (f ? cloudinaryService.upload(f) : Promise.resolve(undefined)))
            );

            results.forEach((r) => {
                if (r.status === "fulfilled" && r.value) uploaded.push(r.value);
            });

            const failed = results.find((r) => r.status === "rejected") as PromiseRejectedResult | undefined;
            if (failed) throw failed.reason;

            const [lic, cos, tccs, origin, brand] = results.map(
                (r) => (r as PromiseFulfilledResult<UploadedAsset | undefined>).value
            );

            // 2. Gửi JSON chứa URL về backend
            const request: RegisterFactoryRequest = {
                name: nameFactory,
                address: warehouseAddress,
                accountHolder,
                accountNumber,
                shopPhone,
                fullNameRepre,
                identity,
                typeFactory: typeIndividual ? 0 : 1,
                licenseUrl: lic?.url,
                cosmeticLicenseUrl: cos?.url,
                tccsDocUrl: tccs?.url,
                originInvoiceUrl: origin?.url,
                brandAuthorizationUrl: brand?.url,
            };

            const res = await FactoryApiService.regsiterFactory(request);
            if (res.status === 201) {
                showToast("Thành công", "Đã đăng kí người bán", "success");
                setTypeBussiness(false);
                setTypeindividual(true);
                setNameFactory("");
                setFullNameRepre("");
                setIdentity("");
                setLicense(null);
                setCosmeticLicense(null);
                setTccsDoc(null);
                setOriginInvoice(null);
                setBrandAuthorization(null);
                setShopPhone("");
                setWarehouseAddress("");
                setAccountHolder("");
                setAccountNumber("");

            }

        } catch (err) {
            // Dọn file đã upload; lỗi khi dọn không được che mất lỗi gốc
            await cloudinaryService.deleteUploads(uploaded).catch(console.error);

            if (axios.isAxiosError(err)) {
                if (!err.response) {
                    showToast("Lỗi", "Không kết nối được máy chủ", "danger");
                } else {
                    showToast("Lỗi", err.response.data?.message, "danger");


                }
            } else if (err instanceof Error) {
                // Lỗi validate file (quá 10MB, sai định dạng) hoặc lỗi upload Cloudinary (dùng fetch)
                showToast("Lỗi", err.message, "danger");

            } else {
                showToast("Lỗi", "Đăng ký thất bại, vui lòng thử lại", "danger");

            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 py-4 px-3" style={{ backgroundColor: '#f4f7f5' }}>
            <div
                className="container bg-white p-4 p-md-5 rounded-3 shadow-sm mx-auto"
                style={{ maxWidth: '850px' }}
            >
                <h1 className="text-danger text-center text-uppercase fw-bold fs-4 mb-1">
                    Đăng Ký Gian Hàng
                </h1>
                <p className="text-center text-secondary fst-italic small mb-4">
                    Hệ thống xét duyệt thông tin định danh và chứng nhận chất lượng sản phẩm tinh dầu
                </p>

                <form encType="multipart/form-data" onSubmit={handleSubmit}>
                    {/* 1. Thông Tin Định Danh Người Bán */}
                    <fieldset
                        className="border rounded-2 p-3 p-md-4 mb-4"
                        style={{ backgroundColor: '#fbfcfb' }}
                    >
                        <legend className="float-none w-auto px-2 fw-bold fs-5">
                            1. Thông Tin Định Danh Người Bán
                        </legend>

                        <div className="mb-3">
                            <label className="form-label fw-semibold d-block">
                                Mô hình hoạt động: <span className="text-danger">*</span>
                            </label>
                            <div className="d-flex gap-4 mt-1">
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="model_type"
                                        checked={typeIndividual}
                                        onChange={() => {
                                            setTypeBussiness(false);
                                            setTypeindividual(true);
                                        }}
                                        id="model_canhan"
                                        value="canhan"
                                    />
                                    <label className="form-check-label" htmlFor="model_canhan">
                                        Cá nhân / Hộ kinh doanh
                                    </label>
                                </div>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="model_type"
                                        checked={typeBussiness}
                                        onChange={() => {
                                            setTypeBussiness(true);
                                            setTypeindividual(false);
                                        }}
                                        id="model_doanhnghiep"
                                        value="doanhnghiep"
                                    />
                                    <label className="form-check-label" htmlFor="model_doanhnghiep">
                                        Doanh nghiệp / Công ty
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="shop_name" className="form-label fw-semibold">
                                Tên Gian Hàng Tinh Dầu: <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="shop_name"
                                name="shop_name"
                                placeholder="Ví dụ: Tinh Dầu Thiên Nhiên GreenLife"
                                value={nameFactory}
                                onChange={(e) => setNameFactory(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="fullname" className="form-label fw-semibold">
                                Họ và Tên (Theo CCCD/Đại diện pháp luật): <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="fullname"
                                name="fullname"
                                placeholder="NGUYỄN VĂN A"
                                value={fullNameRepre}
                                onChange={(e) => setFullNameRepre(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="cccd_number" className="form-label fw-semibold">
                                Số CCCD / Mã Số Thuế Doanh Nghiệp: <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="cccd_number"
                                name="cccd_number"
                                value={identity}
                                onChange={(e) => setIdentity(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="legal_docs" className="form-label fw-semibold">
                                Mặt trước + Mặt sau CCCD (hoặc Giấy phép ĐKKD): <span className="text-danger">*</span>
                            </label>
                            <input
                                type="file"
                                className="form-control"
                                id="legal_docs"
                                name="legal_docs"
                                accept="image/*,application/pdf"
                                onChange={(e) => setLicense(e.target.files?.[0] || null)}
                                required
                            />
                        </div>
                    </fieldset>

                    {/* 2. Hồ Sơ Pháp Lý Sản Phẩm Tinh Dầu */}
                    <fieldset
                        className="border rounded-2 p-3 p-md-4 mb-4"
                        style={{ backgroundColor: '#fbfcfb' }}
                    >
                        <legend className="float-none w-auto px-2 fw-bold fs-5">
                            2. Hồ Sơ Pháp Lý Sản Phẩm Tinh Dầu
                        </legend>

                        <div
                            className="p-3 mb-3 border-start border-success border-4 rounded-end"
                            style={{ backgroundColor: '#f1f8e9' }}
                        >
                            <div>
                                <label htmlFor="cosmetic_announcement" className="form-label fw-semibold mb-1">
                                    Đối với Tinh dầu Mỹ phẩm (Dưỡng da, massage...):
                                </label>
                                <small className="d-block text-muted fst-italic mb-2">
                                    Yêu cầu: <strong>Phiếu công bố sản phẩm mỹ phẩm</strong> do Bộ/Sở Y tế cấp.
                                </small>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="cosmetic_announcement"
                                    name="cosmetic_announcement"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setCosmeticLicense(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        <div
                            className="p-3 mb-3 border-start border-success border-4 rounded-end"
                            style={{ backgroundColor: '#e8f5e9' }}
                        >
                            <div>
                                <label htmlFor="tccs_doc" className="form-label fw-semibold mb-1">
                                    Đối với Tinh dầu Xông phòng / Treo xe / Gia dụng:
                                </label>
                                <small className="d-block text-muted fst-italic mb-2">
                                    Yêu cầu: <strong>Bản tự công bố tiêu chuẩn cơ sở (TCCS)</strong> + Kết quả thử nghiệm thành phần (Quatest hoặc tương đương).
                                </small>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="tccs_doc"
                                    name="tccs_doc"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setTccsDoc(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="form-label fw-semibold mb-1">
                                Chứng từ chứng minh nguồn gốc hàng hóa (Chọn 1 trong các giấy tờ sau):{' '}
                                <span className="text-danger">*</span>
                            </label>
                            <small className="d-block text-danger fst-italic fw-medium mb-2">
                                Bắt buộc nộp Hóa đơn mua hàng / Giấy ủy quyền để chống hàng giả.
                            </small>

                            <div className="mt-2">
                                <label htmlFor="invoice_doc" className="form-label fw-normal small mb-1">
                                    Hóa đơn giá trị gia tăng (Hóa đơn VAT mua hàng) hoặc Tờ khai Hải quan (nếu nhập khẩu):
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="invoice_doc"
                                    name="invoice_doc"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setOriginInvoice(e.target.files?.[0] || null)}
                                    required
                                />
                            </div>

                            <div className="mt-3">
                                <label htmlFor="authorization_letter" className="form-label fw-normal small mb-1">
                                    Thư ủy quyền phân phối từ nhà máy/thương hiệu chính gốc (Nếu có):
                                </label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="authorization_letter"
                                    name="authorization_letter"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => setBrandAuthorization(e.target.files?.[0] || null)}
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* 3. Địa Chỉ Kho & Liên Hệ */}
                    <fieldset
                        className="border rounded-2 p-3 p-md-4 mb-4"
                        style={{ backgroundColor: '#fbfcfb' }}
                    >
                        <legend className="float-none w-auto px-2 fw-bold fs-5">
                            3. Địa Chỉ Kho & Liên Hệ
                        </legend>

                        <div className="mb-3">
                            <label htmlFor="phone" className="form-label fw-semibold">
                                Số Điện Thoại Nhận Đơn: <span className="text-danger">*</span>
                            </label>
                            <input
                                type="tel"
                                className="form-control"
                                id="phone"
                                name="phone"
                                value={shopPhone}
                                onChange={(e) => setShopPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="address_pickup" className="form-label fw-semibold">
                                Địa Chỉ Kho Lấy Hàng (Nơi lưu trữ tinh dầu): <span className="text-danger">*</span>
                            </label>
                            <textarea
                                id="address_pickup"
                                name="address_pickup"
                                className="form-control"
                                rows={2}
                                placeholder="Số nhà, tên đường, quận/huyện, tỉnh thành..."
                                value={warehouseAddress}
                                onChange={(e) => setWarehouseAddress(e.target.value)}
                                required
                            />
                            <small className="d-block text-muted fst-italic mt-1">
                                Lưu ý: Kho bảo quản cần khô ráo, tránh ánh nắng trực tiếp để không làm biến chất tinh dầu.
                            </small>
                        </div>
                    </fieldset>

                    {/* 4. Tài Khoản Nhận Tiền */}
                    <fieldset
                        className="border rounded-2 p-3 p-md-4 mb-4"
                        style={{ backgroundColor: '#fbfcfb' }}
                    >
                        <legend className="float-none w-auto px-2 fw-bold fs-5">
                            4. Tài Khoản Nhận Tiền
                        </legend>

                        <div className="mb-3">
                            <label htmlFor="bank_account_name" className="form-label fw-semibold">
                                Tên Chủ Tài Khoản: <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="bank_account_name"
                                name="bank_account_name"
                                placeholder="Ví dụ: NGUYEN VAN A"
                                value={accountHolder}
                                onChange={(e) => setAccountHolder(e.target.value)}
                                required
                            />
                        </div>

                        <div className="mb-2">
                            <label htmlFor="bank_account_number" className="form-label fw-semibold">
                                Số Tài Khoản Ngân Hàng: <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="bank_account_number"
                                name="bank_account_number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </div>
                    </fieldset>

                    <button
                        type="submit"
                        className="btn btn-danger w-100 py-3 fw-bold text-uppercase fs-6"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span
                                    className="spinner-border spinner-border-sm me-2"
                                    role="status"
                                    aria-hidden="true"
                                />
                                Đang gửi hồ sơ...
                            </>
                        ) : (
                            "Gửi Hồ Sơ Đăng Ký"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
