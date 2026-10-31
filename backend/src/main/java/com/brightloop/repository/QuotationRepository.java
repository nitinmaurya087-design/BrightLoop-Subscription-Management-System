package com.brightloop.repository;

import com.brightloop.entity.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {
    Optional<Quotation> findByQuotationNumber(String quotationNumber);
    List<Quotation> findByCustomerId(Long customerId);

    @Query("SELECT q FROM Quotation q WHERE " +
           "(:customerId IS NULL OR q.customer.id = :customerId) AND " +
           "(:status IS NULL OR q.status = :status) AND " +
           "(:query IS NULL OR LOWER(q.quotationNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.customer.fullName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(q.customer.companyName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Quotation> searchQuotations(
            @Param("customerId") Long customerId,
            @Param("status") String status,
            @Param("query") String query,
            Pageable pageable
    );
}
