package com.brightloop.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${brightloop.mail.enabled:false}")
    private boolean mailEnabled;

    @Value("${brightloop.mail.from:noreply@brightloop.com}")
    private String mailFrom;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendEmail(String to, String subject, String body) {
        if (!mailEnabled || mailSender == null) {
            log.info("[DEV EMAIL FALLBACK] To: {} | Subject: {}\n--- Body ---\n{}\n------------", to, subject, body);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent successfully to {}", to);
        } catch (Exception e) {
            log.warn("Failed to send email via SMTP to {}: {}. Logging to console instead.", to, e.getMessage());
            log.info("[EMAIL LOG FALLBACK] To: {} | Subject: {}\n{}", to, subject, body);
        }
    }

    public void sendWelcomeEmail(String to, String fullName) {
        String subject = "Welcome to BrightLoop Subscription Management";
        String body = String.format("Hello %s,\n\nWelcome to BrightLoop! Your enterprise customer account has been created successfully.\nYou can now sign in to view your subscriptions, invoices, and payments.\n\nBest regards,\nThe BrightLoop Team", fullName);
        sendEmail(to, subject, body);
    }

    public void sendPasswordResetEmail(String to, String resetLink) {
        String subject = "BrightLoop - Password Reset Request";
        String body = String.format("Hello,\n\nWe received a request to reset your BrightLoop password.\nClick the link below to set a new password:\n%s\n\nThis link is valid for 2 hours. If you did not request this, please ignore this email.\n\nBest regards,\nThe BrightLoop Team", resetLink);
        sendEmail(to, subject, body);
    }

    public void sendQuotationEmail(String to, String quotationNumber, String grandTotal) {
        String subject = String.format("Quotation %s from BrightLoop", quotationNumber);
        String body = String.format("Hello,\n\nPlease find the details for your quotation %s.\nTotal Amount: ₹%s\nYou can review and confirm your offer directly through your customer portal.\n\nBest regards,\nBrightLoop Sales", quotationNumber, grandTotal);
        sendEmail(to, subject, body);
    }

    public void sendSubscriptionConfirmation(String to, String subscriptionNumber, String planName) {
        String subject = String.format("Subscription Confirmed: %s", subscriptionNumber);
        String body = String.format("Hello,\n\nYour subscription %s for plan '%s' is now active!\nThank you for choosing BrightLoop.\n\nBest regards,\nBrightLoop Team", subscriptionNumber, planName);
        sendEmail(to, subject, body);
    }

    public void sendInvoiceGenerated(String to, String invoiceNumber, String grandTotal, String dueDate) {
        String subject = String.format("New Invoice Generated: %s", invoiceNumber);
        String body = String.format("Hello,\n\nA new invoice %s for ₹%s has been generated.\nDue Date: %s.\nYou can view and pay your invoice through the customer portal.\n\nBest regards,\nBrightLoop Billing", invoiceNumber, grandTotal, dueDate);
        sendEmail(to, subject, body);
    }

    public void sendInvoiceDueReminder(String to, String invoiceNumber, String outstandingAmount, String dueDate) {
        String subject = String.format("Reminder: Invoice %s is due on %s", invoiceNumber, dueDate);
        String body = String.format("Hello,\n\nThis is a friendly reminder that invoice %s with an outstanding balance of ₹%s is due on %s.\n\nBest regards,\nBrightLoop Accounts", invoiceNumber, outstandingAmount, dueDate);
        sendEmail(to, subject, body);
    }

    public void sendOverdueInvoiceReminder(String to, String invoiceNumber, String outstandingAmount) {
        String subject = String.format("URGENT: Invoice %s is OVERDUE", invoiceNumber);
        String body = String.format("Hello,\n\nInvoice %s with an outstanding balance of ₹%s is currently overdue.\nPlease arrange payment at the earliest to prevent service interruption.\n\nBest regards,\nBrightLoop Credit Control", invoiceNumber, outstandingAmount);
        sendEmail(to, subject, body);
    }

    public void sendPaymentReceiptEmail(String to, String paymentReference, String amount, String invoiceNumber) {
        String subject = String.format("Payment Confirmation & Receipt: %s", paymentReference);
        String body = String.format("Hello,\n\nWe have received your payment of ₹%s against invoice %s.\nPayment Reference: %s.\nThank you for your business!\n\nBest regards,\nBrightLoop Finance", amount, invoiceNumber, paymentReference);
        sendEmail(to, subject, body);
    }
}
