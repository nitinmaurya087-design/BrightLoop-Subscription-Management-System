package com.brightloop.repository;

import com.brightloop.entity.Payment;
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
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPaymentReference(String paymentReference);
    List<Payment> findByInvoiceId(Long invoiceId);
    List<Payment> findByCustomerId(Long customerId);

    @Query("SELECT p FROM Payment p WHERE " +
           "(:customerId IS NULL OR p.customer.id = :customerId) AND " +
           "(:method IS NULL OR p.paymentMethod = :method) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:startDate IS NULL OR p.paymentDate >= :startDate) AND " +
           "(:endDate IS NULL OR p.paymentDate <= :endDate) AND " +
           "(:query IS NULL OR LOWER(p.paymentReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.transactionReference) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.invoice.invoiceNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Payment> searchPayments(
            @Param("customerId") Long customerId,
            @Param("method") String method,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    BigDecimal sumTotalCollected();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.customer.id = :customerId AND p.status = 'SUCCESS'")
    BigDecimal sumTotalSpentByCustomer(@Param("customerId") Long customerId);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.paymentDate BETWEEN :startDate AND :endDate AND p.status = 'SUCCESS'")
    BigDecimal sumCollectedBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
