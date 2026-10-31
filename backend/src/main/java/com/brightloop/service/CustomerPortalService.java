package com.brightloop.service;

import com.brightloop.dto.customer.CustomerDto;
import com.brightloop.dto.invoice.InvoiceDto;
import com.brightloop.dto.payment.PaymentDto;
import com.brightloop.dto.payment.PaymentReceiptDto;
import com.brightloop.dto.plan.PlanDto;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.entity.*;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.exception.UnauthorizedException;
import com.brightloop.repository.CustomerRepository;
import com.brightloop.repository.InvoiceRepository;
import com.brightloop.repository.PaymentRepository;
import com.brightloop.repository.SubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CustomerPortalService {

    private final CustomerRepository customerRepository;
    private final SubscriptionService subscriptionService;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceService invoiceService;
    private final InvoiceRepository invoiceRepository;
    private final PaymentService paymentService;
    private final PaymentRepository paymentRepository;
    private final PlanService planService;
    private final CustomerService customerService;
    private final AuditService auditService;

    public CustomerPortalService(
            CustomerRepository customerRepository,
            SubscriptionService subscriptionService,
            SubscriptionRepository subscriptionRepository,
            InvoiceService invoiceService,
            InvoiceRepository invoiceRepository,
            PaymentService paymentService,
            PaymentRepository paymentRepository,
            PlanService planService,
            CustomerService customerService,
            AuditService auditService
    ) {
        this.customerRepository = customerRepository;
        this.subscriptionService = subscriptionService;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceService = invoiceService;
        this.invoiceRepository = invoiceRepository;
        this.paymentService = paymentService;
        this.paymentRepository = paymentRepository;
        this.planService = planService;
        this.customerService = customerService;
        this.auditService = auditService;
    }

    public Customer getAuthenticatedCustomer(User user) {
        if (user == null) {
            throw new UnauthorizedException("User not authenticated");
        }
        return customerRepository.findByUser(user)
                .or(() -> customerRepository.findByEmail(user.getEmail()))
                .orElseThrow(() -> new ResourceNotFoundException("No customer account linked with email: " + user.getEmail()));
    }

    public Map<String, Object> getPortalDashboard(User user) {
        Customer customer = getAuthenticatedCustomer(user);
        Long customerId = customer.getId();

        List<Subscription> subs = subscriptionRepository.findByCustomerId(customerId);
        long activeSubs = subs.stream().filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus())).count();

        // Upcoming renewal
        LocalDate nextRenewal = null;
        for (Subscription s : subs) {
            if ("ACTIVE".equalsIgnoreCase(s.getStatus()) && s.getNextBillingDate() != null) {
                if (nextRenewal == null || s.getNextBillingDate().isBefore(nextRenewal)) {
                    nextRenewal = s.getNextBillingDate();
                }
            }
        }

        // Invoices and payments
        List<Invoice> invoices = invoiceRepository.findByCustomerId(customerId);
        BigDecimal outstanding = BigDecimal.ZERO;
        for (Invoice inv : invoices) {
            if ("CONFIRMED".equalsIgnoreCase(inv.getStatus())) {
                outstanding = outstanding.add(inv.getAmountOutstanding());
            }
        }

        BigDecimal totalPaid = paymentRepository.sumTotalSpentByCustomer(customerId);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("customerName", customer.getFullName());
        dashboard.put("companyName", customer.getCompanyName());
        dashboard.put("activeSubscriptionsCount", activeSubs);
        dashboard.put("nextRenewalDate", nextRenewal);
        dashboard.put("totalOutstandingAmount", outstanding.setScale(2, RoundingMode.HALF_UP));
        dashboard.put("totalPaymentsAmount", totalPaid != null ? totalPaid.setScale(2, RoundingMode.HALF_UP) : BigDecimal.ZERO);
        dashboard.put("totalInvoicesCount", invoices.size());
        return dashboard;
    }

    public CustomerDto getProfile(User user) {
        Customer customer = getAuthenticatedCustomer(user);
        return customerService.mapToDto(customer);
    }

    @Transactional
    public CustomerDto updateProfile(User user, Map<String, String> updates) {
        Customer customer = getAuthenticatedCustomer(user);

        if (updates.containsKey("fullName") && updates.get("fullName") != null) {
            customer.setFullName(updates.get("fullName").trim());
        }
        if (updates.containsKey("phone")) customer.setPhone(updates.get("phone"));
        if (updates.containsKey("companyName")) customer.setCompanyName(updates.get("companyName"));
        if (updates.containsKey("billingAddress")) customer.setBillingAddress(updates.get("billingAddress"));
        if (updates.containsKey("city")) customer.setCity(updates.get("city"));
        if (updates.containsKey("state")) customer.setState(updates.get("state"));
        if (updates.containsKey("postalCode")) customer.setPostalCode(updates.get("postalCode"));
        if (updates.containsKey("taxId")) customer.setTaxId(updates.get("taxId"));

        customer = customerRepository.save(customer);
        auditService.log("CUSTOMER_PORTAL_UPDATE", "Customer", customer.getId().toString(), "Customer updated profile details");

        return customerService.mapToDto(customer);
    }

    public List<SubscriptionDto> getMySubscriptions(User user) {
        Customer customer = getAuthenticatedCustomer(user);
        return subscriptionService.getCustomerSubscriptions(customer.getId());
    }

    public List<InvoiceDto> getMyInvoices(User user) {
        Customer customer = getAuthenticatedCustomer(user);
        return invoiceService.getCustomerInvoices(customer.getId());
    }

    public List<PaymentDto> getMyPayments(User user) {
        Customer customer = getAuthenticatedCustomer(user);
        return paymentService.getCustomerPayments(customer.getId());
    }

    public List<PlanDto> getAvailablePlans() {
        return planService.getAllActivePlans();
    }

    public byte[] downloadMyInvoicePdf(User user, Long invoiceId) {
        Customer customer = getAuthenticatedCustomer(user);
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

        if (!invoice.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("Access Denied: You cannot download invoices belonging to other customers.");
        }

        return invoiceService.generatePdf(invoiceId);
    }

    public PaymentReceiptDto getMyPaymentReceipt(User user, Long paymentId) {
        Customer customer = getAuthenticatedCustomer(user);
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        if (!payment.getCustomer().getId().equals(customer.getId())) {
            throw new UnauthorizedException("Access Denied: You cannot view receipts belonging to other customers.");
        }

        return paymentService.getReceiptByPaymentId(paymentId);
    }
}
