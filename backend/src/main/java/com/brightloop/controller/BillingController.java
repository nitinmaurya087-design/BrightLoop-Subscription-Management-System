package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.entity.BillingExecution;
import com.brightloop.entity.User;
import com.brightloop.service.BillingSchedulerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/billing")
public class BillingController {

    private final BillingSchedulerService billingSchedulerService;

    public BillingController(BillingSchedulerService billingSchedulerService) {
        this.billingSchedulerService = billingSchedulerService;
    }

    @PostMapping("/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> triggerManualBillingRun(@AuthenticationPrincipal User user) {
        String initiator = user != null ? "MANUAL_TRIGGER (" + user.getEmail() + ")" : "MANUAL_ADMIN";
        Map<String, Object> result = billingSchedulerService.executeBillingRun(initiator);
        return ResponseEntity.ok(ApiResponse.success("Automated recurring billing run completed", result));
    }

    @GetMapping("/executions")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<BillingExecution>>> getRecentExecutions() {
        List<BillingExecution> history = billingSchedulerService.getRecentExecutions();
        return ResponseEntity.ok(ApiResponse.success("Billing executions history retrieved", history));
    }
}
