package com.brightloop.controller;

import com.brightloop.dto.common.ApiResponse;
import com.brightloop.dto.quotation.QuotationTemplateDto;
import com.brightloop.dto.quotation.QuotationTemplateRequest;
import com.brightloop.service.QuotationTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/quotation-templates")
public class QuotationTemplateController {

    private final QuotationTemplateService templateService;

    public QuotationTemplateController(QuotationTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuotationTemplateDto>>> getAllTemplates() {
        List<QuotationTemplateDto> templates = templateService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("Quotation templates retrieved", templates));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuotationTemplateDto>> getTemplateById(@PathVariable Long id) {
        QuotationTemplateDto template = templateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Template retrieved", template));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<QuotationTemplateDto>> createTemplate(@Valid @RequestBody QuotationTemplateRequest request) {
        QuotationTemplateDto template = templateService.createTemplate(request);
        return ResponseEntity.ok(ApiResponse.success("Template created successfully", template));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Template deleted successfully", null));
    }
}
