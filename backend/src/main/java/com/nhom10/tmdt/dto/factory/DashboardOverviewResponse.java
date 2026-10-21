package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.CancelReason;
import com.nhom10.tmdt.enums.RevenueType;

import java.util.List;

public record DashboardOverviewResponse(
        Summary summary,
        Cancellation cancellation,
        Revenue revenue
) {
    public record Summary(
            int newOrders,
            double onTimeDeliveryRate,
            double ratingAverage,
            int ratingCount,
            int openDisputes
    ) {}

    public record Cancellation(double rate, double limit, List<ReasonCount> reasons) {}

    public record ReasonCount(CancelReason code, long count) {}

    public record Revenue(long total, List<AmountItem> breakdown) {}

    public record AmountItem(RevenueType code, long amount) {}
}