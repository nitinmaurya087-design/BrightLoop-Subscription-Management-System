package com.brightloop.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "billing_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal billingPrice = BigDecimal.ZERO;

    @Column(name = "billing_frequency", nullable = false, length = 50)
    private String billingFrequency; // DAILY, WEEKLY, MONTHLY, YEARLY

    @Column(name = "min_quantity", nullable = false)
    private Integer minQuantity = 1;

    @Column(name = "available_from")
    private LocalDate availableFrom;

    @Column(name = "available_until")
    private LocalDate availableUntil;

    @Column(name = "auto_close_on_expiry", nullable = false)
    private Boolean autoCloseOnExpiry = false;

    @Column(name = "allow_early_closure", nullable = false)
    private Boolean allowEarlyClosure = true;

    @Column(name = "allow_pause", nullable = false)
    private Boolean allowPause = true;

    @Column(name = "allow_renewal", nullable = false)
    private Boolean allowRenewal = true;

    @Column(nullable = false, length = 50)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE, ARCHIVED

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Plan() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }

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

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
