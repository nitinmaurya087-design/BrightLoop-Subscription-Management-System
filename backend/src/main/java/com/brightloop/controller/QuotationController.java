package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.quotation.QuotationDto;
import com.brightloop.dto.quotation.QuotationRequest;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.service.QuotationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<QuotationDto>>> getQuotations(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<QuotationDto> response = quotationService.getQuotations(customerId, status, query, page, size);
        return ResponseEntity.ok(ApiResponse.success("Quotations retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuotationDto>> getQuotationById(@PathVariable Long id) {
        QuotationDto quotation = quotationService.getQuotationById(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation retrieved successfully", quotation));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<QuotationDto>> createQuotation(@Valid @RequestBody QuotationRequest request) {
        QuotationDto quotation = quotationService.createQuotation(request);
        return ResponseEntity.ok(ApiResponse.success("Quotation created successfully", quotation));
    }

    @PostMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<QuotationDto>> confirmQuotation(@PathVariable Long id) {
        QuotationDto quotation = quotationService.confirmQuotation(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation confirmed successfully and email sent", quotation));
    }

    @PostMapping("/{id}/convert")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<SubscriptionDto>> convertToSubscription(@PathVariable Long id) {
        SubscriptionDto subscription = quotationService.convertToSubscription(id);
        return ResponseEntity.ok(ApiResponse.success("Quotation successfully converted to active subscription", subscription));
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> downloadQuotationPdf(@PathVariable Long id) {
        byte[] pdfBytes = quotationService.generatePdf(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"quotation-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
