package com.brightloop.dto.plan;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PlanDto {
    private Long id;
    private String name;
    private String description;
    private Long productId;
    private String productName;
    private BigDecimal billingPrice;
    private String billingFrequency;
    private Integer minQuantity;
    private LocalDate availableFrom;
    private LocalDate availableUntil;
    private Boolean autoCloseOnExpiry;
    private Boolean allowEarlyClosure;
    private Boolean allowPause;
    private Boolean allowRenewal;
    private String status;
    private long activeSubscribersCount;
    private LocalDateTime createdAt;

    public PlanDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

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

    public long getActiveSubscribersCount() { return activeSubscribersCount; }
    public void setActiveSubscribersCount(long activeSubscribersCount) { this.activeSubscribersCount = activeSubscribersCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
