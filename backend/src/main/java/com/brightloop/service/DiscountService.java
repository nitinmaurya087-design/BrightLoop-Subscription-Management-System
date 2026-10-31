package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.discount.*;
import com.brightloop.entity.Customer;
import com.brightloop.entity.Discount;
import com.brightloop.entity.DiscountUsage;
import com.brightloop.exception.BadRequestException;
import com.brightloop.exception.DuplicateResourceException;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.DiscountRepository;
import com.brightloop.repository.DiscountUsageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;
    private final DiscountUsageRepository usageRepository;
    private final AuditService auditService;

    public DiscountService(
            DiscountRepository discountRepository,
            DiscountUsageRepository usageRepository,
            AuditService auditService
    ) {
        this.discountRepository = discountRepository;
        this.usageRepository = usageRepository;
        this.auditService = auditService;
    }

    public PageResponse<DiscountDto> getDiscounts(String query, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Discount> discountPage = discountRepository.searchDiscounts(q, st, pageable);
        Page<DiscountDto> dtoPage = discountPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public DiscountDto getDiscountById(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));
        return mapToDto(discount);
    }

    public DiscountValidationResultDto validateCoupon(ValidateDiscountRequest request) {
        String code = request.getCode().trim().toUpperCase();
        Optional<Discount> discountOpt = discountRepository.findByCode(code);

        if (discountOpt.isEmpty()) {
            return new DiscountValidationResultDto(false, "Invalid coupon code", code, null, BigDecimal.ZERO, request.getAmount());
        }

        Discount discount = discountOpt.get();
        if (!"ACTIVE".equalsIgnoreCase(discount.getStatus())) {
            return new DiscountValidationResultDto(false, "This coupon is inactive", code, null, BigDecimal.ZERO, request.getAmount());
        }

        LocalDate today = LocalDate.now();
        if (discount.getStartDate() != null && discount.getStartDate().isAfter(today)) {
            return new DiscountValidationResultDto(false, "This coupon is not yet active", code, null, BigDecimal.ZERO, request.getAmount());
        }
        if (discount.getEndDate() != null && discount.getEndDate().isBefore(today)) {
            return new DiscountValidationResultDto(false, "This coupon has expired", code, null, BigDecimal.ZERO, request.getAmount());
        }

        if (discount.getMaxUsageLimit() != null && discount.getCurrentUsageCount() >= discount.getMaxUsageLimit()) {
            return new DiscountValidationResultDto(false, "This coupon has reached its maximum usage limit", code, null, BigDecimal.ZERO, request.getAmount());
        }

        if (discount.getMinPurchaseAmount() != null && request.getAmount().compareTo(discount.getMinPurchaseAmount()) < 0) {
            return new DiscountValidationResultDto(false, "Minimum purchase amount of ₹" + discount.getMinPurchaseAmount().setScale(2) + " required", code, null, BigDecimal.ZERO, request.getAmount());
        }

        int qty = request.getQuantity() != null ? request.getQuantity() : 1;
        if (discount.getMinQuantity() != null && qty < discount.getMinQuantity()) {
            return new DiscountValidationResultDto(false, "Minimum purchase quantity of " + discount.getMinQuantity() + " items required", code, null, BigDecimal.ZERO, request.getAmount());
        }

        BigDecimal discountAmt = BigDecimal.ZERO;
        if ("PERCENTAGE".equalsIgnoreCase(discount.getDiscountType())) {
            discountAmt = request.getAmount().multiply(discount.getDiscountValue()).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        } else if ("FIXED".equalsIgnoreCase(discount.getDiscountType())) {
            discountAmt = discount.getDiscountValue();
        }

        if (discountAmt.compareTo(request.getAmount()) > 0) {
            discountAmt = request.getAmount();
        }

        BigDecimal finalAmt = request.getAmount().subtract(discountAmt).setScale(2, RoundingMode.HALF_UP);
        return new DiscountValidationResultDto(true, "Coupon applied successfully!", code, discount.getDiscountType(), discountAmt, finalAmt);
    }

    @Transactional
    public void recordUsage(Discount discount, Customer customer, Long invoiceId, Long subscriptionId, BigDecimal amount) {
        if (discount.getMaxUsageLimit() != null && discount.getCurrentUsageCount() >= discount.getMaxUsageLimit()) {
            throw new BadRequestException("Discount usage limit reached");
        }

        discount.setCurrentUsageCount(discount.getCurrentUsageCount() + 1);
        discountRepository.save(discount);

        DiscountUsage usage = new DiscountUsage(discount, customer, invoiceId, subscriptionId, amount);
        usageRepository.save(usage);
    }

    @Transactional
    public DiscountDto createDiscount(DiscountRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (discountRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Discount with code '" + code + "' already exists");
        }

        Discount discount = new Discount();
        discount.setName(request.getName().trim());
        discount.setCode(code);
        discount.setDiscountType(request.getDiscountType() != null ? request.getDiscountType() : "PERCENTAGE");
        discount.setDiscountValue(request.getDiscountValue());
        discount.setMinPurchaseAmount(request.getMinPurchaseAmount() != null ? request.getMinPurchaseAmount() : BigDecimal.ZERO);
        discount.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 1);
        discount.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        discount.setEndDate(request.getEndDate());
        discount.setMaxUsageLimit(request.getMaxUsageLimit() != null ? request.getMaxUsageLimit() : 100);
        discount.setCurrentUsageCount(0);
        discount.setApplicableProducts(request.getApplicableProducts() != null ? request.getApplicableProducts() : "ALL");
        discount.setApplicableSubscriptions(request.getApplicableSubscriptions() != null ? request.getApplicableSubscriptions() : "ALL");
        discount.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        discount = discountRepository.save(discount);
        auditService.log("DISCOUNT_CREATE", "Discount", discount.getId().toString(), "Created discount rule: " + discount.getCode());

        return mapToDto(discount);
    }

    @Transactional
    public DiscountDto updateDiscount(Long id, DiscountRequest request) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));

        String code = request.getCode().trim().toUpperCase();
        if (!discount.getCode().equalsIgnoreCase(code) && discountRepository.existsByCode(code)) {
            throw new DuplicateResourceException("Discount with code '" + code + "' already exists");
        }

        discount.setName(request.getName().trim());
        discount.setCode(code);
        if (request.getDiscountType() != null) discount.setDiscountType(request.getDiscountType());
        discount.setDiscountValue(request.getDiscountValue());
        if (request.getMinPurchaseAmount() != null) discount.setMinPurchaseAmount(request.getMinPurchaseAmount());
        if (request.getMinQuantity() != null) discount.setMinQuantity(request.getMinQuantity());
        if (request.getStartDate() != null) discount.setStartDate(request.getStartDate());
        discount.setEndDate(request.getEndDate());
        if (request.getMaxUsageLimit() != null) discount.setMaxUsageLimit(request.getMaxUsageLimit());
        if (request.getApplicableProducts() != null) discount.setApplicableProducts(request.getApplicableProducts());
        if (request.getApplicableSubscriptions() != null) discount.setApplicableSubscriptions(request.getApplicableSubscriptions());
        if (request.getStatus() != null) discount.setStatus(request.getStatus());

        discount = discountRepository.save(discount);
        auditService.log("DISCOUNT_UPDATE", "Discount", discount.getId().toString(), "Updated discount rule: " + discount.getCode());

        return mapToDto(discount);
    }

    @Transactional
    public void deleteDiscount(Long id) {
        Discount discount = discountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Discount not found with id: " + id));
        discount.setStatus("INACTIVE");
        discountRepository.save(discount);
        auditService.log("DISCOUNT_DEACTIVATE", "Discount", id.toString(), "Deactivated discount rule: " + discount.getCode());
    }

    public DiscountDto mapToDto(Discount discount) {
        DiscountDto dto = new DiscountDto();
        dto.setId(discount.getId());
        dto.setName(discount.getName());
        dto.setCode(discount.getCode());
        dto.setDiscountType(discount.getDiscountType());
        dto.setDiscountValue(discount.getDiscountValue());
        dto.setMinPurchaseAmount(discount.getMinPurchaseAmount());
        dto.setMinQuantity(discount.getMinQuantity());
        dto.setStartDate(discount.getStartDate());
        dto.setEndDate(discount.getEndDate());
        dto.setMaxUsageLimit(discount.getMaxUsageLimit());
        dto.setCurrentUsageCount(discount.getCurrentUsageCount());
        dto.setApplicableProducts(discount.getApplicableProducts());
        dto.setApplicableSubscriptions(discount.getApplicableSubscriptions());
        dto.setStatus(discount.getStatus());
        dto.setCreatedAt(discount.getCreatedAt());
        return dto;
    }
}
