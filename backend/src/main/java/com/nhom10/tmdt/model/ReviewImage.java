package com.nhom10.tmdt.model;

import jakarta.persistence.*;
import lombok.*;

import javax.annotation.processing.Generated;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_image")
@Getter
@Setter
@ToString
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id")
    private Review review;

    @Column(name="image_url")
    private String imageUrl;

    @Column(name="updated_at")
    private LocalDateTime updatedAt;
}
