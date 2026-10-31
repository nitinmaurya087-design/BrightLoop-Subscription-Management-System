package com.brightloop.dto.plan;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class PlanRequest {

    @NotBlank(message = "Plan name is required")
    private String name;

    private String description;

    @NotNull(message = "Linked product is required")
    private Long productId;

    @NotNull(message = "Billing price is required")
    private BigDecimal billingPrice;

    @NotBlank(message = "Billing frequency is required (DAILY, WEEKLY, MONTHLY, YEARLY)")
    private String billingFrequency;

    private Integer minQuantity = 1;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private Boolean autoCloseOnExpiry = false;
    private Boolean allowEarlyClosure = true;
    private Boolean allowPause = true;
    private Boolean allowRenewal = true;
    private String status = "ACTIVE";

    public PlanRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public BigDecimal getBillingPrice() { return billingPrice; }
    public void setBillingPrice(BigDecimal billingPrice) { this.billingPrice = billingPrice; }

    public String getBillingFrequency() { return billingFrequency; }
    public void setBillingFrequency(String billingFrequency) { this.billingFrequency = billingFrequency; }

    public Integer getMinQuantity() { return minQuantity; }
    public void setMinQuantity(Integer minQuantity) { this.minQuantity = minQuantity; }

    public LocalDate getAvailableFrom() { return availableFrom; }
    public void setAvailableFrom(LocalDate availableFrom) { this.availableFrom = availableFrom; }

    public LocalDate getAvailableUntil() { return availableUntil; }
    public void setAvailableUntil(LocalDate availableUntil) { this.availableUntil = availableUntil; }

    public Boolean getAutoCloseOnExpiry() { return autoCloseOnExpiry; }
    public void setAutoCloseOnExpiry(Boolean autoCloseOnExpiry) { this.autoCloseOnExpiry = autoCloseOnExpiry; }

    public Boolean getAllowEarlyClosure() { return allowEarlyClosure; }
    public void setAllowEarlyClosure(Boolean allowEarlyClosure) { this.allowEarlyClosure = allowEarlyClosure; }

    public Boolean getAllowPause() { return allowPause; }
    public void setAllowPause(Boolean allowPause) { this.allowPause = allowPause; }

    public Boolean getAllowRenewal() { return allowRenewal; }
    public void setAllowRenewal(Boolean allowRenewal) { this.allowRenewal = allowRenewal; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
