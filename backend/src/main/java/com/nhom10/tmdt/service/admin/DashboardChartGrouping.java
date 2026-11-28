package com.nhom10.tmdt.service.admin;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

/** Chọn độ chi tiết theo khoảng xem, rồi dùng cùng một mốc cho cột trống và đơn hàng. */
enum DashboardChartGrouping {
    HOUR("uuuu-MM-dd'T'HH:00", "HH:00"),
    DAY("uuuu-MM-dd", "dd/MM"),
    MONTH("uuuu-MM", "MM/uuuu"),
    YEAR("uuuu", "uuuu");

    private final DateTimeFormatter keyFormat;
    private final DateTimeFormatter labelFormat;

    DashboardChartGrouping(String keyPattern, String labelPattern) {
        keyFormat = DateTimeFormatter.ofPattern(keyPattern);
        labelFormat = DateTimeFormatter.ofPattern(labelPattern);
    }

    static DashboardChartGrouping resolve(LocalDate from, LocalDate to, String requested) {
        if (requested != null && !requested.isBlank() && !"AUTO".equalsIgnoreCase(requested.trim())) {
            try {
                return valueOf(requested.trim().toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn vị biểu đồ không hợp lệ");
            }
        }
        long days = ChronoUnit.DAYS.between(from, to) + 1;
        if (days == 1) return HOUR;
        if (days <= 31) return DAY;
        // So sánh theo lịch để một năm nhuận vẫn được chia thành các tháng.
        if (to.isBefore(from.plusYears(1))) return MONTH;
        return YEAR;
    }

    LocalDateTime startOfBucket(LocalDateTime time) {
        return switch (this) {
            case HOUR -> time.truncatedTo(ChronoUnit.HOURS);
            case DAY -> time.toLocalDate().atStartOfDay();
            case MONTH -> time.toLocalDate().withDayOfMonth(1).atStartOfDay();
            case YEAR -> time.toLocalDate().withDayOfYear(1).atStartOfDay();
        };
    }

    LocalDateTime next(LocalDateTime time) {
        return switch (this) {
            case HOUR -> time.plusHours(1);
            case DAY -> time.plusDays(1);
            case MONTH -> time.plusMonths(1);
            case YEAR -> time.plusYears(1);
        };
    }

    String key(LocalDateTime time) { return startOfBucket(time).format(keyFormat); }
    String label(LocalDateTime time) { return startOfBucket(time).format(labelFormat); }
}
