package com.brightloop.service;

import com.brightloop.dto.quotation.QuotationTemplateDto;
import com.brightloop.dto.quotation.QuotationTemplateLineDto;
import com.brightloop.dto.quotation.QuotationTemplateRequest;
import com.brightloop.entity.Plan;
import com.brightloop.entity.Product;
import com.brightloop.entity.QuotationTemplate;
import com.brightloop.entity.QuotationTemplateLine;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.PlanRepository;
import com.brightloop.repository.ProductRepository;
import com.brightloop.repository.QuotationTemplateLineRepository;
import com.brightloop.repository.QuotationTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuotationTemplateService {

    private final QuotationTemplateRepository templateRepository;
    private final QuotationTemplateLineRepository lineRepository;
    private final ProductRepository productRepository;
    private final PlanRepository planRepository;
    private final AuditService auditService;

    public QuotationTemplateService(
            QuotationTemplateRepository templateRepository,
            QuotationTemplateLineRepository lineRepository,
            ProductRepository productRepository,
            PlanRepository planRepository,
            AuditService auditService
    ) {
        this.templateRepository = templateRepository;
        this.lineRepository = lineRepository;
        this.productRepository = productRepository;
        this.planRepository = planRepository;
        this.auditService = auditService;
    }

    public List<QuotationTemplateDto> getAllTemplates() {
        return templateRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public QuotationTemplateDto getTemplateById(Long id) {
        QuotationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation template not found with id: " + id));
        return mapToDto(template);
    }

    @Transactional
    public QuotationTemplateDto createTemplate(QuotationTemplateRequest request) {
        QuotationTemplate template = new QuotationTemplate();
        template.setName(request.getName().trim());
        template.setDescription(request.getDescription());
        template.setValidityDays(request.getValidityDays() != null ? request.getValidityDays() : 30);

        if (request.getLines() != null) {
            for (QuotationTemplateRequest.TemplateLineReq lr : request.getLines()) {
                Product product = productRepository.findById(lr.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lr.getProductId()));
                Plan plan = lr.getPlanId() != null ? planRepository.findById(lr.getPlanId()).orElse(null) : null;

                QuotationTemplateLine line = new QuotationTemplateLine();
                line.setProduct(product);
                line.setPlan(plan);
                line.setQuantity(lr.getQuantity() != null ? lr.getQuantity() : 1);
                line.setUnitPrice(lr.getUnitPrice() != null ? lr.getUnitPrice() : product.getSalesPrice());
                line.setTaxRate(lr.getTaxRate() != null ? lr.getTaxRate() : BigDecimal.valueOf(18.0));
                line.setDiscountAmount(lr.getDiscountAmount() != null ? lr.getDiscountAmount() : BigDecimal.ZERO);
                template.addLine(line);
            }
        }

        template = templateRepository.save(template);
        auditService.log("TEMPLATE_CREATE", "QuotationTemplate", template.getId().toString(), "Created quotation template: " + template.getName());

        return mapToDto(template);
    }

    @Transactional
    public void deleteTemplate(Long id) {
        QuotationTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation template not found with id: " + id));
        templateRepository.delete(template);
        auditService.log("TEMPLATE_DELETE", "QuotationTemplate", id.toString(), "Deleted quotation template: " + template.getName());
    }

    public QuotationTemplateDto mapToDto(QuotationTemplate template) {
        QuotationTemplateDto dto = new QuotationTemplateDto();
        dto.setId(template.getId());
        dto.setName(template.getName());
        dto.setDescription(template.getDescription());
        dto.setValidityDays(template.getValidityDays());
        dto.setCreatedAt(template.getCreatedAt());

        List<QuotationTemplateLine> lines = lineRepository.findByTemplateId(template.getId());
        dto.setLines(lines.stream().map(this::mapLineToDto).collect(Collectors.toList()));

        return dto;
    }

    private QuotationTemplateLineDto mapLineToDto(QuotationTemplateLine line) {
        QuotationTemplateLineDto dto = new QuotationTemplateLineDto();
        dto.setId(line.getId());
        dto.setProductId(line.getProduct().getId());
        dto.setProductName(line.getProduct().getName());
        dto.setPlanId(line.getPlan() != null ? line.getPlan().getId() : null);
        dto.setPlanName(line.getPlan() != null ? line.getPlan().getName() : null);
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTaxRate(line.getTaxRate());
        dto.setDiscountAmount(line.getDiscountAmount());
        return dto;
    }
}
