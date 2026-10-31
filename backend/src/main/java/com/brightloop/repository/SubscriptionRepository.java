package com.brightloop.repository;

import com.brightloop.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    Optional<Subscription> findBySubscriptionNumber(String subscriptionNumber);
    List<Subscription> findByCustomerId(Long customerId);
    List<Subscription> findByPlanId(Long planId);
    long countByPlanIdAndStatus(Long planId, String status);
    long countByCustomerId(Long customerId);
    long countByStatus(String status);

    @Query("SELECT s FROM Subscription s WHERE " +
           "(:customerId IS NULL OR s.customer.id = :customerId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:frequency IS NULL OR s.billingFrequency = :frequency) AND " +
           "(:query IS NULL OR LOWER(s.subscriptionNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.customer.companyName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Subscription> searchSubscriptions(
            @Param("customerId") Long customerId,
            @Param("status") String status,
            @Param("frequency") String frequency,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.nextBillingDate <= :dueDate")
    List<Subscription> findDueForBilling(@Param("dueDate") LocalDate dueDate);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.autoCloseOnExpiry = true AND s.expiryDate <= :today")
    List<Subscription> findExpiredSubscriptions(@Param("today") LocalDate today);

    @Query("SELECT s FROM Subscription s WHERE s.status = 'ACTIVE' AND s.nextBillingDate BETWEEN :startDate AND :endDate")
    List<Subscription> findUpcomingRenewals(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
