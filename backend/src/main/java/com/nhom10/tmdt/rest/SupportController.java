package com.nhom10.tmdt.rest;

import com.nhom10.tmdt.dto.ApiResponse;
import com.nhom10.tmdt.model.*;
import com.nhom10.tmdt.repo.*;
import com.nhom10.tmdt.security.FactoryAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.*;

@RestController @RequiredArgsConstructor
public class SupportController {
    private final SupportTicketRepository tickets;
    private final OrderRepository orders;
    private final FactoryAccess access;
    public record CreateTicket(@NotNull @Positive Long orderId, @NotBlank @Size(min = 3, max = 150) String title,
                               @NotBlank @Size(min = 10, max = 3000) String message) {}
    public record UpdateTicket(@NotBlank @Size(max = 3000) String reply, @Pattern(regexp = "PENDING|PROCESSING|RESOLVED|CLOSED") String status) {}
    public record Ticket(Long id, Long orderId, String customerName, String factoryName, String title,
                         String message, String reply, String status, LocalDateTime createdAt) {}
    private Ticket dto(SupportTicket t) { return new Ticket(t.getId(), t.getOrder().getId(), t.getUser().getFullname(),
            t.getFactory().getName(), t.getTitle(), t.getMessage(), t.getReply(), t.getStatus(), t.getCreatedAt()); }

    @GetMapping("/support/tickets") @Transactional(readOnly = true)
    public ApiResponse<List<Ticket>> mine(Principal principal) {
        return new ApiResponse<>(200, "Yêu cầu hỗ trợ", tickets.findByUserEmailOrderByIdDesc(principal.getName()).stream().map(this::dto).toList());
    }
    @GetMapping("/manager/support/tickets") @Transactional(readOnly = true)
    public ApiResponse<List<Ticket>> factory() {
        return new ApiResponse<>(200, "Yêu cầu của xưởng", tickets.findByFactoryIdOrderByIdDesc(access.currentUser().getFactory().getId()).stream().map(this::dto).toList());
    }
    @GetMapping("/admin/support/tickets") @Transactional(readOnly = true)
    public ApiResponse<List<Ticket>> all() {
        return new ApiResponse<>(200, "Yêu cầu hỗ trợ", tickets.findAll().stream().sorted(Comparator.comparing(SupportTicket::getId).reversed()).map(this::dto).toList());
    }
    @PostMapping("/support/tickets") @Transactional
    public ApiResponse<Ticket> create(@Valid @RequestBody CreateTicket request, Principal principal) {
        Order order = orders.findByIdAndUserEmail(request.orderId(), principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy đơn của bạn"));
        var factories = order.getOrderItems().stream().map(OrderItem::getProduct).filter(Objects::nonNull)
                .map(Product::getFactory).filter(Objects::nonNull).distinct().toList();
        if (factories.size() != 1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đơn cũ có nhiều xưởng cần quản trị viên kiểm tra riêng");
        var ticket = SupportTicket.builder().user(order.getUser()).order(order).factory(factories.getFirst())
                .title(request.title().trim()).message(request.message().trim()).status("PENDING")
                .createdAt(LocalDateTime.now()).updatedAt(LocalDateTime.now()).build();
        return new ApiResponse<>(201, "Đã gửi yêu cầu hỗ trợ", dto(tickets.save(ticket)));
    }
    @PatchMapping({"/admin/support/tickets/{id}", "/manager/support/tickets/{id}"}) @Transactional
    public ApiResponse<Ticket> reply(@PathVariable Long id, @Valid @RequestBody UpdateTicket request) {
        var ticket = tickets.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        boolean admin = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!admin && !ticket.getFactory().getId().equals(access.currentUser().getFactory().getId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        ticket.setReply(request.reply().trim());
        ticket.setStatus(request.status() == null ? "PROCESSING" : request.status());
        ticket.setUpdatedAt(LocalDateTime.now());
        return new ApiResponse<>(200, "Đã lưu phản hồi", dto(tickets.save(ticket)));
    }
}
