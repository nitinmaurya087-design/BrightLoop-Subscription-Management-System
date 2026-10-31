package com.brightloop.service;

import com.brightloop.entity.*;
import com.brightloop.repository.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final PlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final DiscountRepository discountRepository;

    public ReportService(
            CustomerRepository customerRepository,
            ProductRepository productRepository,
            PlanRepository planRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository,
            DiscountRepository discountRepository
    ) {
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.discountRepository = discountRepository;
    }

    public Map<String, Object> getFinancialSummary(LocalDate startDate, LocalDate endDate) {
        if (startDate == null) startDate = LocalDate.now().minusMonths(1);
        if (endDate == null) endDate = LocalDate.now();

        BigDecimal revenueCollected = paymentRepository.sumCollectedBetween(startDate, endDate);
        BigDecimal outstanding = invoiceRepository.sumTotalOutstanding();
        long overdueCount = invoiceRepository.countOverdueInvoices(LocalDate.now());

        Map<String, Object> summary = new HashMap<>();
        summary.put("startDate", startDate);
        summary.put("endDate", endDate);
        summary.put("revenueCollected", revenueCollected != null ? revenueCollected : BigDecimal.ZERO);
        summary.put("outstandingAmount", outstanding != null ? outstanding : BigDecimal.ZERO);
        summary.put("overdueInvoicesCount", overdueCount);
        summary.put("activeSubscriptions", subscriptionRepository.countByStatus("ACTIVE"));
        return summary;
    }

    public byte[] exportReportCsv(String reportType) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out);

        switch (reportType.toUpperCase()) {
            case "REVENUE", "PAYMENTS" -> {
                writer.println("Payment Reference,Invoice Number,Customer Name,Payment Method,Amount,Payment Date,Transaction Ref,Status");
                List<Payment> payments = paymentRepository.findAll();
                for (Payment p : payments) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            p.getPaymentReference(),
                            p.getInvoice() != null ? p.getInvoice().getInvoiceNumber() : "",
                            p.getCustomer().getFullName(),
                            p.getPaymentMethod(),
                            p.getAmount(),
                            p.getPaymentDate(),
                            p.getTransactionReference(),
                            p.getStatus()
                    );
                }
            }
            case "INVOICES", "OUTSTANDING", "OVERDUE" -> {
                writer.println("Invoice Number,Customer Name,Invoice Date,Due Date,Subtotal,Tax,Discount,Grand Total,Paid,Outstanding,Status");
                List<Invoice> invoices = invoiceRepository.findAll();
                for (Invoice i : invoices) {
                    if ("OVERDUE".equalsIgnoreCase(reportType) && (!"CONFIRMED".equalsIgnoreCase(i.getStatus()) || i.getDueDate().isAfter(LocalDate.now()))) {
                        continue;
                    }
                    if ("OUTSTANDING".equalsIgnoreCase(reportType) && i.getAmountOutstanding().compareTo(BigDecimal.ZERO) <= 0) {
                        continue;
                    }
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            i.getInvoiceNumber(),
                            i.getCustomer().getFullName(),
                            i.getInvoiceDate(),
                            i.getDueDate(),
                            i.getSubtotal(),
                            i.getTotalTax(),
                            i.getTotalDiscount(),
                            i.getGrandTotal(),
                            i.getAmountPaid(),
                            i.getAmountOutstanding(),
                            i.getStatus()
                    );
                }
            }
            case "SUBSCRIPTIONS" -> {
                writer.println("Subscription Number,Customer Name,Plan Name,Frequency,Grand Total,Start Date,Expiry Date,Next Billing Date,Status");
                List<Subscription> subs = subscriptionRepository.findAll();
                for (Subscription s : subs) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            s.getSubscriptionNumber(),
                            s.getCustomer().getFullName(),
                            s.getPlan().getName(),
                            s.getBillingFrequency(),
                            s.getGrandTotal(),
                            s.getStartDate(),
                            s.getExpiryDate() != null ? s.getExpiryDate() : "",
                            s.getNextBillingDate() != null ? s.getNextBillingDate() : "",
                            s.getStatus()
                    );
                }
            }
            case "CUSTOMERS" -> {
                writer.println("Customer ID,Full Name,Email,Phone,Company,City,State,Registration Date,Status");
                List<Customer> customers = customerRepository.findAll();
                for (Customer c : customers) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            c.getId(),
                            c.getFullName(),
                            c.getEmail(),
                            c.getPhone() != null ? c.getPhone() : "",
                            c.getCompanyName() != null ? c.getCompanyName() : "",
                            c.getCity() != null ? c.getCity() : "",
                            c.getState() != null ? c.getState() : "",
                            c.getRegistrationDate(),
                            c.getStatus()
                    );
                }
            }
            case "PRODUCTS" -> {
                writer.println("Product ID,Name,Type,Sales Price,Cost Price,Status");
                List<Product> products = productRepository.findAll();
                for (Product p : products) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            p.getId(),
                            p.getName(),
                            p.getProductType(),
                            p.getSalesPrice(),
                            p.getCostPrice(),
                            p.getStatus()
                    );
                }
            }
            case "DISCOUNTS" -> {
                writer.println("Code,Name,Type,Value,Min Purchase,Current Usage,Max Usage,Status");
                List<Discount> discounts = discountRepository.findAll();
                for (Discount d : discounts) {
                    writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                            d.getCode(),
                            d.getName(),
                            d.getDiscountType(),
                            d.getDiscountValue(),
                            d.getMinPurchaseAmount(),
                            d.getCurrentUsageCount(),
                            d.getMaxUsageLimit(),
                            d.getStatus()
                    );
                }
            }
            default -> {
                writer.println("Report,Generated At");
                writer.println("\"" + reportType + "\",\"" + LocalDate.now() + "\"");
            }
        }

        writer.flush();
        return out.toByteArray();
    }
}
