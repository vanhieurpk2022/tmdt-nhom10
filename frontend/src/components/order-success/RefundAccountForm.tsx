import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuildingColumns } from "@fortawesome/free-solid-svg-icons";
import type { RefundBankAccount } from "../../api/RefundService";
import { refundBanks, refundAccountHolderPattern, refundAccountNumberPattern } from "../../data/refundData";

interface RefundAccountFormProps {
    value: RefundBankAccount;
    onChange: (value: RefundBankAccount) => void;
    disabled: boolean;
    recipientName: string;
    phoneNumber: string;
}

export default function RefundAccountForm({ value, onChange, disabled, recipientName, phoneNumber }: RefundAccountFormProps) {
    const [touched, setTouched] = useState({ number: false, holder: false });
    const invalidNumber = touched.number && !refundAccountNumberPattern.test(value.accountNumber.trim());
    const invalidHolder = touched.holder && !refundAccountHolderPattern.test(value.accountHolder.trim());

    return <>
        <section className="account-panel mt-3" aria-labelledby="refund-account-title">
            <h2 className="h6 fw-semibold mb-2" id="refund-account-title">Phương thức nhận hoàn tiền</h2>
            <p className="small text-secondary border-bottom pb-3 mb-3">Đơn hàng đã thanh toán thành công qua VNPay.</p>
            <fieldset disabled={disabled}>
                <legend className="visually-hidden">Tài khoản ngân hàng nhận hoàn tiền</legend>
                <div className="account-choice border rounded-3 px-3 py-2 d-flex align-items-center gap-2 mb-3">
                    <input className="form-check-input m-0" type="radio" name="refund-method" checked readOnly aria-label="Chuyển khoản ngân hàng" />
                    <FontAwesomeIcon icon={faBuildingColumns} className="text-secondary" aria-hidden="true" />
                    <span className="fw-medium">Chuyển khoản ngân hàng</span>
                </div>
                <div className="mb-3">
                    <label className="form-label" htmlFor="refund-bank">Ngân hàng <span className="text-danger">*</span></label>
                    <select id="refund-bank" className="form-select" required value={value.bankName} onChange={event => onChange({ ...value, bankName: event.target.value })}>
                        <option value="" disabled>Chọn ngân hàng</option>
                        {refundBanks.map(bank => <option key={bank} value={bank}>{bank}</option>)}
                    </select>
                </div>
                <div className="row g-3">
                    <div className="col-12 col-sm-6">
                        <label className="form-label" htmlFor="refund-account-number">Số tài khoản <span className="text-danger">*</span></label>
                        <input id="refund-account-number" className={`form-control${invalidNumber ? " is-invalid" : ""}`} type="text" inputMode="numeric"
                            placeholder="Nhập số tài khoản" required minLength={4} maxLength={30} pattern={refundAccountNumberPattern.source} autoComplete="off"
                            aria-invalid={invalidNumber} aria-describedby={invalidNumber ? "refund-number-error" : undefined} value={value.accountNumber}
                            onChange={event => onChange({ ...value, accountNumber: event.target.value })}
                            onBlur={() => { setTouched(current => ({ ...current, number: true })); onChange({ ...value, accountNumber: value.accountNumber.trim() }); }} />
                        {invalidNumber && <div className="invalid-feedback" id="refund-number-error">Nhập từ 4 đến 30 chữ số.</div>}
                    </div>
                    <div className="col-12 col-sm-6">
                        <label className="form-label" htmlFor="refund-account-holder">Tên chủ tài khoản <span className="text-danger">*</span></label>
                        <input id="refund-account-holder" className={`form-control${invalidHolder ? " is-invalid" : ""}`} type="text" placeholder="Họ tên không dấu"
                            required minLength={2} maxLength={120} pattern={refundAccountHolderPattern.source} autoComplete="name"
                            aria-invalid={invalidHolder} aria-describedby={invalidHolder ? "refund-holder-error" : undefined} value={value.accountHolder}
                            onChange={event => onChange({ ...value, accountHolder: event.target.value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "D").toUpperCase() })}
                            onBlur={() => { setTouched(current => ({ ...current, holder: true })); onChange({ ...value, accountHolder: value.accountHolder.trim().replace(/\s+/g, " ") }); }} />
                        {invalidHolder && <div className="invalid-feedback" id="refund-holder-error">Nhập họ tên không dấu, chỉ gồm chữ và dấu cách.</div>}
                    </div>
                </div>
            </fieldset>
            <div className="d-flex flex-wrap justify-content-between gap-2 small border-top mt-3 pt-3">
                <span className="text-secondary">Liên hệ về yêu cầu</span>
                <strong className="fw-medium text-break">{recipientName} · {phoneNumber}</strong>
            </div>
            <p className="small text-secondary mt-2 mb-0">Kiểm tra chính xác tài khoản nhận tiền. Không cung cấp mật khẩu, mã PIN hoặc OTP.</p>
        </section>
        <label className="d-flex align-items-start gap-2 small mt-3">
            <input className="form-check-input flex-shrink-0" id="refund-account-confirmed" type="checkbox" required disabled={disabled}
                checked={value.confirmed} onChange={event => onChange({ ...value, confirmed: event.target.checked })} />
            <span>Tôi xác nhận thông tin đã cung cấp là chính xác và đồng ý để Oilia liên hệ xác minh yêu cầu.</span>
        </label>
    </>;
}
