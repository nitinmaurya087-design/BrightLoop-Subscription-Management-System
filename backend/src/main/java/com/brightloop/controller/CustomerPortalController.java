package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.customer.CustomerDto;
import com.brightloop.dto.invoice.InvoiceDto;
import com.brightloop.dto.payment.PaymentDto;
import com.brightloop.dto.payment.PaymentReceiptDto;
import com.brightloop.dto.plan.PlanDto;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.entity.User;
import com.brightloop.service.CustomerPortalService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/portal")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerPortalController {

    private final CustomerPortalService portalService;

    public CustomerPortalController(CustomerPortalService portalService) {
        this.portalService = portalService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPortalDashboard(@AuthenticationPrincipal User user) {
        Map<String, Object> data = portalService.getPortalDashboard(user);
        return ResponseEntity.ok(ApiResponse.success("Portal dashboard metrics retrieved", data));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerDto>> getProfile(@AuthenticationPrincipal User user) {
        CustomerDto profile = portalService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success("Customer profile retrieved", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<CustomerDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody Map<String, String> updates
    ) {
        CustomerDto profile = portalService.updateProfile(user, updates);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ApiResponse<List<SubscriptionDto>>> getMySubscriptions(@AuthenticationPrincipal User user) {
        List<SubscriptionDto> subscriptions = portalService.getMySubscriptions(user);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved", subscriptions));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<InvoiceDto>>> getMyInvoices(@AuthenticationPrincipal User user) {
        List<InvoiceDto> invoices = portalService.getMyInvoices(user);
        return ResponseEntity.ok(ApiResponse.success("Invoices retrieved", invoices));
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getMyPayments(@AuthenticationPrincipal User user) {
        List<PaymentDto> payments = portalService.getMyPayments(user);
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved", payments));
    }

    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getAvailablePlans() {
        List<PlanDto> plans = portalService.getAvailablePlans();
        return ResponseEntity.ok(ApiResponse.success("Available subscription plans retrieved", plans));
    }

    @GetMapping("/invoices/{invoiceId}/pdf")
    public ResponseEntity<byte[]> downloadInvoicePdf(@AuthenticationPrincipal User user, @PathVariable Long invoiceId) {
        byte[] pdfBytes = portalService.downloadMyInvoicePdf(user, invoiceId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + invoiceId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/payments/{paymentId}/receipt")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> getPaymentReceipt(
            @AuthenticationPrincipal User user,
            @PathVariable Long paymentId
    ) {
        PaymentReceiptDto receipt = portalService.getMyPaymentReceipt(user, paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment receipt retrieved", receipt));
    }
}
