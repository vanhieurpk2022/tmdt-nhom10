package com.nhom10.tmdt.service.payment;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.nio.charset.*;
import java.util.*;

/** Parse raw query once; Servlet parameter decoding can silently replace malformed UTF-8. */
public final class VnPayQueryParser {
    private VnPayQueryParser() {}
    public static Map<String, String[]> parse(String raw) {
        if (raw == null || raw.isEmpty() || raw.length() > 16_384) throw invalid();
        String[] fields = raw.split("&", -1);
        if (fields.length > 64) throw invalid();
        Map<String, String[]> result = new HashMap<>();
        for (String field : fields) {
            int separator = field.indexOf('=');
            if (separator < 1) throw invalid();
            String key = decode(field.substring(0, separator));
            String value = decode(field.substring(separator + 1));
            if (!key.startsWith("vnp_")) continue;
            if (!key.matches("vnp_[A-Za-z0-9_]{1,64}") || result.putIfAbsent(key, new String[]{value}) != null) {
                throw invalid();
            }
        }
        return result;
    }

    private static String decode(String value) {
        ByteArrayOutputStream bytes = new ByteArrayOutputStream();
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c == '%') {
                if (i + 2 >= value.length()) throw invalid();
                int a = Character.digit(value.charAt(++i), 16);
                int b = Character.digit(value.charAt(++i), 16);
                if (a < 0 || b < 0) throw invalid();
                bytes.write(a * 16 + b);
            } else {
                if (c > 127 || c < 32) throw invalid();
                bytes.write(c == '+' ? ' ' : c);
            }
        }
        try {
            return StandardCharsets.UTF_8.newDecoder().onMalformedInput(CodingErrorAction.REPORT)
                    .onUnmappableCharacter(CodingErrorAction.REPORT).decode(ByteBuffer.wrap(bytes.toByteArray())).toString();
        } catch (CharacterCodingException ex) { throw invalid(); }
    }

    private static VnPayGateway.InvalidCallback invalid() {
        return new VnPayGateway.InvalidCallback("99", "Malformed or ambiguous query");
    }
}
