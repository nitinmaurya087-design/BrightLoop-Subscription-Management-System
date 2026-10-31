package com.brightloop.dto.quotation;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class QuotationTemplateDto {
    private Long id;
    private String name;
    private String description;
    private Integer validityDays;
    private List<QuotationTemplateLineDto> lines = new ArrayList<>();
    private LocalDateTime createdAt;

    public QuotationTemplateDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getValidityDays() { return validityDays; }
    public void setValidityDays(Integer validityDays) { this.validityDays = validityDays; }

    public List<QuotationTemplateLineDto> getLines() { return lines; }
    public void setLines(List<QuotationTemplateLineDto> lines) { this.lines = lines; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
