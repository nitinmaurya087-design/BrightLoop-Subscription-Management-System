package com.brightloop.dto.product;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;

public class ProductVariantRequest {

    @NotBlank(message = "Variant attribute name is required (e.g., Edition, Package)")
    private String variantName;

    @NotBlank(message = "Attribute value is required (e.g., Standard, Premium)")
    private String attributeValue;

    private BigDecimal additionalPrice = BigDecimal.ZERO;
    private String status = "ACTIVE";

    public ProductVariantRequest() {}

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getAttributeValue() { return attributeValue; }
    public void setAttributeValue(String attributeValue) { this.attributeValue = attributeValue; }

    public BigDecimal getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(BigDecimal additionalPrice) { this.additionalPrice = additionalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
