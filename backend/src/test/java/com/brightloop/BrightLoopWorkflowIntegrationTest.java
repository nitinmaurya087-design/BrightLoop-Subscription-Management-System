package com.brightloop;

import com.brightloop.dto.auth.AuthResponse;
import com.brightloop.dto.auth.LoginRequest;
import com.brightloop.dto.auth.RegisterRequest;
import com.brightloop.dto.customer.CustomerDto;
import com.brightloop.dto.customer.CustomerRequest;
import com.brightloop.dto.payment.PaymentDto;
import com.brightloop.dto.payment.PaymentRequest;
import com.brightloop.dto.quotation.QuotationDto;
import com.brightloop.dto.quotation.QuotationLineRequest;
import com.brightloop.dto.quotation.QuotationRequest;
import com.brightloop.dto.subscription.SubscriptionActionRequest;
import com.brightloop.dto.subscription.SubscriptionDto;
import com.brightloop.entity.Invoice;
import com.brightloop.entity.Role;
import com.brightloop.entity.User;
import com.brightloop.exception.BadRequestException;
import com.brightloop.exception.DuplicateResourceException;
import com.brightloop.repository.InvoiceRepository;
import com.brightloop.service.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class BrightLoopWorkflowIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomerService customerService;

    @Autowired
    private ProductService productService;

    @Autowired
    private PlanService planService;

    @Autowired
    private QuotationService quotationService;

    @Autowired
    private SubscriptionService subscriptionService;

    @Autowired
    private InvoiceService invoiceService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private BillingSchedulerService billingSchedulerService;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    void testAdminAndStaffAndCustomerLogin() {
        // Test Admin Login
        AuthResponse adminAuth = authService.login(new LoginRequest("admin@brightloop.com", "Admin@12345"));
        assertNotNull(adminAuth.getToken());
        assertEquals(Role.ADMIN, adminAuth.getRole());

        // Test Staff Login
        AuthResponse staffAuth = authService.login(new LoginRequest("staff@brightloop.com", "Staff@12345"));
        assertNotNull(staffAuth.getToken());
        assertEquals(Role.STAFF, staffAuth.getRole());

        // Test Customer Login
        AuthResponse custAuth = authService.login(new LoginRequest("customer@brightloop.com", "Customer@12345"));
        assertNotNull(custAuth.getToken());
        assertEquals(Role.CUSTOMER, custAuth.getRole());
    }

    @Test
    void testRegistrationAndDuplicateEmailPrevention() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("newuser@example.com");
        request.setPassword("SecretPass@2026");
        request.setFullName("Test User");
        request.setCompanyName("Test Inc");

        AuthResponse registered = authService.register(request);
        assertNotNull(registered.getToken());
        assertEquals(Role.CUSTOMER, registered.getRole());

        // Attempt duplicate registration
        assertThrows(DuplicateResourceException.class, () -> {
            authService.register(request);
        });
    }

    @Test
    void testQuotationConversionToSubscriptionAndPaymentFlow() {
        // 1. Create Customer
        CustomerRequest custReq = new CustomerRequest();
        custReq.setEmail("workflow.customer@brightloop.test");
        custReq.setFullName("Workflow Enterprise");
        custReq.setCompanyName("Workflow Corp");
        CustomerDto customer = customerService.createCustomer(custReq);
        assertNotNull(customer.getId());

        // 2. Create Quotation
        QuotationRequest qReq = new QuotationRequest();
        qReq.setCustomerId(customer.getId());
        qReq.setPaymentTerms("Net 15");

        QuotationLineRequest qLine = new QuotationLineRequest();
        qLine.setProductId(1L); // Business Core Suite
        qLine.setVariantId(2L); // Odoo edition
        qLine.setPlanId(1L);    // Monthly plan
        qLine.setQuantity(1);
        qReq.setLines(Collections.singletonList(qLine));

        QuotationDto quotation = quotationService.createQuotation(qReq);
        assertEquals("DRAFT", quotation.getStatus());
        assertTrue(quotation.getGrandTotal().compareTo(BigDecimal.ZERO) > 0);

        // 3. Confirm Quotation
        QuotationDto confirmed = quotationService.confirmQuotation(quotation.getId());
        assertEquals("CONFIRMED", confirmed.getStatus());

        // 4. Convert Quotation to Subscription
        SubscriptionDto subscription = quotationService.convertToSubscription(quotation.getId());
        assertNotNull(subscription.getId());
        assertEquals("CONFIRMED", subscription.getStatus());

        // 5. Activate Subscription
        SubscriptionActionRequest activateReq = new SubscriptionActionRequest();
        activateReq.setAction("ACTIVATE");
        SubscriptionDto activeSub = subscriptionService.handleAction(subscription.getId(), activateReq);
        assertEquals("ACTIVE", activeSub.getStatus());
        assertNotNull(activeSub.getNextBillingDate());

        // 6. Pause and Resume Subscription Lifecycle
        SubscriptionActionRequest pauseReq = new SubscriptionActionRequest();
        pauseReq.setAction("PAUSE");
        SubscriptionDto pausedSub = subscriptionService.handleAction(subscription.getId(), pauseReq);
        assertEquals("PAUSED", pausedSub.getStatus());

        SubscriptionActionRequest resumeReq = new SubscriptionActionRequest();
        resumeReq.setAction("RESUME");
        SubscriptionDto resumedSub = subscriptionService.handleAction(subscription.getId(), resumeReq);
        assertEquals("ACTIVE", resumedSub.getStatus());

        // 7. Trigger Automated Recurring Billing Run
        Map<String, Object> runResult = billingSchedulerService.executeBillingRun("TEST_RUN");
        assertNotNull(runResult.get("executionId"));

        // 8. Record Payment against an Invoice
        Invoice invoice = invoiceRepository.findAll().stream()
                .filter(i -> "CONFIRMED".equalsIgnoreCase(i.getStatus()) && i.getAmountOutstanding().compareTo(BigDecimal.ZERO) > 0)
                .findFirst()
                .orElse(null);

        assertNotNull(invoice);
        BigDecimal outstandingBefore = invoice.getAmountOutstanding();

        User adminUser = new User("admin@brightloop.com", "hash", Role.ADMIN, "ACTIVE");

        PaymentRequest payReq = new PaymentRequest();
        payReq.setInvoiceId(invoice.getId());
        payReq.setAmount(outstandingBefore); // Full payment
        payReq.setPaymentMethod("UPI");
        payReq.setTransactionReference("UPI-TEST-12345");

        PaymentDto payment = paymentService.recordPayment(payReq, adminUser);
        assertNotNull(payment.getId());
        assertEquals("SUCCESS", payment.getStatus());

        // Verify Invoice is now PAID with 0.00 outstanding balance
        Invoice updatedInvoice = invoiceRepository.findById(invoice.getId()).orElseThrow();
        assertEquals("PAID", updatedInvoice.getStatus());
        assertEquals(BigDecimal.ZERO.setScale(2), updatedInvoice.getAmountOutstanding().setScale(2));

        // 9. Verify Overpayment is Prevented
        PaymentRequest overpayReq = new PaymentRequest();
        overpayReq.setInvoiceId(invoice.getId());
        overpayReq.setAmount(BigDecimal.valueOf(100.00));
        assertThrows(BadRequestException.class, () -> {
            paymentService.recordPayment(overpayReq, adminUser);
        });
    }
}
