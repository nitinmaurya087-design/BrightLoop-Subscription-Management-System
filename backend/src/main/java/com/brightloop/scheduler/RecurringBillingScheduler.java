package com.brightloop.scheduler;

import com.brightloop.service.BillingSchedulerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RecurringBillingScheduler {

    private static final Logger log = LoggerFactory.getLogger(RecurringBillingScheduler.class);

    private final BillingSchedulerService billingSchedulerService;

    @Value("${brightloop.scheduler.enabled:true}")
    private boolean schedulerEnabled;

    public RecurringBillingScheduler(BillingSchedulerService billingSchedulerService) {
        this.billingSchedulerService = billingSchedulerService;
    }

    @Scheduled(cron = "${brightloop.scheduler.cron:0 0 2 * * ?}")
    public void runAutomatedBillingJob() {
        if (!schedulerEnabled) {
            log.info("Automated recurring billing scheduler is disabled via config.");
            return;
        }

        log.info("Triggering scheduled automated recurring billing job...");
        try {
            billingSchedulerService.executeBillingRun("AUTOMATED_CRON_SCHEDULER");
        } catch (Exception e) {
            log.error("Scheduled recurring billing job encountered an error: {}", e.getMessage(), e);
        }
    }
}
