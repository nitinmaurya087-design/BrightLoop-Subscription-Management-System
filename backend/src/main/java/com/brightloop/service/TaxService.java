package com.brightloop.service;

import com.brightloop.dto.tax.TaxDto;
import com.brightloop.dto.tax.TaxRequest;
import com.brightloop.entity.Tax;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.TaxRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaxService {

    private final TaxRepository taxRepository;
    private final AuditService auditService;

    public TaxService(TaxRepository taxRepository, AuditService auditService) {
        this.taxRepository = taxRepository;
        this.auditService = auditService;
    }

    public List<TaxDto> getAllTaxes() {
        return taxRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<TaxDto> getActiveTaxes() {
        return taxRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public TaxDto getTaxById(Long id) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
        return mapToDto(tax);
    }

    @Transactional
    public TaxDto createTax(TaxRequest request) {
        Tax tax = new Tax();
        tax.setName(request.getName().trim());
        tax.setTaxType(request.getTaxType() != null ? request.getTaxType() : "PERCENTAGE");
        tax.setRate(request.getRate());
        tax.setDescription(request.getDescription());
        tax.setApplicableProducts(request.getApplicableProducts() != null ? request.getApplicableProducts() : "ALL");
        tax.setEffectiveStartDate(request.getEffectiveStartDate() != null ? request.getEffectiveStartDate() : LocalDate.now());
        tax.setEffectiveEndDate(request.getEffectiveEndDate());
        tax.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        tax = taxRepository.save(tax);
        auditService.log("TAX_CREATE", "Tax", tax.getId().toString(), "Created tax: " + tax.getName() + " (" + tax.getRate() + "%)");

        return mapToDto(tax);
    }

    @Transactional
    public TaxDto updateTax(Long id, TaxRequest request) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));

        tax.setName(request.getName().trim());
        if (request.getTaxType() != null) tax.setTaxType(request.getTaxType());
        tax.setRate(request.getRate());
        tax.setDescription(request.getDescription());
        if (request.getApplicableProducts() != null) tax.setApplicableProducts(request.getApplicableProducts());
        if (request.getEffectiveStartDate() != null) tax.setEffectiveStartDate(request.getEffectiveStartDate());
        tax.setEffectiveEndDate(request.getEffectiveEndDate());
        if (request.getStatus() != null) tax.setStatus(request.getStatus());

        tax = taxRepository.save(tax);
        auditService.log("TAX_UPDATE", "Tax", tax.getId().toString(), "Updated tax: " + tax.getName());

        return mapToDto(tax);
    }

    @Transactional
    public void deleteTax(Long id) {
        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tax not found with id: " + id));
        tax.setStatus("INACTIVE");
        taxRepository.save(tax);
        auditService.log("TAX_DEACTIVATE", "Tax", id.toString(), "Deactivated tax: " + tax.getName());
    }

    public BigDecimal calculateTaxForAmount(BigDecimal taxableAmount, Long productId) {
        if (taxableAmount == null || taxableAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal totalTax = BigDecimal.ZERO;
        List<Tax> activeTaxes = taxRepository.findByStatus("ACTIVE");
        LocalDate now = LocalDate.now();

        for (Tax tax : activeTaxes) {
            // Check dates
            if (tax.getEffectiveStartDate() != null && tax.getEffectiveStartDate().isAfter(now)) continue;
            if (tax.getEffectiveEndDate() != null && tax.getEffectiveEndDate().isBefore(now)) continue;

            // Check product applicability
            String app = tax.getApplicableProducts();
            boolean applicable = "ALL".equalsIgnoreCase(app) || (productId != null && app != null && app.contains(productId.toString()));
            if (!applicable) continue;

            if ("PERCENTAGE".equalsIgnoreCase(tax.getTaxType())) {
                BigDecimal taxAmt = taxableAmount.multiply(tax.getRate()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
                totalTax = totalTax.add(taxAmt);
            } else if ("FIXED".equalsIgnoreCase(tax.getTaxType())) {
                totalTax = totalTax.add(tax.getRate());
            }
        }

        return totalTax.setScale(2, RoundingMode.HALF_UP);
    }

    public TaxDto mapToDto(Tax tax) {
        TaxDto dto = new TaxDto();
        dto.setId(tax.getId());
        dto.setName(tax.getName());
        dto.setTaxType(tax.getTaxType());
        dto.setRate(tax.getRate());
        dto.setDescription(tax.getDescription());
        dto.setApplicableProducts(tax.getApplicableProducts());
        dto.setEffectiveStartDate(tax.getEffectiveStartDate());
        dto.setEffectiveEndDate(tax.getEffectiveEndDate());
        dto.setStatus(tax.getStatus());
        dto.setCreatedAt(tax.getCreatedAt());
        return dto;
    }
}
