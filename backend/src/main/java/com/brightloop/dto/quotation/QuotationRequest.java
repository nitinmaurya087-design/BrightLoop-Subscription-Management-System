package com.brightloop.dto.quotation;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class QuotationRequest {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    private Long templateId;
    private LocalDate creationDate = LocalDate.now();
    private LocalDate expiryDate;
    private String paymentTerms = "Net 30";
    private String notes;
    private String discountCode;

    @NotEmpty(message = "Quotation must have at least one product line")
    private List<QuotationLineRequest> lines;

    public QuotationRequest() {}

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public Long getTemplateId() { return templateId; }
    public void setTemplateId(Long templateId) { this.templateId = templateId; }

    public LocalDate getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDate creationDate) { this.creationDate = creationDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getPaymentTerms() { return paymentTerms; }
    public void setPaymentTerms(String paymentTerms) { this.paymentTerms = paymentTerms; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getDiscountCode() { return discountCode; }
    public void setDiscountCode(String discountCode) { this.discountCode = discountCode; }

    public List<QuotationLineRequest> getLines() { return lines; }
    public void setLines(List<QuotationLineRequest> lines) { this.lines = lines; }
}
