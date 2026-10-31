package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.tax.TaxDto;
import com.brightloop.dto.tax.TaxRequest;
import com.brightloop.service.TaxService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/taxes")
public class TaxController {

    private final TaxService taxService;

    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TaxDto>>> getAllTaxes() {
        List<TaxDto> taxes = taxService.getAllTaxes();
        return ResponseEntity.ok(ApiResponse.success("Taxes retrieved successfully", taxes));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TaxDto>>> getActiveTaxes() {
        List<TaxDto> taxes = taxService.getActiveTaxes();
        return ResponseEntity.ok(ApiResponse.success("Active taxes retrieved", taxes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaxDto>> getTaxById(@PathVariable Long id) {
        TaxDto tax = taxService.getTaxById(id);
        return ResponseEntity.ok(ApiResponse.success("Tax retrieved successfully", tax));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaxDto>> createTax(@Valid @RequestBody TaxRequest request) {
        TaxDto tax = taxService.createTax(request);
        return ResponseEntity.ok(ApiResponse.success("Tax created successfully", tax));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TaxDto>> updateTax(
            @PathVariable Long id,
            @Valid @RequestBody TaxRequest request
    ) {
        TaxDto tax = taxService.updateTax(id, request);
        return ResponseEntity.ok(ApiResponse.success("Tax updated successfully", tax));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTax(@PathVariable Long id) {
        taxService.deleteTax(id);
        return ResponseEntity.ok(ApiResponse.success("Tax deactivated successfully", null));
    }
}
