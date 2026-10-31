package com.brightloop.repository;

import com.brightloop.entity.DiscountUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscountUsageRepository extends JpaRepository<DiscountUsage, Long> {
    List<DiscountUsage> findByDiscountId(Long discountId);
    List<DiscountUsage> findByCustomerId(Long customerId);
    long countByDiscountId(Long discountId);
}
