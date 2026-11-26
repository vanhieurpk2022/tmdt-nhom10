package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "support_ticket")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class SupportTicket {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(nullable = false) private Order order;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(nullable = false) private Factory factory;
    @Column(length = 150, nullable = false) private String title;
    @Column(length = 3000, nullable = false) private String message;
    @Column(length = 3000) private String reply;
    @Column(length = 20, nullable = false) private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
