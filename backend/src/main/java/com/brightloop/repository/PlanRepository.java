package com.brightloop.repository;

import com.brightloop.entity.Plan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanRepository extends JpaRepository<Plan, Long> {

    @Query("SELECT p FROM Plan p WHERE " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:frequency IS NULL OR p.billingFrequency = :frequency) AND " +
           "(:status IS NULL OR p.status = :status)")
    Page<Plan> searchPlans(
            @Param("query") String query,
            @Param("frequency") String frequency,
            @Param("status") String status,
            Pageable pageable
    );

    List<Plan> findByStatus(String status);
    List<Plan> findByProductId(Long productId);
    long countByStatus(String status);
}
