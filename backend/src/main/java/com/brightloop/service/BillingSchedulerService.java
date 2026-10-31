package com.brightloop.service;

import com.brightloop.entity.BillingExecution;
import com.brightloop.entity.Invoice;
import com.brightloop.entity.Subscription;
import com.brightloop.repository.BillingExecutionRepository;
import com.brightloop.repository.SubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class BillingSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(BillingSchedulerService.class);

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionService subscriptionService;
    private final InvoiceService invoiceService;
    private final BillingExecutionRepository billingExecutionRepository;
    private final AuditService auditService;

    public BillingSchedulerService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionService subscriptionService,
            InvoiceService invoiceService,
            BillingExecutionRepository billingExecutionRepository,
            AuditService auditService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.subscriptionService = subscriptionService;
        this.invoiceService = invoiceService;
        this.billingExecutionRepository = billingExecutionRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Map<String, Object> executeBillingRun(String triggeredBy) {
        log.info("Starting automated recurring billing run triggered by: {}", triggeredBy);
        LocalDate today = LocalDate.now();

        // 1. First auto-close subscriptions that have reached expiryDate with autoCloseOnExpiry = true
        List<Subscription> expiredList = subscriptionRepository.findExpiredSubscriptions(today);
        for (Subscription exp : expiredList) {
            exp.setStatus("CLOSED");
            subscriptionRepository.save(exp);
            log.info("Auto-closed expired subscription: {}", exp.getSubscriptionNumber());
        }

        // 2. Identify active subscriptions due for billing (nextBillingDate <= today)
        List<Subscription> dueSubscriptions = subscriptionRepository.findDueForBilling(today);
        log.info("Found {} active subscriptions due for billing", dueSubscriptions.size());

        int processed = 0;
        int invoicesGenerated = 0;
        BigDecimal totalBilled = BigDecimal.ZERO;
        StringBuilder errorLog = new StringBuilder();

        for (Subscription sub : dueSubscriptions) {
            processed++;
            try {
                // Ensure subscription is still active and not past expiry
                if (!"ACTIVE".equalsIgnoreCase(sub.getStatus())) {
                    continue;
                }

                if (sub.getExpiryDate() != null && sub.getExpiryDate().isBefore(today)) {
                    if (Boolean.TRUE.equals(sub.getAutoCloseOnExpiry())) {
                        sub.setStatus("CLOSED");
                        subscriptionRepository.save(sub);
                    }
                    continue;
                }

                LocalDate periodStart = sub.getNextBillingDate() != null ? sub.getNextBillingDate() : today;
                LocalDate periodEnd = subscriptionService.calculateNextBillingDate(periodStart, sub.getBillingFrequency()).minusDays(1);

                // Generate invoice (checks idempotency internally)
                Invoice invoice = invoiceService.generateInvoiceForSubscription(sub, periodStart, periodEnd);
                if (invoice != null) {
                    invoicesGenerated++;
                    totalBilled = totalBilled.add(invoice.getGrandTotal());

                    // Advance next billing date
                    LocalDate nextDate = subscriptionService.calculateNextBillingDate(periodStart, sub.getBillingFrequency());
                    sub.setNextBillingDate(nextDate);
                    subscriptionRepository.save(sub);
                    log.info("Billed subscription {} | Invoice: {} | Next billing: {}", sub.getSubscriptionNumber(), invoice.getInvoiceNumber(), nextDate);
                }
            } catch (Exception e) {
                log.error("Failed to bill subscription {}: {}", sub.getSubscriptionNumber(), e.getMessage());
                errorLog.append(String.format("Sub %s: %s; ", sub.getSubscriptionNumber(), e.getMessage()));
            }
        }

        String status = errorLog.isEmpty() ? "SUCCESS" : (invoicesGenerated > 0 ? "PARTIAL" : "FAILED");
        BillingExecution execution = new BillingExecution(
                processed,
                invoicesGenerated,
                totalBilled,
                status,
                errorLog.isEmpty() ? null : errorLog.toString(),
                triggeredBy
        );
        billingExecutionRepository.save(execution);

        auditService.log("BILLING_RUN_COMPLETED", "BillingExecution", execution.getId().toString(),
                String.format("Processed %d subscriptions, generated %d invoices, total ₹%s", processed, invoicesGenerated, totalBilled.setScale(2)));

        Map<String, Object> result = new HashMap<>();
        result.put("executionId", execution.getId());
        result.put("status", status);
        result.put("subscriptionsProcessed", processed);
        result.put("invoicesGenerated", invoicesGenerated);
        result.put("totalBilledAmount", totalBilled);
        result.put("executionTime", execution.getExecutionTime());
        result.put("errors", errorLog.toString());
        return result;
    }

    public List<BillingExecution> getRecentExecutions() {
        return billingExecutionRepository.findTop10ByOrderByExecutionTimeDesc();
    }
}
