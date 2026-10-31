package com.brightloop.repository;

import com.brightloop.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByCustomerId(Long customerId);
    List<Invoice> findBySubscriptionId(Long subscriptionId);
    long countByCustomerId(Long customerId);
    long countByStatus(String status);

    boolean existsBySubscriptionIdAndBillingPeriodStartAndBillingPeriodEnd(
            Long subscriptionId, LocalDate billingPeriodStart, LocalDate billingPeriodEnd
    );

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:customerId IS NULL OR i.customer.id = :customerId) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:startDate IS NULL OR i.invoiceDate >= :startDate) AND " +
           "(:endDate IS NULL OR i.invoiceDate <= :endDate) AND " +
           "(:query IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(i.customer.companyName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Invoice> searchInvoices(
            @Param("customerId") Long customerId,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT i FROM Invoice i WHERE i.status = 'CONFIRMED' AND i.dueDate < :today")
    List<Invoice> findOverdueInvoices(@Param("today") LocalDate today);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.status = 'CONFIRMED' AND i.dueDate < :today")
    long countOverdueInvoices(@Param("today") LocalDate today);

    @Query("SELECT COALESCE(SUM(i.amountOutstanding), 0) FROM Invoice i WHERE i.status = 'CONFIRMED'")
    BigDecimal sumTotalOutstanding();

    @Query("SELECT COALESCE(SUM(i.grandTotal), 0) FROM Invoice i WHERE i.status = 'PAID'")
    BigDecimal sumTotalRevenue();
}
