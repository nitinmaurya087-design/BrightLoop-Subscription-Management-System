package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.quotation.*;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.dto.subscription.SubscriptionRequest;
import com.brightloop.dto.subscription.SubscriptionLineRequest;
import com.brightloop.entity.*;
import com.brightloop.exception.BadRequestException;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final QuotationLineRepository lineRepository;
    private final CustomerRepository customerRepository;
    private final QuotationTemplateRepository templateRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final PlanRepository planRepository;
    private final BillingCalculationService calculationService;
    private final SubscriptionService subscriptionService;
    private final EmailService emailService;
    private final PdfService pdfService;
    private final AuditService auditService;

    public QuotationService(
            QuotationRepository quotationRepository,
            QuotationLineRepository lineRepository,
            CustomerRepository customerRepository,
            QuotationTemplateRepository templateRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            PlanRepository planRepository,
            BillingCalculationService calculationService,
            SubscriptionService subscriptionService,
            EmailService emailService,
            PdfService pdfService,
            AuditService auditService
    ) {
        this.quotationRepository = quotationRepository;
        this.lineRepository = lineRepository;
        this.customerRepository = customerRepository;
        this.templateRepository = templateRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.planRepository = planRepository;
        this.calculationService = calculationService;
        this.subscriptionService = subscriptionService;
        this.emailService = emailService;
        this.pdfService = pdfService;
        this.auditService = auditService;
    }

    public PageResponse<QuotationDto> getQuotations(Long customerId, String status, String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Quotation> qPage = quotationRepository.searchQuotations(customerId, st, q, pageable);
        Page<QuotationDto> dtoPage = qPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public QuotationDto getQuotationById(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
        return mapToDto(quotation);
    }

    @Transactional
    public QuotationDto createQuotation(QuotationRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        QuotationTemplate template = null;
        if (request.getTemplateId() != null) {
            template = templateRepository.findById(request.getTemplateId()).orElse(null);
        }

        Quotation quotation = new Quotation();
        quotation.setQuotationNumber(generateQuotationNumber());
        quotation.setCustomer(customer);
        quotation.setTemplate(template);
        quotation.setCreationDate(request.getCreationDate() != null ? request.getCreationDate() : LocalDate.now());
        quotation.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : quotation.getCreationDate().plusDays(30));
        quotation.setPaymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Net 30");
        quotation.setNotes(request.getNotes());
        quotation.setStatus("DRAFT");

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        int totalQty = 0;

        for (QuotationLineRequest lr : request.getLines()) {
            Product product = productRepository.findById(lr.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lr.getProductId()));
            ProductVariant variant = lr.getVariantId() != null ? productVariantRepository.findById(lr.getVariantId()).orElse(null) : null;
            Plan plan = lr.getPlanId() != null ? planRepository.findById(lr.getPlanId()).orElse(null) : null;

            BigDecimal unitPrice = lr.getUnitPrice() != null ? lr.getUnitPrice()
                    : calculationService.calculateUnitPrice(product.getId(), variant != null ? variant.getId() : null);
            int qty = lr.getQuantity() != null && lr.getQuantity() > 0 ? lr.getQuantity() : 1;
            totalQty += qty;

            BigDecimal lineSub = calculationService.calculateLineSubtotal(unitPrice, qty);
            BigDecimal lineTax = calculationService.calculateLineTax(lineSub, product.getId());
            BigDecimal lineTotal = lineSub.add(lineTax);

            QuotationLine line = new QuotationLine();
            line.setProduct(product);
            line.setVariant(variant);
            line.setPlan(plan);
            line.setQuantity(qty);
            line.setUnitPrice(unitPrice);
            line.setTaxAmount(lineTax);
            line.setDiscountAmount(BigDecimal.ZERO);
            line.setSubtotal(lineSub);
            line.setTotal(lineTotal);

            quotation.addLine(line);
            subtotal = subtotal.add(lineSub);
            totalTax = totalTax.add(lineTax);
        }

        BigDecimal discount = calculationService.calculateDiscount(request.getDiscountCode(), subtotal, totalQty);
        BigDecimal grandTotal = calculationService.calculateGrandTotal(subtotal, totalTax, discount);

        quotation.setSubtotal(subtotal);
        quotation.setTaxAmount(totalTax);
        quotation.setDiscountAmount(discount);
        quotation.setGrandTotal(grandTotal);

        quotation = quotationRepository.save(quotation);
        auditService.log("QUOTATION_CREATE", "Quotation", quotation.getId().toString(),
                "Created quotation " + quotation.getQuotationNumber() + " for " + customer.getFullName());

        return mapToDto(quotation);
    }

    @Transactional
    public QuotationDto confirmQuotation(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        quotation.setStatus("CONFIRMED");
        quotation = quotationRepository.save(quotation);

        emailService.sendQuotationEmail(
                quotation.getCustomer().getEmail(),
                quotation.getQuotationNumber(),
                quotation.getGrandTotal().setScale(2).toString()
        );

        auditService.log("QUOTATION_CONFIRM", "Quotation", quotation.getId().toString(),
                "Confirmed quotation " + quotation.getQuotationNumber());

        return mapToDto(quotation);
    }

    @Transactional
    public SubscriptionDto convertToSubscription(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));

        if (!"CONFIRMED".equalsIgnoreCase(quotation.getStatus()) && !"QUOTATION".equalsIgnoreCase(quotation.getStatus())) {
            throw new BadRequestException("Only CONFIRMED or active QUOTATIONS can be converted to subscriptions");
        }

        if (quotation.getConvertedSubscriptionId() != null) {
            throw new BadRequestException("This quotation has already been converted to subscription ID: " + quotation.getConvertedSubscriptionId());
        }

        // Identify linked plan from lines or find default active plan
        Long planId = null;
        for (QuotationLine line : quotation.getLines()) {
            if (line.getPlan() != null) {
                planId = line.getPlan().getId();
                break;
            }
        }
        if (planId == null) {
            List<Plan> activePlans = planRepository.findByStatus("ACTIVE");
            if (activePlans.isEmpty()) {
                throw new BadRequestException("Cannot convert quotation: No active subscription plan found in system");
            }
            planId = activePlans.get(0).getId();
        }

        // Prepare SubscriptionRequest
        SubscriptionRequest subReq = new SubscriptionRequest();
        subReq.setCustomerId(quotation.getCustomer().getId());
        subReq.setPlanId(planId);
        subReq.setStartDate(LocalDate.now());
        subReq.setPaymentTerms(quotation.getPaymentTerms());
        subReq.setNotes("Generated from Quotation " + quotation.getQuotationNumber());

        List<SubscriptionLineRequest> subLines = new ArrayList<>();
        for (QuotationLine ql : quotation.getLines()) {
            SubscriptionLineRequest slr = new SubscriptionLineRequest();
            slr.setProductId(ql.getProduct().getId());
            slr.setVariantId(ql.getVariant() != null ? ql.getVariant().getId() : null);
            slr.setQuantity(ql.getQuantity());
            slr.setUnitPrice(ql.getUnitPrice());
            slr.setTaxRate(BigDecimal.valueOf(18.0));
            subLines.add(slr);
        }
        subReq.setLines(subLines);

        SubscriptionDto subscription = subscriptionService.createSubscription(subReq);

        // Update quotation
        quotation.setStatus("ACTIVE");
        quotation.setConvertedSubscriptionId(subscription.getId());
        quotationRepository.save(quotation);

        auditService.log("QUOTATION_CONVERTED", "Quotation", quotation.getId().toString(),
                "Quotation " + quotation.getQuotationNumber() + " successfully converted to subscription " + subscription.getSubscriptionNumber());

        return subscription;
    }

    public byte[] generatePdf(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
        return pdfService.generateQuotationPdf(quotation);
    }

    private String generateQuotationNumber() {
        long count = quotationRepository.count() + 1;
        return String.format("QTN-%d-%04d", Year.now().getValue(), count);
    }

    public QuotationDto mapToDto(Quotation quotation) {
        QuotationDto dto = new QuotationDto();
        dto.setId(quotation.getId());
        dto.setQuotationNumber(quotation.getQuotationNumber());
        dto.setCustomerId(quotation.getCustomer() != null ? quotation.getCustomer().getId() : null);
        dto.setCustomerName(quotation.getCustomer() != null ? quotation.getCustomer().getFullName() : null);
        dto.setCustomerCompany(quotation.getCustomer() != null ? quotation.getCustomer().getCompanyName() : null);
        dto.setTemplateId(quotation.getTemplate() != null ? quotation.getTemplate().getId() : null);
        dto.setTemplateName(quotation.getTemplate() != null ? quotation.getTemplate().getName() : null);
        dto.setCreationDate(quotation.getCreationDate());
        dto.setExpiryDate(quotation.getExpiryDate());
        dto.setPaymentTerms(quotation.getPaymentTerms());
        dto.setNotes(quotation.getNotes());
        dto.setSubtotal(quotation.getSubtotal());
        dto.setTaxAmount(quotation.getTaxAmount());
        dto.setDiscountAmount(quotation.getDiscountAmount());
        dto.setGrandTotal(quotation.getGrandTotal());
        dto.setStatus(quotation.getStatus());
        dto.setConvertedSubscriptionId(quotation.getConvertedSubscriptionId());
        dto.setCreatedAt(quotation.getCreatedAt());

        List<QuotationLine> lines = lineRepository.findByQuotationId(quotation.getId());
        dto.setLines(lines.stream().map(this::mapLineToDto).collect(Collectors.toList()));

        return dto;
    }

    private QuotationLineDto mapLineToDto(QuotationLine line) {
        QuotationLineDto dto = new QuotationLineDto();
        dto.setId(line.getId());
        dto.setProductId(line.getProduct().getId());
        dto.setProductName(line.getProduct().getName());
        dto.setVariantId(line.getVariant() != null ? line.getVariant().getId() : null);
        dto.setVariantName(line.getVariant() != null ? line.getVariant().getAttributeValue() : null);
        dto.setPlanId(line.getPlan() != null ? line.getPlan().getId() : null);
        dto.setPlanName(line.getPlan() != null ? line.getPlan().getName() : null);
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTaxAmount(line.getTaxAmount());
        dto.setDiscountAmount(line.getDiscountAmount());
        dto.setSubtotal(line.getSubtotal());
        dto.setTotal(line.getTotal());
        return dto;
    }
}
