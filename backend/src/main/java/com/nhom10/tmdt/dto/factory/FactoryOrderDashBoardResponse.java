package com.nhom10.tmdt.dto.factory;

import com.nhom10.tmdt.enums.OrderStatus;

public record FactoryOrderDashBoardResponse(Long idOrder,
                                    String time,
                                    String userName,
                                    int totalQuantity,
                                    double price,
                                    String notes,
                                    OrderStatus status) {
}
