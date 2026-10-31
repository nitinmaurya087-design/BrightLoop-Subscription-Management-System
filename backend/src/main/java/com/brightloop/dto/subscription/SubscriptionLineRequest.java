package com.brightloop.dto.subscription;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class SubscriptionLineRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long variantId;
    private Integer quantity = 1;
    private BigDecimal unitPrice;
    private BigDecimal taxRate;
    private BigDecimal discountAmount;

    public SubscriptionLineRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTaxRate() { return taxRate; }
    public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
}
