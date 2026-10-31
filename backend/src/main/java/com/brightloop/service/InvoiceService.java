package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.invoice.*;
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
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final InvoiceLineRepository lineRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BillingCalculationService calculationService;
    private final EmailService emailService;
    private final PdfService pdfService;
    private final AuditService auditService;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            InvoiceLineRepository lineRepository,
            CustomerRepository customerRepository,
            SubscriptionRepository subscriptionRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            BillingCalculationService calculationService,
            EmailService emailService,
            PdfService pdfService,
            AuditService auditService
    ) {
        this.invoiceRepository = invoiceRepository;
        this.lineRepository = lineRepository;
        this.customerRepository = customerRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.calculationService = calculationService;
        this.emailService = emailService;
        this.pdfService = pdfService;
        this.auditService = auditService;
    }

    public PageResponse<InvoiceDto> getInvoices(
            Long customerId, String status, LocalDate startDate, LocalDate endDate, String query, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Invoice> invPage = invoiceRepository.searchInvoices(customerId, st, startDate, endDate, q, pageable);
        Page<InvoiceDto> dtoPage = invPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public List<InvoiceDto> getCustomerInvoices(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<InvoiceDto> getOverdueInvoices() {
        return invoiceRepository.findOverdueInvoices(LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public InvoiceDto getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapToDto(invoice);
    }

    @Transactional
    public InvoiceDto createManualInvoice(InvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));

        Subscription subscription = null;
        if (request.getSubscriptionId() != null) {
            subscription = subscriptionRepository.findById(request.getSubscriptionId()).orElse(null);
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCustomer(customer);
        invoice.setSubscription(subscription);
        invoice.setInvoiceDate(request.getInvoiceDate() != null ? request.getInvoiceDate() : LocalDate.now());
        invoice.setDueDate(request.getDueDate() != null ? request.getDueDate() : invoice.getInvoiceDate().plusDays(15));
        invoice.setBillingPeriodStart(request.getBillingPeriodStart());
        invoice.setBillingPeriodEnd(request.getBillingPeriodEnd());
        invoice.setPaymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Net 15");
        invoice.setNotes(request.getNotes());
        invoice.setStatus("CONFIRMED");

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        int totalQty = 0;

        if (request.getLines() != null && !request.getLines().isEmpty()) {
            for (InvoiceRequest.InvoiceLineRequest lr : request.getLines()) {
                Product product = productRepository.findById(lr.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lr.getProductId()));
                ProductVariant variant = lr.getVariantId() != null ? productVariantRepository.findById(lr.getVariantId()).orElse(null) : null;

                BigDecimal unitPrice = calculationService.calculateUnitPrice(product.getId(), variant != null ? variant.getId() : null);
                int qty = lr.getQuantity() != null && lr.getQuantity() > 0 ? lr.getQuantity() : 1;
                totalQty += qty;

                BigDecimal lineSub = calculationService.calculateLineSubtotal(unitPrice, qty);
                BigDecimal lineTax = calculationService.calculateLineTax(lineSub, product.getId());
                BigDecimal lineTotal = lineSub.add(lineTax);

                String description = lr.getDescription() != null && !lr.getDescription().trim().isEmpty()
                        ? lr.getDescription()
                        : product.getName() + (variant != null ? " (" + variant.getAttributeValue() + ")" : "");

                InvoiceLine line = new InvoiceLine();
                line.setProduct(product);
                line.setVariant(variant);
                line.setDescription(description);
                line.setQuantity(qty);
                line.setUnitPrice(unitPrice);
                line.setTaxRate(BigDecimal.valueOf(18.0));
                line.setTaxAmount(lineTax);
                line.setDiscountAmount(BigDecimal.ZERO);
                line.setSubtotal(lineSub);
                line.setTotal(lineTotal);

                invoice.addLine(line);
                subtotal = subtotal.add(lineSub);
                totalTax = totalTax.add(lineTax);
            }
        }

        BigDecimal discount = calculationService.calculateDiscount(request.getDiscountCode(), subtotal, totalQty);
        BigDecimal grandTotal = calculationService.calculateGrandTotal(subtotal, totalTax, discount);

        invoice.setSubtotal(subtotal);
        invoice.setTotalTax(totalTax);
        invoice.setTotalDiscount(discount);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountOutstanding(grandTotal);

        invoice = invoiceRepository.save(invoice);

        emailService.sendInvoiceGenerated(
                customer.getEmail(),
                invoice.getInvoiceNumber(),
                invoice.getGrandTotal().setScale(2).toString(),
                invoice.getDueDate().toString()
        );

        auditService.log("INVOICE_CREATE", "Invoice", invoice.getId().toString(),
                "Created invoice " + invoice.getInvoiceNumber() + " for " + customer.getFullName());

        return mapToDto(invoice);
    }

    @Transactional
    public Invoice generateInvoiceForSubscription(Subscription subscription, LocalDate periodStart, LocalDate periodEnd) {
        // Idempotency: Check if an invoice already exists for this subscription and period
        if (invoiceRepository.existsBySubscriptionIdAndBillingPeriodStartAndBillingPeriodEnd(
                subscription.getId(), periodStart, periodEnd
        )) {
            // Already generated, return null to skip duplicate
            return null;
        }

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setCustomer(subscription.getCustomer());
        invoice.setSubscription(subscription);
        invoice.setInvoiceDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(15));
        invoice.setBillingPeriodStart(periodStart);
        invoice.setBillingPeriodEnd(periodEnd);
        invoice.setPaymentTerms(subscription.getPaymentTerms());
        invoice.setStatus("CONFIRMED");
        invoice.setNotes("Automated recurring billing for subscription " + subscription.getSubscriptionNumber());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (SubscriptionLine sLine : subscription.getLines()) {
            Product product = sLine.getProduct();
            ProductVariant variant = sLine.getVariant();

            String description = product.getName() + (variant != null ? " (" + variant.getAttributeValue() + ")" : "");
            InvoiceLine iLine = new InvoiceLine();
            iLine.setProduct(product);
            iLine.setVariant(variant);
            iLine.setDescription(description);
            iLine.setQuantity(sLine.getQuantity());
            iLine.setUnitPrice(sLine.getUnitPrice());
            iLine.setTaxRate(sLine.getTaxRate());
            iLine.setTaxAmount(sLine.getSubtotal().multiply(sLine.getTaxRate()).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP));
            iLine.setDiscountAmount(sLine.getDiscountAmount());
            iLine.setSubtotal(sLine.getSubtotal());
            iLine.setTotal(sLine.getTotal());

            invoice.addLine(iLine);
            subtotal = subtotal.add(sLine.getSubtotal());
            totalTax = totalTax.add(iLine.getTaxAmount());
        }

        BigDecimal discount = subscription.getDiscountAmount() != null ? subscription.getDiscountAmount() : BigDecimal.ZERO;
        BigDecimal grandTotal = calculationService.calculateGrandTotal(subtotal, totalTax, discount);

        invoice.setSubtotal(subtotal);
        invoice.setTotalTax(totalTax);
        invoice.setTotalDiscount(discount);
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setAmountOutstanding(grandTotal);

        invoice = invoiceRepository.save(invoice);

        emailService.sendInvoiceGenerated(
                subscription.getCustomer().getEmail(),
                invoice.getInvoiceNumber(),
                invoice.getGrandTotal().setScale(2).toString(),
                invoice.getDueDate().toString()
        );

        auditService.log("INVOICE_AUTO_GENERATE", "Invoice", invoice.getId().toString(),
                "Generated recurring invoice " + invoice.getInvoiceNumber() + " for subscription " + subscription.getSubscriptionNumber());

        return invoice;
    }

    @Transactional
    public InvoiceDto confirmInvoice(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        invoice.setStatus("CONFIRMED");
        invoice = invoiceRepository.save(invoice);
        auditService.log("INVOICE_CONFIRM", "Invoice", invoice.getId().toString(), "Confirmed invoice " + invoice.getInvoiceNumber());
        return mapToDto(invoice);
    }

    @Transactional
    public InvoiceDto cancelInvoice(Long id, String reason) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));

        if ("PAID".equalsIgnoreCase(invoice.getStatus())) {
            throw new BadRequestException("Cannot cancel an invoice that has been fully paid. Please initiate a refund first.");
        }

        invoice.setStatus("CANCELLED");
        invoice.setNotes((invoice.getNotes() != null ? invoice.getNotes() + "\n" : "") + "Cancelled: " + reason);
        invoice = invoiceRepository.save(invoice);

        auditService.log("INVOICE_CANCEL", "Invoice", invoice.getId().toString(),
                "Cancelled invoice " + invoice.getInvoiceNumber() + ". Reason: " + reason);

        return mapToDto(invoice);
    }

    public byte[] generatePdf(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return pdfService.generateInvoicePdf(invoice);
    }

    private String generateInvoiceNumber() {
        long count = invoiceRepository.count() + 1;
        return String.format("INV-%d-%04d", Year.now().getValue(), count);
    }

    public InvoiceDto mapToDto(Invoice invoice) {
        InvoiceDto dto = new InvoiceDto();
        dto.setId(invoice.getId());
        dto.setInvoiceNumber(invoice.getInvoiceNumber());
        dto.setCustomerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
        dto.setCustomerName(invoice.getCustomer() != null ? invoice.getCustomer().getFullName() : null);
        dto.setCustomerCompany(invoice.getCustomer() != null ? invoice.getCustomer().getCompanyName() : null);
        dto.setSubscriptionId(invoice.getSubscription() != null ? invoice.getSubscription().getId() : null);
        dto.setSubscriptionNumber(invoice.getSubscription() != null ? invoice.getSubscription().getSubscriptionNumber() : null);
        dto.setInvoiceDate(invoice.getInvoiceDate());
        dto.setDueDate(invoice.getDueDate());
        dto.setBillingPeriodStart(invoice.getBillingPeriodStart());
        dto.setBillingPeriodEnd(invoice.getBillingPeriodEnd());
        dto.setPaymentTerms(invoice.getPaymentTerms());
        dto.setSubtotal(invoice.getSubtotal());
        dto.setTotalTax(invoice.getTotalTax());
        dto.setTotalDiscount(invoice.getTotalDiscount());
        dto.setGrandTotal(invoice.getGrandTotal());
        dto.setAmountPaid(invoice.getAmountPaid());
        dto.setAmountOutstanding(invoice.getAmountOutstanding());
        dto.setStatus(invoice.getStatus());
        dto.setNotes(invoice.getNotes());
        dto.setCreatedAt(invoice.getCreatedAt());

        boolean isOverdue = "CONFIRMED".equalsIgnoreCase(invoice.getStatus())
                && invoice.getDueDate() != null
                && invoice.getDueDate().isBefore(LocalDate.now());
        dto.setOverdue(isOverdue);

        List<InvoiceLine> lines = lineRepository.findByInvoiceId(invoice.getId());
        dto.setLines(lines.stream().map(this::mapLineToDto).collect(Collectors.toList()));

        return dto;
    }

    private InvoiceLineDto mapLineToDto(InvoiceLine line) {
        InvoiceLineDto dto = new InvoiceLineDto();
        dto.setId(line.getId());
        dto.setProductId(line.getProduct().getId());
        dto.setProductName(line.getProduct().getName());
        dto.setVariantId(line.getVariant() != null ? line.getVariant().getId() : null);
        dto.setVariantName(line.getVariant() != null ? line.getVariant().getAttributeValue() : null);
        dto.setDescription(line.getDescription());
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTaxRate(line.getTaxRate());
        dto.setTaxAmount(line.getTaxAmount());
        dto.setDiscountAmount(line.getDiscountAmount());
        dto.setSubtotal(line.getSubtotal());
        dto.setTotal(line.getTotal());
        return dto;
    }
}
