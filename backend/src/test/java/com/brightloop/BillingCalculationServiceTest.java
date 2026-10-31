package com.brightloop;

import com.brightloop.entity.Discount;
import com.brightloop.entity.Product;
import com.brightloop.entity.ProductVariant;
import com.brightloop.repository.DiscountRepository;
import com.brightloop.repository.ProductRepository;
import com.brightloop.repository.ProductVariantRepository;
import com.brightloop.service.BillingCalculationService;
import com.brightloop.service.TaxService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class BillingCalculationServiceTest {

    private Product product;
    private ProductVariant variant;
    private Discount discount;

    private BillingCalculationService calculationService;

    @BeforeEach
    void setUp() {
        product = new Product();
        product.setId(1L);
        product.setSalesPrice(BigDecimal.valueOf(2000.00));

        variant = new ProductVariant(product, "Edition", "Odoo", BigDecimal.valueOf(560.00));
        variant.setId(2L);

        discount = new Discount();
        discount.setCode("EARLY15");
        discount.setDiscountType("PERCENTAGE");
        discount.setDiscountValue(BigDecimal.valueOf(15.00));
        discount.setMinPurchaseAmount(BigDecimal.valueOf(1000.00));
        discount.setMinQuantity(1);
        discount.setStartDate(LocalDate.now().minusDays(10));
        discount.setEndDate(LocalDate.now().plusDays(10));
        discount.setMaxUsageLimit(100);
        discount.setCurrentUsageCount(5);
        discount.setStatus("ACTIVE");

        // Clean Dynamic Proxy Repositories (works universally on all JDKs without ByteBuddy agent loading restrictions)
        ProductRepository prodRepo = (ProductRepository) Proxy.newProxyInstance(
                ProductRepository.class.getClassLoader(),
                new Class[]{ProductRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName()) && Long.valueOf(1L).equals(args[0])) {
                        return Optional.of(product);
                    }
                    return Optional.empty();
                }
        );

        ProductVariantRepository varRepo = (ProductVariantRepository) Proxy.newProxyInstance(
                ProductVariantRepository.class.getClassLoader(),
                new Class[]{ProductVariantRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName()) && Long.valueOf(2L).equals(args[0])) {
                        return Optional.of(variant);
                    }
                    return Optional.empty();
                }
        );

        DiscountRepository discRepo = (DiscountRepository) Proxy.newProxyInstance(
                DiscountRepository.class.getClassLoader(),
                new Class[]{DiscountRepository.class},
                (proxy, method, args) -> {
                    if ("findByCode".equals(method.getName()) && "EARLY15".equals(args[0])) {
                        return Optional.of(discount);
                    }
                    return Optional.empty();
                }
        );

        calculationService = new BillingCalculationService(prodRepo, varRepo, null, discRepo);
    }

    @Test
    void testCalculateUnitPriceWithVariant() {
        // Base 2000 + Variant 560 = 2560.00
        BigDecimal finalPrice = calculationService.calculateUnitPrice(1L, 2L);
        assertEquals(BigDecimal.valueOf(2560.00).setScale(2, RoundingMode.HALF_UP), finalPrice);
    }

    @Test
    void testCalculateLineSubtotal() {
        BigDecimal unitPrice = BigDecimal.valueOf(2560.00);
        int quantity = 2;

        BigDecimal subtotal = calculationService.calculateLineSubtotal(unitPrice, quantity);
        assertEquals(BigDecimal.valueOf(5120.00).setScale(2, RoundingMode.HALF_UP), subtotal);
    }

    @Test
    void testCalculatePercentageDiscount() {
        BigDecimal subtotal = BigDecimal.valueOf(2000.00);
        BigDecimal discountAmt = calculationService.calculateDiscount("EARLY15", subtotal, 1);

        // 15% of 2000 = 300.00
        assertEquals(BigDecimal.valueOf(300.00).setScale(2, RoundingMode.HALF_UP), discountAmt);
    }

    @Test
    void testDiscountRejectedWhenBelowMinimumPurchase() {
        BigDecimal subtotal = BigDecimal.valueOf(500.00); // Minimum is 1000
        BigDecimal discountAmt = calculationService.calculateDiscount("EARLY15", subtotal, 1);

        assertEquals(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP), discountAmt);
    }

    @Test
    void testCalculateGrandTotal() {
        BigDecimal subtotal = BigDecimal.valueOf(2560.00);
        BigDecimal tax = BigDecimal.valueOf(460.80);
        BigDecimal discount = BigDecimal.valueOf(200.00);

        // 2560 + 460.80 - 200 = 2820.80
        BigDecimal grandTotal = calculationService.calculateGrandTotal(subtotal, tax, discount);
        assertEquals(BigDecimal.valueOf(2820.80).setScale(2, RoundingMode.HALF_UP), grandTotal);
    }
}
