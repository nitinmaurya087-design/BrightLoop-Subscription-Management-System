package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.payment.PaymentDto;
import com.brightloop.dto.payment.PaymentReceiptDto;
import com.brightloop.dto.payment.PaymentRequest;
import com.brightloop.entity.User;
import com.brightloop.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentDto>>> getPayments(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<PaymentDto> response = paymentService.getPayments(customerId, method, status, startDate, endDate, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentDto>> getPaymentById(@PathVariable Long id) {
        PaymentDto payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
    }

    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getInvoicePayments(@PathVariable Long invoiceId) {
        List<PaymentDto> payments = paymentService.getInvoicePayments(invoiceId);
        return ResponseEntity.ok(ApiResponse.success("Payments for invoice retrieved", payments));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<ApiResponse<PaymentReceiptDto>> getPaymentReceipt(@PathVariable Long id) {
        PaymentReceiptDto receipt = paymentService.getReceiptByPaymentId(id);
        return ResponseEntity.ok(ApiResponse.success("Payment receipt retrieved", receipt));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentDto>> recordPayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        PaymentDto payment = paymentService.recordPayment(request, user);
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", payment));
    }
}
