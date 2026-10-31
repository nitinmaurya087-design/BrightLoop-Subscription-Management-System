package com.brightloop.dto.product;

import java.math.BigDecimal;

public class ProductVariantDto {
    private Long id;
    private Long productId;
    private String variantName;
    private String attributeValue;
    private BigDecimal additionalPrice;
    private String status;

    public ProductVariantDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getVariantName() { return variantName; }
    public void setVariantName(String variantName) { this.variantName = variantName; }

    public String getAttributeValue() { return attributeValue; }
    public void setAttributeValue(String attributeValue) { this.attributeValue = attributeValue; }

    public BigDecimal getAdditionalPrice() { return additionalPrice; }
    public void setAdditionalPrice(BigDecimal additionalPrice) { this.additionalPrice = additionalPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
