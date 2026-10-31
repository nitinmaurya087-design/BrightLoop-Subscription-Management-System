package com.brightloop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "billing_executions")
public class BillingExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "execution_time", nullable = false)
    private LocalDateTime executionTime = LocalDateTime.now();

    @Column(name = "subscriptions_processed", nullable = false)
    private Integer subscriptionsProcessed = 0;

    @Column(name = "invoices_generated", nullable = false)
    private Integer invoicesGenerated = 0;

    @Column(name = "total_billed_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalBilledAmount = BigDecimal.ZERO;

    @Column(nullable = false, length = 50)
    private String status = "SUCCESS"; // SUCCESS, FAILED, PARTIAL

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "triggered_by", nullable = false, length = 100)
    private String triggeredBy = "SYSTEM_SCHEDULER";

    public BillingExecution() {}

    public BillingExecution(Integer subscriptionsProcessed, Integer invoicesGenerated, BigDecimal totalBilledAmount, String status, String errorMessage, String triggeredBy) {
        this.executionTime = LocalDateTime.now();
        this.subscriptionsProcessed = subscriptionsProcessed;
        this.invoicesGenerated = invoicesGenerated;
        this.totalBilledAmount = totalBilledAmount != null ? totalBilledAmount : BigDecimal.ZERO;
        this.status = status;
        this.errorMessage = errorMessage;
        this.triggeredBy = triggeredBy;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDateTime getExecutionTime() { return executionTime; }
    public void setExecutionTime(LocalDateTime executionTime) { this.executionTime = executionTime; }

    public Integer getSubscriptionsProcessed() { return subscriptionsProcessed; }
    public void setSubscriptionsProcessed(Integer subscriptionsProcessed) { this.subscriptionsProcessed = subscriptionsProcessed; }

    public Integer getInvoicesGenerated() { return invoicesGenerated; }
    public void setInvoicesGenerated(Integer invoicesGenerated) { this.invoicesGenerated = invoicesGenerated; }

    public BigDecimal getTotalBilledAmount() { return totalBilledAmount; }
    public void setTotalBilledAmount(BigDecimal totalBilledAmount) { this.totalBilledAmount = totalBilledAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public String getTriggeredBy() { return triggeredBy; }
    public void setTriggeredBy(String triggeredBy) { this.triggeredBy = triggeredBy; }
}
