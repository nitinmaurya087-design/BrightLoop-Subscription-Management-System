package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.plan.PlanDto;
import com.brightloop.dto.plan.PlanRequest;
import com.brightloop.entity.Plan;
import com.brightloop.entity.Product;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.PlanRepository;
import com.brightloop.repository.ProductRepository;
import com.brightloop.repository.SubscriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PlanService {

    private final PlanRepository planRepository;
    private final ProductRepository productRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final AuditService auditService;

    public PlanService(
            PlanRepository planRepository,
            ProductRepository productRepository,
            SubscriptionRepository subscriptionRepository,
            AuditService auditService
    ) {
        this.planRepository = planRepository;
        this.productRepository = productRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.auditService = auditService;
    }

    public PageResponse<PlanDto> getPlans(String query, String frequency, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String f = (frequency != null && !frequency.trim().isEmpty() && !"ALL".equalsIgnoreCase(frequency)) ? frequency.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Plan> planPage = planRepository.searchPlans(q, f, st, pageable);
        Page<PlanDto> dtoPage = planPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public List<PlanDto> getAllActivePlans() {
        return planRepository.findByStatus("ACTIVE").stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PlanDto getPlanById(Long id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));
        return mapToDto(plan);
    }

    @Transactional
    public PlanDto createPlan(PlanRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        Plan plan = new Plan();
        plan.setName(request.getName().trim());
        plan.setDescription(request.getDescription());
        plan.setProduct(product);
        plan.setBillingPrice(request.getBillingPrice());
        plan.setBillingFrequency(request.getBillingFrequency().toUpperCase());
        plan.setMinQuantity(request.getMinQuantity() != null ? request.getMinQuantity() : 1);
        plan.setAvailableFrom(request.getAvailableFrom());
        plan.setAvailableUntil(request.getAvailableUntil());
        plan.setAutoCloseOnExpiry(request.getAutoCloseOnExpiry() != null ? request.getAutoCloseOnExpiry() : false);
        plan.setAllowEarlyClosure(request.getAllowEarlyClosure() != null ? request.getAllowEarlyClosure() : true);
        plan.setAllowPause(request.getAllowPause() != null ? request.getAllowPause() : true);
        plan.setAllowRenewal(request.getAllowRenewal() != null ? request.getAllowRenewal() : true);
        plan.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        plan = planRepository.save(plan);
        auditService.log("PLAN_CREATE", "Plan", plan.getId().toString(), "Created plan: " + plan.getName());

        return mapToDto(plan);
    }

    @Transactional
    public PlanDto updatePlan(Long id, PlanRequest request) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        if (request.getProductId() != null && !plan.getProduct().getId().equals(request.getProductId())) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));
            plan.setProduct(product);
        }

        plan.setName(request.getName().trim());
        plan.setDescription(request.getDescription());
        plan.setBillingPrice(request.getBillingPrice());
        plan.setBillingFrequency(request.getBillingFrequency().toUpperCase());
        if (request.getMinQuantity() != null) {
            plan.setMinQuantity(request.getMinQuantity());
        }
        plan.setAvailableFrom(request.getAvailableFrom());
        plan.setAvailableUntil(request.getAvailableUntil());
        if (request.getAutoCloseOnExpiry() != null) plan.setAutoCloseOnExpiry(request.getAutoCloseOnExpiry());
        if (request.getAllowEarlyClosure() != null) plan.setAllowEarlyClosure(request.getAllowEarlyClosure());
        if (request.getAllowPause() != null) plan.setAllowPause(request.getAllowPause());
        if (request.getAllowRenewal() != null) plan.setAllowRenewal(request.getAllowRenewal());
        if (request.getStatus() != null) plan.setStatus(request.getStatus());

        plan = planRepository.save(plan);
        auditService.log("PLAN_UPDATE", "Plan", plan.getId().toString(), "Updated plan: " + plan.getName());

        return mapToDto(plan);
    }

    @Transactional
    public void deletePlan(Long id) {
        Plan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + id));

        plan.setStatus("ARCHIVED");
        planRepository.save(plan);
        auditService.log("PLAN_ARCHIVE", "Plan", id.toString(), "Archived plan: " + plan.getName());
    }

    public PlanDto mapToDto(Plan plan) {
        PlanDto dto = new PlanDto();
        dto.setId(plan.getId());
        dto.setName(plan.getName());
        dto.setDescription(plan.getDescription());
        dto.setProductId(plan.getProduct() != null ? plan.getProduct().getId() : null);
        dto.setProductName(plan.getProduct() != null ? plan.getProduct().getName() : null);
        dto.setBillingPrice(plan.getBillingPrice());
        dto.setBillingFrequency(plan.getBillingFrequency());
        dto.setMinQuantity(plan.getMinQuantity());
        dto.setAvailableFrom(plan.getAvailableFrom());
        dto.setAvailableUntil(plan.getAvailableUntil());
        dto.setAutoCloseOnExpiry(plan.getAutoCloseOnExpiry());
        dto.setAllowEarlyClosure(plan.getAllowEarlyClosure());
        dto.setAllowPause(plan.getAllowPause());
        dto.setAllowRenewal(plan.getAllowRenewal());
        dto.setStatus(plan.getStatus());
        dto.setCreatedAt(plan.getCreatedAt());

        long activeSubs = subscriptionRepository.countByPlanIdAndStatus(plan.getId(), "ACTIVE");
        dto.setActiveSubscribersCount(activeSubs);

        return dto;
    }
}
