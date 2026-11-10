import type { RefundBankAccount } from "../api/RefundService";

export const refundBanks = [
    "ABBANK", "ACB", "Agribank", "BacABank", "BaoVietBank", "BIDC", "BIDV", "BNP HCM", "BNP HN", "BOCHK",
    "BSP", "CBBank", "CIMB", "Citibank", "COOPBANK", "CUBHCM", "DBSBank", "ESUN", "Eximbank", "GPBank",
    "HDBank", "HongLeong", "HSBC", "IBKHCM", "IBKHN", "ICBC", "IndovinaBank", "KBank", "KEBHANAHN", "KEBHanaHCM",
    "KienLongBank", "KookminHCM", "KookminHN", "LPBank", "MBBank", "MBV", "MSB", "NamABank", "NCB", "Nonghyup",
    "OCB", "PGBank", "PublicBank", "PVcomBank", "Sacombank", "SaigonBank", "SCB", "SeABank", "SHB", "ShinhanBank",
    "StandardChartered", "Techcombank", "TPBank", "UnitedOverseas", "VBSP", "VIB", "VietABank", "VietBank",
    "VietCapitalBank", "Vietcombank", "VietinBank", "Vikki", "VPBank", "VRB", "Woori",
];

export const refundAccountNumberPattern = /^[0-9]{4,30}$/;
export const refundAccountHolderPattern = /^[A-Z][A-Z ]{1,119}$/;

export function isRefundAccountValid(account: RefundBankAccount) {
    return Boolean(account.bankName.trim()) && refundAccountNumberPattern.test(account.accountNumber.trim())
        && refundAccountHolderPattern.test(account.accountHolder.trim()) && account.confirmed;
}
