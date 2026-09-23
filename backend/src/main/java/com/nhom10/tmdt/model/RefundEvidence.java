package com.nhom10.tmdt.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Entity
@Table(name="refund_evidence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundEvidence {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // @ManyToOne
    // @JoinColumn(name = "refund_id", nullable = false)
    //private Refund refund;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "size")
    private Long size;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;
}
