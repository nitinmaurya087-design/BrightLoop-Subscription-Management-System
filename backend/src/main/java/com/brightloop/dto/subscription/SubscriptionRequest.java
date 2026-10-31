package com.brightloop.dto.subscription;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class SubscriptionRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Plan ID is required")
    private Long planId;

    private LocalDate startDate = LocalDate.now();
    private LocalDate expiryDate;
    private String billingFrequency;
    private String paymentTerms = "Immediate";
    private String discountCode;
    private String notes;
    private List<SubscriptionLineRequest> lines;

    public SubscriptionRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getBillingFrequency() { return billingFrequency; }
    public void setBillingFrequency(String billingFrequency) { this.billingFrequency = billingFrequency; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getDiscountCode() { return discountCode; }
    public void setDiscountCode(String discountCode) { this.discountCode = discountCode; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<SubscriptionLineRequest> getLines() { return lines; }
    public void setLines(List<SubscriptionLineRequest> lines) { this.lines = lines; }
}
