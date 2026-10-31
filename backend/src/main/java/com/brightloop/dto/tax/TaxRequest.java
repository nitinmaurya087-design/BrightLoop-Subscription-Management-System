package com.brightloop.dto.tax;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class TaxRequest {

    @NotBlank(message = "Tax name is required")
    private String name;

    private String taxType = "PERCENTAGE"; // PERCENTAGE, FIXED

    @NotNull(message = "Tax rate is required")
    private BigDecimal rate;

    private String description;
    private String applicableProducts = "ALL";
    private LocalDate effectiveStartDate = LocalDate.now();
    private LocalDate effectiveEndDate;
    private String status = "ACTIVE";

    public TaxRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getTaxType() { return taxType; }
    public void setTaxType(String taxType) { this.taxType = taxType; }

    public BigDecimal getRate() { return rate; }
    public void setRate(BigDecimal rate) { this.rate = rate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getApplicableProducts() { return applicableProducts; }
    public void setApplicableProducts(String applicableProducts) { this.applicableProducts = applicableProducts; }

    public LocalDate getEffectiveStartDate() { return effectiveStartDate; }
    public void setEffectiveStartDate(LocalDate effectiveStartDate) { this.effectiveStartDate = effectiveStartDate; }

    public LocalDate getEffectiveEndDate() { return effectiveEndDate; }
    public void setEffectiveEndDate(LocalDate effectiveEndDate) { this.effectiveEndDate = effectiveEndDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
