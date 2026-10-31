package com.brightloop.repository;

import com.brightloop.entity.BillingExecution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillingExecutionRepository extends JpaRepository<BillingExecution, Long> {
    List<BillingExecution> findTop10ByOrderByExecutionTimeDesc();
    Page<BillingExecution> findAllByOrderByExecutionTimeDesc(Pageable pageable);
}
