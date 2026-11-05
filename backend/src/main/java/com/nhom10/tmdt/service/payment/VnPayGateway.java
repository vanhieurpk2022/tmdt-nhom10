package com.nhom10.tmdt.service.payment;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigInteger;
import java.net.InetAddress;
import java.net.URI;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.text.Normalizer;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.HexFormat;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;

/** VNPay 2.1.0 protocol only. No database writes, servlet, session or secret logging. */
public final class VnPayGateway {
    public static final long MAX_AMOUNT_VND = 9_999_999_999L;
    private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private final String merchant;
    private final byte[] secret;
    private final URI payUrl;
    private final URI returnUrl;
    private final Clock clock;

    public VnPayGateway(String merchant, String secret, URI payUrl, URI returnUrl, Clock clock) {
        if (merchant == null || !merchant.matches("[A-Za-z0-9]{8}")) {
            throw new IllegalArgumentException("TmnCode must contain 8 ASCII alphanumeric characters");
        }
        if (secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("Missing hash secret");
        }
        validateUrl(payUrl, false);
        validateUrl(returnUrl, true);
        if (payUrl.getRawQuery() != null || returnUrl.toASCIIString().length() > 255) {
            throw new IllegalArgumentException("Invalid configured URL");
        }
        this.merchant = merchant;
        this.secret = secret.getBytes(StandardCharsets.UTF_8);
        this.payUrl = payUrl;
        this.returnUrl = returnUrl;
        this.clock = Objects.requireNonNull(clock);
    }

    /** Never use a timestamp alone; keep a unique database constraint as well. */
    public static String newTxnRef() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    /** Amount and expiry must come from a committed/committing server-side snapshot. */
    public String buildPaymentUrl(PaymentRequest request) {
        Objects.requireNonNull(request);
        String ref = checked(request.txnRef(), "[A-Za-z0-9]{1,100}", "txnRef");
        String locale = request.locale() == null ? "vn" : request.locale();
        checked(locale, "vn|en", "locale");
        // Adapter supplies an IP literal resolved using its trusted-proxy configuration.
        validateIp(request.ipAddress());
        Instant now = clock.instant().truncatedTo(ChronoUnit.SECONDS);
        Instant expiry = Objects.requireNonNull(request.expiresAt()).truncatedTo(ChronoUnit.SECONDS);
        if (!expiry.isAfter(now)) {
            throw new IllegalArgumentException("Payment window has expired");
        }
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", merchant);
        params.put("vnp_Amount", wireAmount(request.amountVnd()));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", ref);
        params.put("vnp_OrderInfo", orderInfo(request.orderInfo()));
        params.put("vnp_OrderType", "other");
        params.put("vnp_ReturnUrl", returnUrl.toASCIIString());
        params.put("vnp_IpAddr", request.ipAddress());
        params.put("vnp_CreateDate", DATE.format(now));
        params.put("vnp_ExpireDate", DATE.format(expiry));
        params.put("vnp_Locale", locale);
        if (request.bankCode() != null && !request.bankCode().isEmpty()) {
            params.put("vnp_BankCode", checked(request.bankCode(), "[A-Za-z0-9]{3,20}", "bankCode"));
        }
        String query = canonical(params);
        return payUrl.toASCIIString() + "?" + query + "&vnp_SecureHash="
                + HexFormat.of().formatHex(hmac(query));
    }

    /**
     * Supply the HTTP framework's UTF-8 query multimap decoded exactly once.
     * Reject malformed encoding before calling this method. Preserve duplicate keys.
     * The returned value proves protocol checks only, NOT an order payment: compare
     * against the immutable attempt under the database locks in VnPayPaymentService.
     */
    public Callback validateCallback(Map<String, String[]> decodedQuery) {
        Map<String, String> params = extract(decodedQuery);
        String hash = params.get("vnp_SecureHash");
        if (hash == null || !hash.matches("[0-9A-Fa-f]{128}")
                || !MessageDigest.isEqual(hmac(canonical(params)), HexFormat.of().parseHex(hash))) {
            throw new InvalidCallback("97", "Invalid signature");
        }
        if (!merchant.equals(params.get("vnp_TmnCode"))) {
            throw new InvalidCallback("97", "Invalid merchant");
        }
        String amount = required(params, "vnp_Amount", "[0-9]{1,12}", "04");
        BigInteger wire = new BigInteger(amount);
        if (wire.signum() <= 0 || !wire.mod(BigInteger.valueOf(100)).equals(BigInteger.ZERO)) {
            throw new InvalidCallback("04", "Invalid amount");
        }
        if (params.containsKey("vnp_CurrCode") && !"VND".equals(params.get("vnp_CurrCode"))) {
            throw new InvalidCallback("99", "Invalid currency");
        }
        String ref = required(params, "vnp_TxnRef", "[A-Za-z0-9]{1,100}", "99");
        required(params, "vnp_OrderInfo", "(?s).{1,255}", "99");
        return paymentResult(params, ref, wire.divide(BigInteger.valueOf(100)).longValueExact());
    }

