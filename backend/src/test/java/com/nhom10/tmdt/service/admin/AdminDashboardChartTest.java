package com.nhom10.tmdt.service.admin;

import com.nhom10.tmdt.dto.admin.dashboard.AdminBarChartItemDto;
import com.nhom10.tmdt.enums.OrderStatus;
import com.nhom10.tmdt.model.Order;
import com.nhom10.tmdt.model.OrderItem;
import com.nhom10.tmdt.repo.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AdminDashboardChartTest {
    private final OrderRepository orders = mock(OrderRepository.class);
    private final AdminDashboardServiceImp service = new AdminDashboardServiceImp(orders, null, null, null, null, null);

    private Order order(String time, double amount, int quantity) {
        return Order.builder().createdAt(LocalDateTime.parse(time)).status(OrderStatus.DELIVERED)
                .totalPrice(amount).orderItems(List.of(OrderItem.builder().quantity(quantity)
                        .unitPrice(amount / quantity).build())).build();
    }

    @Test void oneDayHas24HoursIncludingMidnightAndLastHour() {
        LocalDate day = LocalDate.of(2026, 11, 28);
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of(
                order("2026-11-28T00:00:00", 100000, 1), order("2026-11-28T23:59:59", 200000, 2)));
        var result = service.getBarChartStats(day, day, null, null);
        assertEquals("HOUR", result.getGroupBy());
        assertEquals(24, result.getItems().size());
        assertEquals("00:00", result.getItems().getFirst().getLabel());
        assertEquals(100000, result.getItems().getFirst().getRevenue());
        assertEquals(200000, result.getItems().getLast().getRevenue());
        assertEquals(0, result.getItems().get(12).getOrderCount());
        assertEquals(300000, result.getTotalPeriodRevenue());
        verify(orders).findAllOrdersInDateRange(day.atStartOfDay(), day.atTime(LocalTime.MAX));
    }

    @Test void multipleDaysHaveDailyColumnsAndNoMissingEmptyDays() {
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of(order("2026-01-02T15:00:00", 90000, 3)));
        var result = service.getBarChartStats(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), null, " ");
        assertEquals("DAY", result.getGroupBy());
        assertEquals(31, result.getItems().size());
        assertEquals("02/01", result.getItems().get(1).getLabel());
        assertEquals(0, result.getItems().getFirst().getOrderCount());
        assertEquals(3, result.getTotalPeriodQuantity());
    }

    @Test void multipleMonthsAcrossNewYearStaySeparateAndUseOnlySelectedDates() {
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of(
                order("2025-11-01T12:00:00", 999999, 1), // Ngoài khoảng chọn.
                order("2025-11-15T12:00:00", 100000, 1),
                order("2026-01-01T12:00:00", 200000, 2),
                order("2026-02-10T23:59:59", 300000, 3),
                order("2026-02-11T00:00:00", 999999, 1)));
        var result = service.getBarChartStats(LocalDate.of(2025, 11, 15), LocalDate.of(2026, 2, 10), null, null);
        assertEquals("MONTH", result.getGroupBy());
        assertEquals(List.of("11/2025", "12/2025", "01/2026", "02/2026"),
                result.getItems().stream().map(AdminBarChartItemDto::getLabel).toList());
        assertEquals(0, result.getItems().get(1).getOrderCount());
        assertEquals(600000, result.getTotalPeriodRevenue());
        assertEquals(3, result.getTotalPeriodOrders());
    }

    @Test void oneLeapYearIsMonthlyAndMultipleYearsAreYearly() {
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of());
        var leapYear = service.getBarChartStats(LocalDate.of(2024, 1, 1), LocalDate.of(2024, 12, 31), null, null);
        assertEquals("MONTH", leapYear.getGroupBy());
        assertEquals(12, leapYear.getItems().size());

        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of(
                order("2023-02-01T12:00:00", 100000, 1), order("2025-12-31T23:59:59", 300000, 3)));
        var years = service.getBarChartStats(LocalDate.of(2023, 1, 1), LocalDate.of(2025, 12, 31), null, null);
        assertEquals("YEAR", years.getGroupBy());
        assertEquals(List.of("2023", "2024", "2025"), years.getItems().stream().map(AdminBarChartItemDto::getLabel).toList());
        assertEquals(0, years.getItems().get(1).getRevenue());
        assertEquals(400000, years.getItems().stream().mapToDouble(AdminBarChartItemDto::getRevenue).sum());
        assertEquals(400000, years.getTotalPeriodRevenue());
    }

    @Test void allHistoryStartsAtTheEarliestOrderInsteadOfTruncatingToTwoYears() {
        LocalDate firstDate = LocalDate.now().minusYears(7).withDayOfYear(1);
        when(orders.findEarliestOrderTime()).thenReturn(firstDate.atTime(9, 0));
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of(
                order(firstDate + "T09:00:00", 500000, 5)));
        var result = service.getBarChartStats(null, null, "all", null);
        assertEquals(firstDate, result.getFromDate());
        assertEquals("YEAR", result.getGroupBy());
        assertEquals(8, result.getItems().size());
        assertEquals(500000, result.getItems().getFirst().getRevenue());
        assertEquals(500000, result.getTotalPeriodRevenue());
    }

    @Test void emptyHistoryUsesAShortEmptyRangeAnd90DaysGroupsByMonth() {
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of());
        var empty = service.getBarChartStats(null, null, "all", null);
        assertEquals(7, empty.getItems().size());
        assertEquals(0, empty.getTotalPeriodOrders());
        var ninetyDays = service.getBarChartStats(null, null, "90days", null);
        assertEquals("MONTH", ninetyDays.getGroupBy());
    }

    @Test void explicitGroupingStillWorksAndExplicitDatesTakePriorityOverPreset() {
        when(orders.findAllOrdersInDateRange(any(), any())).thenReturn(List.of());
        var result = service.getBarChartStats(LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 2), "all", "MONTH");
        assertEquals("MONTH", result.getGroupBy());
        assertEquals(1, result.getItems().size());
        verify(orders, never()).findEarliestOrderTime();
    }

    @Test void invalidRangesAndGroupingReturn400WithoutQueryingOrders() {
        LocalDate day = LocalDate.of(2026, 1, 1);
        for (Runnable request : List.<Runnable>of(
                () -> service.getBarChartStats(day, day.minusDays(1), null, null),
                () -> service.getBarChartStats(day, null, null, null),
                () -> service.getBarChartStats(day, day, null, "invalid"))) {
            var error = assertThrows(ResponseStatusException.class, request::run);
            assertEquals(400, error.getStatusCode().value());
        }
        verifyNoInteractions(orders);
    }
}
