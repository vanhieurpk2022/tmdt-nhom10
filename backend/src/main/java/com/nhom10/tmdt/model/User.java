package com.nhom10.tmdt.model;

import com.nhom10.tmdt.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import javax.management.relation.Role;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name="user")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private Long id;
    private String username;
    private String password;
    private String email;
    private String phone;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    @Column(name="created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "User", cascade = {CascadeType.ALL})
    private List<Address> address;

    @OneToOne(mappedBy = "user",cascade = CascadeType.ALL)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="factory_id", nullable = true)
    private Factory factory;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;
    // set up sau
   //@Enumerated(EnumType.STRING)
    //private Role Role;
}
