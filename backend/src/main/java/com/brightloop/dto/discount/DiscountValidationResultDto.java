package com.brightloop.dto.discount;

import java.math.BigDecimal;

public class DiscountValidationResultDto {
    private boolean valid;
    private String message;
    private String code;
    private String discountType;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;

    public DiscountValidationResultDto() {}

    public DiscountValidationResultDto(boolean valid, String message, String code, String discountType, BigDecimal discountAmount, BigDecimal finalAmount) {
        this.valid = valid;
        this.message = message;
        this.code = code;
        this.discountType = discountType;
        this.discountAmount = discountAmount;
        this.finalAmount = finalAmount;
    }

    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalAmount() { return finalAmount; }
    public void setFinalAmount(BigDecimal finalAmount) { this.finalAmount = finalAmount; }
}
