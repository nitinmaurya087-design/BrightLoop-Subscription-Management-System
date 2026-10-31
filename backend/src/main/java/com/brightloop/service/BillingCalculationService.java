package com.brightloop.service;

import com.brightloop.entity.Discount;
import com.brightloop.entity.Product;
import com.brightloop.entity.ProductVariant;
import com.brightloop.repository.DiscountRepository;
import com.brightloop.repository.ProductRepository;
import com.brightloop.repository.ProductVariantRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;

@Service
public class BillingCalculationService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TaxService taxService;
    private final DiscountRepository discountRepository;

    public BillingCalculationService(
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            TaxService taxService,
            DiscountRepository discountRepository
    ) {
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.taxService = taxService;
        this.discountRepository = discountRepository;
    }

    public BigDecimal calculateUnitPrice(Long productId, Long variantId) {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal unitPrice = product.getSalesPrice() != null ? product.getSalesPrice() : BigDecimal.ZERO;

        if (variantId != null) {
            ProductVariant variant = productVariantRepository.findById(variantId).orElse(null);
            if (variant != null && variant.getAdditionalPrice() != null) {
                unitPrice = unitPrice.add(variant.getAdditionalPrice());
            }
        }

        return unitPrice.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateLineSubtotal(BigDecimal unitPrice, int quantity) {
        if (unitPrice == null || quantity <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return unitPrice.multiply(BigDecimal.valueOf(quantity)).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateLineTax(BigDecimal lineSubtotal, Long productId) {
        return taxService.calculateTaxForAmount(lineSubtotal, productId);
    }

    public BigDecimal calculateDiscount(String discountCode, BigDecimal subtotal, int totalQuantity) {
        if (discountCode == null || discountCode.trim().isEmpty() || subtotal == null || subtotal.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        Discount discount = discountRepository.findByCode(discountCode.trim().toUpperCase()).orElse(null);
        if (discount == null || !"ACTIVE".equalsIgnoreCase(discount.getStatus())) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        LocalDate today = LocalDate.now();
        if (discount.getStartDate() != null && discount.getStartDate().isAfter(today)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (discount.getEndDate() != null && discount.getEndDate().isBefore(today)) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        if (discount.getMaxUsageLimit() != null && discount.getCurrentUsageCount() >= discount.getMaxUsageLimit()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        if (discount.getMinPurchaseAmount() != null && subtotal.compareTo(discount.getMinPurchaseAmount()) < 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        if (discount.getMinQuantity() != null && totalQuantity < discount.getMinQuantity()) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal discountAmount = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(discount.getDiscountType())) {
            discountAmount = subtotal.multiply(discount.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if ("FIXED".equalsIgnoreCase(discount.getDiscountType())) {
            discountAmount = discount.getDiscountValue();
        }

        // Discount cannot exceed subtotal
        if (discountAmount.compareTo(subtotal) > 0) {
            discountAmount = subtotal;
        }

        return discountAmount.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateGrandTotal(BigDecimal subtotal, BigDecimal taxAmount, BigDecimal discountAmount) {
        BigDecimal sub = subtotal != null ? subtotal : BigDecimal.ZERO;
        BigDecimal tax = taxAmount != null ? taxAmount : BigDecimal.ZERO;
        BigDecimal disc = discountAmount != null ? discountAmount : BigDecimal.ZERO;

        BigDecimal total = sub.add(tax).subtract(disc);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }
}
