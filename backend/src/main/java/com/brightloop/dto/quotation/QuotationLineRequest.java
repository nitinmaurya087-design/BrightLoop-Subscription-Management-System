package com.brightloop.dto.quotation;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class QuotationLineRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long variantId;
    private Long planId;
    private Integer quantity = 1;
    private BigDecimal unitPrice;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;

    public QuotationLineRequest() {}

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getVariantId() { return variantId; }
    public void setVariantId(Long variantId) { this.variantId = variantId; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public BigDecimal getTaxAmount() { return taxAmount; }
    public void setTaxAmount(BigDecimal taxAmount) { this.taxAmount = taxAmount; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
}
