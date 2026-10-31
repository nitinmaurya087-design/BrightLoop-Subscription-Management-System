package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.discount.*;
import com.brightloop.service.DiscountService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<DiscountDto>>> getDiscounts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<DiscountDto> response = discountService.getDiscounts(query, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Discounts retrieved successfully", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiscountDto>> getDiscountById(@PathVariable Long id) {
        DiscountDto discount = discountService.getDiscountById(id);
        return ResponseEntity.ok(ApiResponse.success("Discount retrieved successfully", discount));
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<DiscountValidationResultDto>> validateCoupon(@Valid @RequestBody ValidateDiscountRequest request) {
        DiscountValidationResultDto result = discountService.validateCoupon(request);
        return ResponseEntity.ok(ApiResponse.success("Coupon validated", result));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountDto>> createDiscount(@Valid @RequestBody DiscountRequest request) {
        DiscountDto discount = discountService.createDiscount(request);
        return ResponseEntity.ok(ApiResponse.success("Discount rule created successfully", discount));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DiscountDto>> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody DiscountRequest request
    ) {
        DiscountDto discount = discountService.updateDiscount(id, request);
        return ResponseEntity.ok(ApiResponse.success("Discount rule updated successfully", discount));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDiscount(@PathVariable Long id) {
        discountService.deleteDiscount(id);
        return ResponseEntity.ok(ApiResponse.success("Discount rule deactivated successfully", null));
    }
}
