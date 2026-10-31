package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.product.*;
import com.brightloop.entity.Product;
import com.brightloop.entity.ProductVariant;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.ProductRepository;
import com.brightloop.repository.ProductVariantRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final AuditService auditService;

    public ProductService(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            AuditService auditService
    ) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.auditService = auditService;
    }

    public PageResponse<ProductDto> getProducts(String query, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Product> productPage = productRepository.searchProducts(q, st, pageable);
        Page<ProductDto> dtoPage = productPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public List<ProductDto> getAllActiveProducts() {
        return productRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToDto(product);
    }

    @Transactional
    public ProductDto createProduct(ProductRequest request) {
        Product product = new Product();
        product.setName(request.getName().trim());
        product.setProductType(request.getProductType() != null ? request.getProductType() : "SERVICE");
        product.setDescription(request.getDescription());
        product.setSalesPrice(request.getSalesPrice());
        product.setCostPrice(request.getCostPrice() != null ? request.getCostPrice() : BigDecimal.ZERO);
        product.setNotes(request.getNotes());
        product.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        if (request.getVariants() != null) {
            for (ProductVariantRequest vr : request.getVariants()) {
                ProductVariant variant = new ProductVariant(
                        product,
                        vr.getVariantName().trim(),
                        vr.getAttributeValue().trim(),
                        vr.getAdditionalPrice() != null ? vr.getAdditionalPrice() : BigDecimal.ZERO
                );
                if (vr.getStatus() != null) {
                    variant.setStatus(vr.getStatus());
                }
                product.addVariant(variant);
            }
        }

        product = productRepository.save(product);
        auditService.log("PRODUCT_CREATE", "Product", product.getId().toString(), "Created product: " + product.getName());

        return mapToDto(product);
    }

    @Transactional
    public ProductDto updateProduct(Long id, ProductRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.getName().trim());
        if (request.getProductType() != null) {
            product.setProductType(request.getProductType());
        }
        product.setDescription(request.getDescription());
        product.setSalesPrice(request.getSalesPrice());
        if (request.getCostPrice() != null) {
            product.setCostPrice(request.getCostPrice());
        }
        product.setNotes(request.getNotes());
        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        product = productRepository.save(product);
        auditService.log("PRODUCT_UPDATE", "Product", product.getId().toString(), "Updated product: " + product.getName());

        return mapToDto(product);
    }

    @Transactional
    public ProductVariantDto addVariant(Long productId, ProductVariantRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        ProductVariant variant = new ProductVariant(
                product,
                request.getVariantName().trim(),
                request.getAttributeValue().trim(),
                request.getAdditionalPrice() != null ? request.getAdditionalPrice() : BigDecimal.ZERO
        );
        if (request.getStatus() != null) {
            variant.setStatus(request.getStatus());
        }

        variant = productVariantRepository.save(variant);
        auditService.log("PRODUCT_VARIANT_ADD", "ProductVariant", variant.getId().toString(),
                "Added variant " + variant.getAttributeValue() + " to product " + product.getName());

        return mapVariantToDto(variant);
    }

    @Transactional
    public void deleteVariant(Long variantId) {
        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ResourceNotFoundException("Product variant not found with id: " + variantId));
        productVariantRepository.delete(variant);
        auditService.log("PRODUCT_VARIANT_DELETE", "ProductVariant", variantId.toString(), "Deleted variant ID: " + variantId);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setStatus("ARCHIVED");
        productRepository.save(product);
        auditService.log("PRODUCT_ARCHIVE", "Product", id.toString(), "Archived product: " + product.getName());
    }

    public BigDecimal calculateUnitPrice(Product product, Long variantId) {
        BigDecimal base = product.getSalesPrice() != null ? product.getSalesPrice() : BigDecimal.ZERO;
        if (variantId != null) {
            ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);
            if (variant != null && variant.getAdditionalPrice() != null) {
                return base.add(variant.getAdditionalPrice());
            }
        }
        return base;
    }

    public ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setProductType(product.getProductType());
        dto.setDescription(product.getDescription());
        dto.setSalesPrice(product.getSalesPrice());
        dto.setCostPrice(product.getCostPrice());
        dto.setNotes(product.getNotes());
        dto.setStatus(product.getStatus());
        dto.setCreatedAt(product.getCreatedAt());

        List<ProductVariant> variants = productVariantRepository.findByProductId(product.getId());
        dto.setVariants(variants.stream().map(this::mapVariantToDto).collect(Collectors.toList()));

        return dto;
    }

    public ProductVariantDto mapVariantToDto(ProductVariant variant) {
        ProductVariantDto dto = new ProductVariantDto();
        dto.setId(variant.getId());
        dto.setProductId(variant.getProduct() != null ? variant.getProduct().getId() : null);
        dto.setVariantName(variant.getVariantName());
        dto.setAttributeValue(variant.getAttributeValue());
        dto.setAdditionalPrice(variant.getAdditionalPrice());
        dto.setStatus(variant.getStatus());
        return dto;
    }
}
