package com.nhom10.tmdt.service.shipping;

import com.nhom10.tmdt.dto.shipping.GhnDistrictResponse;
import com.nhom10.tmdt.dto.shipping.GhnProvinceResponse;
import com.nhom10.tmdt.dto.shipping.GhnResolvedAddress;
import com.nhom10.tmdt.dto.shipping.GhnWardResponse;
import com.nhom10.tmdt.model.Address;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.function.Function;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class GhnLocationResolver {

    private static final Pattern DIACRITIC_PATTERN = Pattern.compile("\\p{M}");
    private static final List<String> ADMINISTRATIVE_PREFIXES = List.of(
            "thanh pho",
            "thi tran",
            "thi xa",
            "phuong",
            "huyen",
            "quan",
            "tinh",
            "xa",
            "tp"
    );

    private final GhnShippingClient ghnShippingClient;

    public GhnResolvedAddress resolve(Address address) {
        if (isBlank(address.getCity()) || isBlank(address.getDistrict()) || isBlank(address.getWard())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Địa chỉ giao hàng chưa đủ tỉnh, quận/huyện và phường/xã");
        }

        GhnProvinceResponse province = matchByName(
                ghnShippingClient.getProvinces(),
                GhnProvinceResponse::provinceName,
                address.getCity(),
                "tỉnh/thành phố"
        );
        GhnDistrictResponse district = matchByName(
                ghnShippingClient.getDistricts(province.provinceId()),
                GhnDistrictResponse::districtName,
                address.getDistrict(),
                "quận/huyện"
        );
        GhnWardResponse ward = matchByName(
                ghnShippingClient.getWards(district.districtId()),
                GhnWardResponse::wardName,
                address.getWard(),
                "phường/xã"
        );

        return new GhnResolvedAddress(province.provinceId(), district.districtId(), ward.wardCode());
    }

    private <T> T matchByName(List<T> values, Function<T, String> nameGetter, String targetName, String locationType) {
        String normalizedTarget = normalizeLocationName(targetName);

        return values.stream()
                .filter(value -> {
                    String candidate = normalizeLocationName(nameGetter.apply(value));
                    return candidate.equals(normalizedTarget)
                            || candidate.contains(normalizedTarget)
                            || normalizedTarget.contains(candidate);
                })
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Không tìm thấy " + locationType + " trên GHN: " + targetName
                ));
    }

    private String normalizeLocationName(String value) {
        if (value == null) {
            return "";
        }

        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        normalized = DIACRITIC_PATTERN.matcher(normalized).replaceAll("");
        normalized = normalized.replace('đ', 'd').replace('Đ', 'D');
        normalized = normalized.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9\\s]", " ");

        for (String prefix : ADMINISTRATIVE_PREFIXES) {
            normalized = normalized.replaceAll("\\b" + prefix + "\\b", " ");
        }

        return normalized.replaceAll("\\s+", " ").trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