    private Callback paymentResult(Map<String, String> params, String ref, long amountVnd) {
        String response = required(params, "vnp_ResponseCode", "[0-9]{2}", "99");
        String status = required(params, "vnp_TransactionStatus", "[0-9]{2}", "99");
        boolean success = "00".equals(response) && "00".equals(status);
        String transactionNo = params.get("vnp_TransactionNo");
        if (!success && (transactionNo == null || transactionNo.isEmpty())) transactionNo = "0";
        if (transactionNo == null || !transactionNo.matches("[0-9]{1,15}")
                || (success && new BigInteger(transactionNo).signum() <= 0)) {
            throw new InvalidCallback("99", "Invalid payment receipt");
        }
        String bank = params.get("vnp_BankCode");
        if (bank == null || bank.isEmpty()) {
            if (success) throw new InvalidCallback("99", "Missing payment bank");
            bank = null;
        } else if (!bank.matches("[A-Za-z0-9]{3,20}")) {
            throw new InvalidCallback("99", "Invalid payment bank");
        }
        String payDate = params.get("vnp_PayDate");
        if (payDate != null && !payDate.isEmpty() && !payDate.matches("[0-9]{14}")) {
            throw new InvalidCallback("99", "Invalid pay date");
        }
        return new Callback(ref, merchant, amountVnd,
                response, status, transactionNo, bank, payDate);
    }

    public static String wireAmount(long amountVnd) {
        if (amountVnd <= 0 || amountVnd > MAX_AMOUNT_VND) {
            throw new IllegalArgumentException("Amount must be positive integer VND within wire limit");
        }
        return Long.toString(Math.multiplyExact(amountVnd, 100));
    }

    public Map<String, String> buildQueryRequest(String ref, Instant createdAt, String ip) {
        checked(ref, "[A-Za-z0-9]{1,100}", "txnRef");
        validateIp(ip);
        Map<String, String> request = new java.util.LinkedHashMap<>();
        request.put("vnp_RequestId", newTxnRef());
        request.put("vnp_Version", "2.1.0");
        request.put("vnp_Command", "querydr");
        request.put("vnp_TmnCode", merchant);
        request.put("vnp_TxnRef", ref);
        request.put("vnp_TransactionDate", DATE.format(createdAt));
        request.put("vnp_CreateDate", DATE.format(clock.instant()));
        request.put("vnp_IpAddr", ip);
        request.put("vnp_OrderInfo", "Tra cuu giao dich " + ref);
        request.put("vnp_SecureHash", HexFormat.of().formatHex(hmac(String.join("|", request.values()))));
        return request;
    }

    public Optional<Callback> validateQueryResponse(Map<String, String> response, String ref, long amountVnd) {
        if (!"00".equals(response.get("vnp_ResponseCode"))) return Optional.empty();
        validateApiSignature(response);
        if (!merchant.equals(response.get("vnp_TmnCode")) || !ref.equals(response.get("vnp_TxnRef"))
                || !"querydr".equals(response.get("vnp_Command"))) {
            throw new InvalidCallback("97", "Invalid QueryDR reference or merchant");
        }
        String amount = required(response, "vnp_Amount", "[0-9]{1,12}", "04");
        if (!new BigInteger(amount).equals(new BigInteger(wireAmount(amountVnd)))) {
            throw new InvalidCallback("04", "QueryDR amount mismatch");
        }
        if (!"01".equals(response.get("vnp_TransactionType"))
                || !("00".equals(response.get("vnp_TransactionStatus"))
                || "02".equals(response.get("vnp_TransactionStatus")))) return Optional.empty();
        return Optional.of(paymentResult(response, ref, amountVnd));
    }

    private void validateApiSignature(Map<String, String> response) {
        String data = java.util.stream.Stream.of("vnp_ResponseId", "vnp_Command", "vnp_ResponseCode",
                        "vnp_Message", "vnp_TmnCode", "vnp_TxnRef", "vnp_Amount", "vnp_BankCode", "vnp_PayDate",
                        "vnp_TransactionNo", "vnp_TransactionType", "vnp_TransactionStatus", "vnp_OrderInfo")
                .map(key -> Objects.toString(response.get(key), "")).collect(Collectors.joining("|"));
        data += "|" + Objects.toString(response.get("vnp_PromotionCode"), "")
                + "|" + Objects.toString(response.get("vnp_PromotionAmount"), "");
        String hash = response.get("vnp_SecureHash");
        if (hash == null || !hash.matches("[0-9A-Fa-f]{128}")
                || !MessageDigest.isEqual(hmac(data), HexFormat.of().parseHex(hash))) {
            throw new InvalidCallback("97", "Invalid VNPay API signature");
        }
    }

