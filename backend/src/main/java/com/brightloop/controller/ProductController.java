package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.product.*;
import com.brightloop.service.ProductService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ProductDto>>> getProducts(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<ProductDto> response = productService.getProducts(query, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<ProductDto>>> getActiveProducts() {
        List<ProductDto> products = productService.getAllActiveProducts();
        return ResponseEntity.ok(ApiResponse.success("Active products retrieved", products));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable Long id) {
        ProductDto product = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductDto product = productService.createProduct(request);
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", product));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request
    ) {
        ProductDto product = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product archived successfully", null));
    }

    @PostMapping("/{productId}/variants")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductVariantDto>> addVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        ProductVariantDto variant = productService.addVariant(productId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant added successfully", variant));
    }

    @PutMapping({"/{productId}/variants/{variantId}", "/variants/{variantId}"})
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ProductVariantDto>> updateVariant(
            @PathVariable(required = false) Long productId,
            @PathVariable Long variantId,
            @Valid @RequestBody ProductVariantRequest request
    ) {
        ProductVariantDto variant = productService.updateVariant(variantId, request);
        return ResponseEntity.ok(ApiResponse.success("Variant updated successfully", variant));
    }

    @DeleteMapping({"/{productId}/variants/{variantId}", "/variants/{variantId}"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(
            @PathVariable(required = false) Long productId,
            @PathVariable Long variantId
    ) {
        productService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.success("Variant deleted successfully", null));
    }
}
