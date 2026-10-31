package com.brightloop.dto.discount;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class DiscountRequest {

    @NotBlank(message = "Discount name is required")
    private String name;

    @NotBlank(message = "Discount coupon code is required")
    private String code;

    private String discountType = "PERCENTAGE"; // PERCENTAGE, FIXED

    @NotNull(message = "Discount value is required")
    private BigDecimal discountValue;

    private BigDecimal minPurchaseAmount = BigDecimal.ZERO;
    private Integer minQuantity = 1;
    private LocalDate startDate = LocalDate.now();
    private LocalDate endDate;
    private Integer maxUsageLimit = 100;
    private String applicableProducts = "ALL";
    private String applicableSubscriptions = "ALL";
    private String status = "ACTIVE";

    public DiscountRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public BigDecimal getMinPurchaseAmount() { return minPurchaseAmount; }
    public void setMinPurchaseAmount(BigDecimal minPurchaseAmount) { this.minPurchaseAmount = minPurchaseAmount; }

    public Integer getMinQuantity() { return minQuantity; }
    public void setMinQuantity(Integer minQuantity) { this.minQuantity = minQuantity; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public Integer getMaxUsageLimit() { return maxUsageLimit; }
    public void setMaxUsageLimit(Integer maxUsageLimit) { this.maxUsageLimit = maxUsageLimit; }

    public String getApplicableProducts() { return applicableProducts; }
    public void setApplicableProducts(String applicableProducts) { this.applicableProducts = applicableProducts; }

    public String getApplicableSubscriptions() { return applicableSubscriptions; }
    public void setApplicableSubscriptions(String applicableSubscriptions) { this.applicableSubscriptions = applicableSubscriptions; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
