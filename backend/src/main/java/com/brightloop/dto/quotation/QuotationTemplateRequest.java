package com.brightloop.dto.quotation;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

public class QuotationTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String name;

    private String description;
    private Integer validityDays = 30;
    private List<TemplateLineReq> lines;

    public QuotationTemplateRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public List<TemplateLineReq> getLines() { return lines; }
    public void setLines(List<TemplateLineReq> lines) { this.lines = lines; }

    public static class TemplateLineReq {
        private Long productId;
        private Long planId;
        private Integer quantity = 1;
        private BigDecimal unitPrice;
        private BigDecimal taxRate;
        private BigDecimal discountAmount;

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }

        public Long getPlanId() { return planId; }
        public void setPlanId(Long planId) { this.planId = planId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getUnitPrice() { return unitPrice; }
        public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

        public BigDecimal getTaxRate() { return taxRate; }
        public void setTaxRate(BigDecimal taxRate) { this.taxRate = taxRate; }

        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
    }
}
