package com.nhom10.tmdt.repo;

import com.nhom10.tmdt.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(path = "review")
public interface ReviewRepository extends JpaRepository<Review,Long> {
    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        JOIN r.product p
        WHERE p.factory.id = :factoryId
        """)
    Double findAverageRatingByFactoryId(
            @Param("factoryId") Long factoryId
    );

    @Query("""
        SELECT COUNT(r)
        FROM Review r
        JOIN r.product p
        WHERE p.factory.id = :factoryId
        """)
    long countByFactoryId(
            @Param("factoryId") Long factoryId
    );
}
