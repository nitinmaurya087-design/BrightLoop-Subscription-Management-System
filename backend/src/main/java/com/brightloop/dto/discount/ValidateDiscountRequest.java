package com.brightloop.dto.discount;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ValidateDiscountRequest {

    @NotBlank(message = "Coupon code is required")
    private String code;

    @NotNull(message = "Purchase amount is required")
    private BigDecimal amount;

    private Integer quantity = 1;

    public ValidateDiscountRequest() {}

    public ValidateDiscountRequest(String code, BigDecimal amount, Integer quantity) {
        this.code = code;
        this.amount = amount;
        this.quantity = quantity;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}
