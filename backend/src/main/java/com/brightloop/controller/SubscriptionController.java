package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.subscription.SubscriptionActionRequest;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.dto.subscription.SubscriptionRequest;
import com.brightloop.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SubscriptionDto>>> getSubscriptions(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String frequency,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<SubscriptionDto> response = subscriptionService.getSubscriptions(customerId, status, frequency, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", response));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getCustomerSubscriptions(@PathVariable Long customerId) {
        List<SubscriptionDto> subscriptions = subscriptionService.getCustomerSubscriptions(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer subscriptions retrieved", subscriptions));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SubscriptionDto>> getSubscriptionById(@PathVariable Long id) {
        SubscriptionDto subscription = subscriptionService.getSubscriptionById(id);
        return ResponseEntity.ok(ApiResponse.success("Subscription retrieved successfully", subscription));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> createSubscription(@Valid @RequestBody SubscriptionRequest request) {
        SubscriptionDto subscription = subscriptionService.createSubscription(request);
        return ResponseEntity.ok(ApiResponse.success("Subscription created successfully", subscription));
    }

    @PostMapping("/{id}/actions")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> handleAction(
            @PathVariable Long id,
            @Valid @RequestBody SubscriptionActionRequest request
    ) {
        SubscriptionDto subscription = subscriptionService.handleAction(id, request);
        return ResponseEntity.ok(ApiResponse.success("Subscription action executed successfully", subscription));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> activateSubscription(@PathVariable Long id) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("ACTIVATE");
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription activated successfully", subscription));
    }

    @PostMapping("/{id}/pause")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> pauseSubscription(@PathVariable Long id) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("PAUSE");
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription paused successfully", subscription));
    }

    @PostMapping("/{id}/resume")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> resumeSubscription(@PathVariable Long id) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("RESUME");
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription resumed successfully", subscription));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> closeSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) SubscriptionActionRequest body
    ) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("CLOSE");
        if (body != null) req.setReason(body.getReason());
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription closed successfully", subscription));
    }

    @PostMapping("/{id}/early-terminate")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> earlyTerminateSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) SubscriptionActionRequest body
    ) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("EARLY_TERMINATE");
        if (body != null) req.setReason(body.getReason());
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription terminated early", subscription));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> renewSubscription(@PathVariable Long id) {
        SubscriptionActionRequest req = new SubscriptionActionRequest();
        req.setAction("RENEW");
        SubscriptionDto subscription = subscriptionService.handleAction(id, req);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed successfully", subscription));
    }
}
