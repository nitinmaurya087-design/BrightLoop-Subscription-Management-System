package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.payment.PaymentDto;
import com.brightloop.dto.payment.PaymentReceiptDto;
import com.brightloop.dto.payment.PaymentRequest;
import com.brightloop.entity.*;
import com.brightloop.exception.BadRequestException;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.InvoiceRepository;
import com.brightloop.repository.PaymentReceiptRepository;
import com.brightloop.repository.PaymentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentReceiptRepository receiptRepository;
    private final InvoiceRepository invoiceRepository;
    private final EmailService emailService;
    private final AuditService auditService;

    public PaymentService(
            PaymentRepository paymentRepository,
            PaymentReceiptRepository receiptRepository,
            InvoiceRepository invoiceRepository,
            EmailService emailService,
            AuditService auditService
    ) {
        this.paymentRepository = paymentRepository;
        this.receiptRepository = receiptRepository;
        this.invoiceRepository = invoiceRepository;
        this.emailService = emailService;
        this.auditService = auditService;
    }

    public PageResponse<PaymentDto> getPayments(
            Long customerId, String method, String status, LocalDate startDate, LocalDate endDate, String query, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String m = (method != null && !method.trim().isEmpty() && !"ALL".equalsIgnoreCase(method)) ? method.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        Page<Payment> payPage = paymentRepository.searchPayments(customerId, m, st, startDate, endDate, q, pageable);
        Page<PaymentDto> dtoPage = payPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public List<PaymentDto> getCustomerPayments(Long customerId) {
        return paymentRepository.findByCustomerId(customerId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<PaymentDto> getInvoicePayments(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public PaymentDto getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
        return mapToDto(payment);
    }

    @Transactional
    public PaymentDto recordPayment(PaymentRequest request, User currentUser) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + request.getInvoiceId()));

        if ("PAID".equalsIgnoreCase(invoice.getStatus())) {
            throw new BadRequestException("Invoice " + invoice.getInvoiceNumber() + " is already fully paid");
        }

        if ("CANCELLED".equalsIgnoreCase(invoice.getStatus())) {
            throw new BadRequestException("Cannot record payment against a CANCELLED invoice");
        }

        BigDecimal paymentAmount = request.getAmount().setScale(2, RoundingMode.HALF_UP);
        if (paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        BigDecimal outstanding = invoice.getAmountOutstanding().setScale(2, RoundingMode.HALF_UP);
        if (paymentAmount.compareTo(outstanding) > 0) {
            throw new BadRequestException(String.format("Payment amount (₹%s) exceeds the outstanding invoice balance (₹%s)",
                    paymentAmount, outstanding));
        }

        // Record Payment
        Payment payment = new Payment();
        payment.setPaymentReference(generatePaymentReference());
        payment.setInvoice(invoice);
        payment.setCustomer(invoice.getCustomer());
        payment.setPaymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod().toUpperCase() : "UPI");
        payment.setAmount(paymentAmount);
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setTransactionReference(request.getTransactionReference() != null ? request.getTransactionReference() : "TXN-" + System.currentTimeMillis());
        payment.setNotes(request.getNotes());
        payment.setCreatedBy(currentUser != null ? currentUser.getEmail() : "SYSTEM");
        payment.setStatus("SUCCESS");

        payment = paymentRepository.save(payment);

        // Update Invoice status and balance
        BigDecimal newPaid = invoice.getAmountPaid().add(paymentAmount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal newOutstanding = invoice.getAmountOutstanding().subtract(paymentAmount).setScale(2, RoundingMode.HALF_UP);
        invoice.setAmountPaid(newPaid);
        invoice.setAmountOutstanding(newOutstanding);

        if (newOutstanding.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus("PAID");
        }
        invoiceRepository.save(invoice);

        // Generate Receipt
        String receiptNumber = generateReceiptNumber();
        String receiptData = String.format("{\"amount\": %s, \"method\": \"%s\", \"customer\": \"%s\", \"invoice\": \"%s\"}",
                paymentAmount, payment.getPaymentMethod(), invoice.getCustomer().getFullName(), invoice.getInvoiceNumber());
        PaymentReceipt receipt = new PaymentReceipt(payment, receiptNumber, receiptData);
        receiptRepository.save(receipt);

        emailService.sendPaymentReceiptEmail(
                invoice.getCustomer().getEmail(),
                payment.getPaymentReference(),
                paymentAmount.toString(),
                invoice.getInvoiceNumber()
        );

        auditService.log("PAYMENT_RECORDED", "Payment", payment.getId().toString(),
                String.format("Recorded payment %s of ₹%s for invoice %s", payment.getPaymentReference(), paymentAmount, invoice.getInvoiceNumber()));

        return mapToDto(payment);
    }

    public PaymentReceiptDto getReceiptByPaymentId(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        PaymentReceipt receipt = receiptRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found for payment ID: " + paymentId));

        PaymentReceiptDto dto = new PaymentReceiptDto();
        dto.setReceiptNumber(receipt.getReceiptNumber());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setInvoiceNumber(payment.getInvoice().getInvoiceNumber());
        dto.setCustomerName(payment.getCustomer().getFullName());
        dto.setCustomerCompany(payment.getCustomer().getCompanyName());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setTransactionReference(payment.getTransactionReference());
        dto.setIssuedAt(receipt.getIssuedAt());
        return dto;
    }

    private String generatePaymentReference() {
        long count = paymentRepository.count() + 1;
        return String.format("PAY-%d-%04d", Year.now().getValue(), count);
    }

    private String generateReceiptNumber() {
        long count = receiptRepository.count() + 1;
        return String.format("RCP-%d-%04d", Year.now().getValue(), count);
    }

    public PaymentDto mapToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setInvoiceId(payment.getInvoice() != null ? payment.getInvoice().getId() : null);
        dto.setInvoiceNumber(payment.getInvoice() != null ? payment.getInvoice().getInvoiceNumber() : null);
        dto.setCustomerId(payment.getCustomer() != null ? payment.getCustomer().getId() : null);
        dto.setCustomerName(payment.getCustomer() != null ? payment.getCustomer().getFullName() : null);
        dto.setCustomerCompany(payment.getCustomer() != null ? payment.getCustomer().getCompanyName() : null);
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setTransactionReference(payment.getTransactionReference());
        dto.setNotes(payment.getNotes());
        dto.setCreatedBy(payment.getCreatedBy());
        dto.setStatus(payment.getStatus());
        dto.setCreatedAt(payment.getCreatedAt());

        Optional<PaymentReceipt> rcptOpt = receiptRepository.findByPaymentId(payment.getId());
        rcptOpt.ifPresent(r -> dto.setReceiptNumber(r.getReceiptNumber()));

        return dto;
    }
}