    /** Sorted UTF-8 form encoding; exclude hash metadata and empty values. */
    static String canonical(Map<String, String> params) {
        return new TreeMap<>(params).entrySet().stream()
                .filter(e -> e.getKey().startsWith("vnp_"))
                .filter(e -> !e.getKey().equals("vnp_SecureHash") && !e.getKey().equals("vnp_SecureHashType"))
                .filter(e -> e.getValue() != null && !e.getValue().isEmpty())
                .map(e -> encode(e.getKey()) + "=" + encode(e.getValue()))
                .collect(Collectors.joining("&"));
    }

    private static Map<String, String> extract(Map<String, String[]> query) {
        if (query == null || query.isEmpty() || query.size() > 64) {
            throw new InvalidCallback("99", "Invalid query");
        }
        Map<String, String> params = new TreeMap<>();
        int length = 0;
        for (var entry : query.entrySet()) {
            String key = entry.getKey();
            if (key == null || !key.startsWith("vnp_")) continue;
            String[] values = entry.getValue();
            if (!key.matches("vnp_[A-Za-z0-9_]{1,64}") || values == null
                    || values.length != 1 || values[0] == null) {
                throw new InvalidCallback("99", "Ambiguous query parameter");
            }
            length += key.length() + values[0].length();
            if (length > 16_384) throw new InvalidCallback("99", "Query too large");
            params.put(key, values[0]);
        }
        return params;
    }

    private byte[] hmac(String input) {
        try {
            Mac mac = Mac.getInstance("HmacSHA512");
            mac.init(new SecretKeySpec(secret, "HmacSHA512"));
            return mac.doFinal(input.getBytes(StandardCharsets.UTF_8));
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("HMAC unavailable", e);
        }
    }

    private static String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private static String orderInfo(String value) {
        String text = value == null ? "" : value.replace('đ', 'd').replace('Đ', 'D');
        text = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}+", "")
                .replaceAll("[^A-Za-z0-9 ]", " ").replaceAll(" +", " ").trim();
        return text.isEmpty() ? "Thanh toan don hang" : text.substring(0, Math.min(text.length(), 255));
    }

    private static String checked(String value, String regex, String name) {
        if (value == null || !value.matches(regex)) throw new IllegalArgumentException("Invalid " + name);
        return value;
    }

    private static void validateIp(String value) {
        checked(value, "[0-9A-Fa-f:.]{3,45}", "IP literal");
        if (value.contains(":")) {
            // A colon-containing numeric literal cannot trigger a DNS name lookup.
            try { InetAddress.getByName(value); return; }
            catch (UnknownHostException e) { throw new IllegalArgumentException("Invalid IPv6 literal"); }
        }
        String[] parts = value.split("\\.", -1);
        if (parts.length != 4) throw new IllegalArgumentException("Invalid IPv4 literal");
        for (String part : parts) {
            if (!part.matches("[0-9]{1,3}") || Integer.parseInt(part) > 255) {
                throw new IllegalArgumentException("Invalid IPv4 literal");
            }
        }
    }

    private static String required(Map<String, String> params, String key, String regex, String ack) {
        String value = params.get(key);
        if (value == null || !value.matches(regex)) throw new InvalidCallback(ack, "Invalid " + key);
        return value;
    }

    private static void validateUrl(URI uri, boolean localAllowed) {
        Objects.requireNonNull(uri);
        boolean local = localAllowed && "http".equals(uri.getScheme())
                && ("localhost".equals(uri.getHost()) || "127.0.0.1".equals(uri.getHost()));
        if (uri.getHost() == null || uri.getRawUserInfo() != null || uri.getRawFragment() != null
                || (!"https".equals(uri.getScheme()) && !local)) {
            throw new IllegalArgumentException("Expected trusted HTTPS URL (HTTP loopback Return allowed)");
        }
    }

    public record PaymentRequest(String txnRef, long amountVnd, String orderInfo, String ipAddress,
                                 String locale, String bankCode, Instant expiresAt) {}

    public record Callback(String txnRef, String merchantCode, long amountVnd, String responseCode,
                           String transactionStatus, String transactionNo, String bankCode, String payDate) {
        public boolean successful() {
            return "00".equals(responseCode) && "00".equals(transactionStatus);
        }
        public boolean failed() {
            return "02".equals(transactionStatus)
                    && Set.of("00", "09", "10", "11", "12", "13", "24", "51", "65", "75", "79").contains(responseCode);
        }
    }

    /** Application adapter maps this to IPN JSON, without exposing raw input. */
    public static final class InvalidCallback extends IllegalArgumentException {
        private final String rspCode;
        public InvalidCallback(String rspCode, String message) {
            super(message);
            this.rspCode = rspCode;
        }
        public String rspCode() { return rspCode; }
    }
}
