package com.brightloop.dto.subscription;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public class SubscriptionActionRequest {

    @NotBlank(message = "Action is required (CONFIRM, ACTIVATE, PAUSE, RESUME, RENEW, CLOSE, EARLY_TERMINATE)")
    private String action;

    private String reason;
    private LocalDate newExpiryDate;

    public SubscriptionActionRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDate getNewExpiryDate() { return newExpiryDate; }
    public void setNewExpiryDate(LocalDate newExpiryDate) { this.newExpiryDate = newExpiryDate; }
}
