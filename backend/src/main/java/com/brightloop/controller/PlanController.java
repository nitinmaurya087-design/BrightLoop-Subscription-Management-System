package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.plan.PlanDto;
import com.brightloop.dto.plan.PlanRequest;
import com.brightloop.service.PlanService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/plans")
public class PlanController {

    private final PlanService planService;

    public PlanController(PlanService planService) {
        this.planService = planService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PlanDto>>> getPlans(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String frequency,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        PageResponse<PlanDto> response = planService.getPlans(query, frequency, status, page, size);
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved successfully", response));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<PlanDto>>> getActivePlans() {
        List<PlanDto> plans = planService.getAllActivePlans();
        return ResponseEntity.ok(ApiResponse.success("Active plans retrieved", plans));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PlanDto>> getPlanById(@PathVariable Long id) {
        PlanDto plan = planService.getPlanById(id);
        return ResponseEntity.ok(ApiResponse.success("Plan retrieved successfully", plan));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlanDto>> createPlan(@Valid @RequestBody PlanRequest request) {
        PlanDto plan = planService.createPlan(request);
        return ResponseEntity.ok(ApiResponse.success("Plan created successfully", plan));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlanDto>> updatePlan(
            @PathVariable Long id,
            @Valid @RequestBody PlanRequest request
    ) {
        PlanDto plan = planService.updatePlan(id, request);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable Long id) {
        planService.deletePlan(id);
        return ResponseEntity.ok(ApiResponse.success("Plan archived successfully", null));
    }
}
