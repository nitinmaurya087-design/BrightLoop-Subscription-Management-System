package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.subscription.*;
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
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionLineRepository lineRepository;
    private final CustomerRepository customerRepository;
    private final PlanRepository planRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final BillingCalculationService calculationService;
    private final EmailService emailService;
    private final AuditService auditService;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            SubscriptionLineRepository lineRepository,
            CustomerRepository customerRepository,
            PlanRepository planRepository,
            ProductRepository productRepository,
            ProductVariantRepository productVariantRepository,
            BillingCalculationService calculationService,
            EmailService emailService,
            AuditService auditService
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.lineRepository = lineRepository;
        this.customerRepository = customerRepository;
        this.planRepository = planRepository;
        this.productRepository = productRepository;
        this.productVariantRepository = productVariantRepository;
        this.calculationService = calculationService;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    public PageResponse<SubscriptionDto> getSubscriptions(
            Long customerId, String status, String frequency, String query, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String freq = (frequency != null && !frequency.trim().isEmpty() && !"ALL".equalsIgnoreCase(frequency)) ? frequency.trim() : null;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Subscription> subPage = subscriptionRepository.searchSubscriptions(customerId, st, freq, q, pageable);
        Page<SubscriptionDto> dtoPage = subPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public List<SubscriptionDto> getCustomerSubscriptions(Long customerId) {
        return subscriptionRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public SubscriptionDto getSubscriptionById(Long id) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));
        return mapToDto(subscription);
    }

    @Transactional
    public SubscriptionDto createSubscription(SubscriptionRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + request.getCustomerId()));
        Plan plan = planRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found with id: " + request.getPlanId()));

        Subscription subscription = new Subscription();
        subscription.setSubscriptionNumber(generateSubscriptionNumber());
        subscription.setCustomer(customer);
        subscription.setPlan(plan);
        subscription.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        subscription.setExpiryDate(request.getExpiryDate() != null ? request.getExpiryDate() : calculateDefaultExpiry(subscription.getStartDate(), plan.getBillingFrequency()));
        subscription.setBillingFrequency(request.getBillingFrequency() != null ? request.getBillingFrequency().toUpperCase() : plan.getBillingFrequency());
        subscription.setPaymentTerms(request.getPaymentTerms() != null ? request.getPaymentTerms() : "Immediate");
        subscription.setStatus("CONFIRMED");
        subscription.setAutoCloseOnExpiry(plan.getAutoCloseOnExpiry());
        subscription.setAllowEarlyClosure(plan.getAllowEarlyClosure());
        subscription.setAllowPause(plan.getAllowPause());
        subscription.setAllowRenewal(plan.getAllowRenewal());
        subscription.setNotes(request.getNotes());
        subscription.setNextBillingDate(subscription.getStartDate());

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;
        int totalQty = 0;

        if (request.getLines() != null && !request.getLines().isEmpty()) {
            for (SubscriptionLineRequest lr : request.getLines()) {
                Product product = productRepository.findById(lr.getProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + lr.getProductId()));
                ProductVariant variant = lr.getVariantId() != null ? productVariantRepository.findById(lr.getVariantId()).orElse(null) : null;

                BigDecimal unitPrice = lr.getUnitPrice() != null ? lr.getUnitPrice() : calculationService.calculateUnitPrice(product.getId(), variant != null ? variant.getId() : null);
                int qty = lr.getQuantity() != null && lr.getQuantity() > 0 ? lr.getQuantity() : 1;
                totalQty += qty;

                BigDecimal lineSub = calculationService.calculateLineSubtotal(unitPrice, qty);
                BigDecimal lineTax = calculationService.calculateLineTax(lineSub, product.getId());
                BigDecimal lineTotal = lineSub.add(lineTax);

                SubscriptionLine line = new SubscriptionLine();
                line.setProduct(product);
                line.setVariant(variant);
                line.setQuantity(qty);
                line.setUnitPrice(unitPrice);
                line.setTaxRate(BigDecimal.valueOf(18.0));
                line.setDiscountAmount(BigDecimal.ZERO);
                line.setSubtotal(lineSub);
                line.setTotal(lineTotal);

                subscription.addLine(line);
                subtotal = subtotal.add(lineSub);
                totalTax = totalTax.add(lineTax);
            }
        } else {
            // Default plan line
            Product product = plan.getProduct();
            BigDecimal unitPrice = plan.getBillingPrice();
            int qty = plan.getMinQuantity() != null ? plan.getMinQuantity() : 1;
            totalQty += qty;
            BigDecimal lineSub = calculationService.calculateLineSubtotal(unitPrice, qty);
            BigDecimal lineTax = calculationService.calculateLineTax(lineSub, product.getId());
            BigDecimal lineTotal = lineSub.add(lineTax);

            SubscriptionLine line = new SubscriptionLine();
            line.setProduct(product);
            line.setQuantity(qty);
            line.setUnitPrice(unitPrice);
            line.setTaxRate(BigDecimal.valueOf(18.0));
            line.setDiscountAmount(BigDecimal.ZERO);
            line.setSubtotal(lineSub);
            line.setTotal(lineTotal);

            subscription.addLine(line);
            subtotal = subtotal.add(lineSub);
            totalTax = totalTax.add(lineTax);
        }

        BigDecimal discount = calculationService.calculateDiscount(request.getDiscountCode(), subtotal, totalQty);
        BigDecimal grandTotal = calculationService.calculateGrandTotal(subtotal, totalTax, discount);

        subscription.setSubtotal(subtotal);
        subscription.setTaxAmount(totalTax);
        subscription.setDiscountAmount(discount);
        subscription.setGrandTotal(grandTotal);

        subscription = subscriptionRepository.save(subscription);
        auditService.log("SUBSCRIPTION_CREATE", "Subscription", subscription.getId().toString(),
                "Created subscription " + subscription.getSubscriptionNumber() + " for " + customer.getFullName());

        return mapToDto(subscription);
    }

    @Transactional
    public SubscriptionDto handleAction(Long id, SubscriptionActionRequest request) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found with id: " + id));

        String action = request.getAction().toUpperCase();
        String currentStatus = subscription.getStatus().toUpperCase();

        switch (action) {
            case "CONFIRM" -> {
                if (!"DRAFT".equals(currentStatus) && !"QUOTATION".equals(currentStatus)) {
                    throw new BadRequestException("Can only confirm subscriptions in DRAFT or QUOTATION status");
                }
                subscription.setStatus("CONFIRMED");
            }
            case "ACTIVATE" -> {
                if (!"CONFIRMED".equals(currentStatus) && !"PAUSED".equals(currentStatus)) {
                    throw new BadRequestException("Can only activate subscriptions in CONFIRMED or PAUSED status");
                }
                subscription.setStatus("ACTIVE");
                if (subscription.getNextBillingDate() == null || subscription.getNextBillingDate().isBefore(LocalDate.now())) {
                    subscription.setNextBillingDate(calculateNextBillingDate(LocalDate.now(), subscription.getBillingFrequency()));
                }
                emailService.sendSubscriptionConfirmation(subscription.getCustomer().getEmail(), subscription.getSubscriptionNumber(), subscription.getPlan().getName());
            }
            case "PAUSE" -> {
                if (!"ACTIVE".equals(currentStatus)) {
                    throw new BadRequestException("Only ACTIVE subscriptions can be paused");
                }
                if (!Boolean.TRUE.equals(subscription.getAllowPause())) {
                    throw new BadRequestException("Plan configuration does not allow pausing this subscription");
                }
                subscription.setStatus("PAUSED");
            }
            case "RESUME" -> {
                if (!"PAUSED".equals(currentStatus)) {
                    throw new BadRequestException("Only PAUSED subscriptions can be resumed");
                }
                subscription.setStatus("ACTIVE");
                if (subscription.getNextBillingDate() == null || subscription.getNextBillingDate().isBefore(LocalDate.now())) {
                    subscription.setNextBillingDate(calculateNextBillingDate(LocalDate.now(), subscription.getBillingFrequency()));
                }
            }
            case "RENEW" -> {
                if (!Boolean.TRUE.equals(subscription.getAllowRenewal())) {
                    throw new BadRequestException("Plan configuration does not allow renewing this subscription");
                }
                LocalDate baseDate = subscription.getExpiryDate() != null && subscription.getExpiryDate().isAfter(LocalDate.now())
                        ? subscription.getExpiryDate()
                        : LocalDate.now();
                LocalDate newExpiry = request.getNewExpiryDate() != null ? request.getNewExpiryDate()
                        : calculateNextBillingDate(baseDate, subscription.getBillingFrequency());
                subscription.setExpiryDate(newExpiry);
                subscription.setStatus("ACTIVE");
                subscription.setNextBillingDate(calculateNextBillingDate(LocalDate.now(), subscription.getBillingFrequency()));
            }
            case "CLOSE" -> {
                LocalDate today = LocalDate.now();
                if (subscription.getExpiryDate() != null && subscription.getExpiryDate().isAfter(today) && !Boolean.TRUE.equals(subscription.getAllowEarlyClosure())) {
                    throw new BadRequestException("Plan configuration does not allow early closure before expiry date: " + subscription.getExpiryDate());
                }
                subscription.setStatus("CLOSED");
            }
            case "EARLY_TERMINATE" -> {
                if (!Boolean.TRUE.equals(subscription.getAllowEarlyClosure())) {
                    throw new BadRequestException("Early termination is prohibited by the plan lifecycle configuration");
                }
                subscription.setStatus("CLOSED");
                subscription.setExpiryDate(LocalDate.now());
            }
            default -> throw new BadRequestException("Unknown subscription action: " + action);
        }

        subscription = subscriptionRepository.save(subscription);
        auditService.log("SUBSCRIPTION_ACTION_" + action, "Subscription", subscription.getId().toString(),
                "Subscription " + subscription.getSubscriptionNumber() + " transitioned to " + subscription.getStatus() + ". Reason: " + request.getReason());

        return mapToDto(subscription);
    }

    public LocalDate calculateNextBillingDate(LocalDate currentBillingDate, String frequency) {
        if (currentBillingDate == null) currentBillingDate = LocalDate.now();
        if (frequency == null) frequency = "MONTHLY";

        return switch (frequency.toUpperCase()) {
            case "DAILY" -> currentBillingDate.plusDays(1);
            case "WEEKLY" -> currentBillingDate.plusWeeks(1);
            case "MONTHLY" -> currentBillingDate.plusMonths(1);
            case "YEARLY" -> currentBillingDate.plusYears(1);
            default -> currentBillingDate.plusMonths(1);
        };
    }

    private LocalDate calculateDefaultExpiry(LocalDate startDate, String frequency) {
        if (startDate == null) startDate = LocalDate.now();
        return switch (frequency.toUpperCase()) {
            case "DAILY" -> startDate.plusDays(30);
            case "WEEKLY" -> startDate.plusMonths(3);
            case "MONTHLY" -> startDate.plusYears(1);
            case "YEARLY" -> startDate.plusYears(1);
            default -> startDate.plusYears(1);
        };
    }

    private String generateSubscriptionNumber() {
        long count = subscriptionRepository.count() + 1;
        return String.format("SUB-%d-%04d", Year.now().getValue(), count);
    }

    public SubscriptionDto mapToDto(Subscription subscription) {
        SubscriptionDto dto = new SubscriptionDto();
        dto.setId(subscription.getId());
        dto.setSubscriptionNumber(subscription.getSubscriptionNumber());
        dto.setCustomerId(subscription.getCustomer() != null ? subscription.getCustomer().getId() : null);
        dto.setCustomerName(subscription.getCustomer() != null ? subscription.getCustomer().getFullName() : null);
        dto.setCustomerCompany(subscription.getCustomer() != null ? subscription.getCustomer().getCompanyName() : null);
        dto.setPlanId(subscription.getPlan() != null ? subscription.getPlan().getId() : null);
        dto.setPlanName(subscription.getPlan() != null ? subscription.getPlan().getName() : null);
        dto.setStartDate(subscription.getStartDate());
        dto.setExpiryDate(subscription.getExpiryDate());
        dto.setBillingFrequency(subscription.getBillingFrequency());
        dto.setPaymentTerms(subscription.getPaymentTerms());
        dto.setSubtotal(subscription.getSubtotal());
        dto.setTaxAmount(subscription.getTaxAmount());
        dto.setDiscountAmount(subscription.getDiscountAmount());
        dto.setGrandTotal(subscription.getGrandTotal());
        dto.setNextBillingDate(subscription.getNextBillingDate());
        dto.setStatus(subscription.getStatus());
        dto.setAutoCloseOnExpiry(subscription.getAutoCloseOnExpiry());
        dto.setAllowEarlyClosure(subscription.getAllowEarlyClosure());
        dto.setAllowPause(subscription.getAllowPause());
        dto.setAllowRenewal(subscription.getAllowRenewal());
        dto.setNotes(subscription.getNotes());
        dto.setCreatedAt(subscription.getCreatedAt());

        List<SubscriptionLine> lines = lineRepository.findBySubscriptionId(subscription.getId());
        dto.setLines(lines.stream().map(this::mapLineToDto).collect(Collectors.toList()));

        return dto;
    }

    private SubscriptionLineDto mapLineToDto(SubscriptionLine line) {
        SubscriptionLineDto dto = new SubscriptionLineDto();
        dto.setId(line.getId());
        dto.setProductId(line.getProduct().getId());
        dto.setProductName(line.getProduct().getName());
        dto.setVariantId(line.getVariant() != null ? line.getVariant().getId() : null);
        dto.setVariantName(line.getVariant() != null ? line.getVariant().getAttributeValue() : null);
        dto.setQuantity(line.getQuantity());
        dto.setUnitPrice(line.getUnitPrice());
        dto.setTaxRate(line.getTaxRate());
        dto.setDiscountAmount(line.getDiscountAmount());
        dto.setSubtotal(line.getSubtotal());
        dto.setTotal(line.getTotal());
        return dto;
    }
}
