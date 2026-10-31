package com.brightloop.service;

import com.brightloop.dto.common.PageResponse;
import com.brightloop.dto.customer.CustomerDto;
import com.brightloop.dto.customer.CustomerRequest;
import com.brightloop.entity.Customer;
import com.brightloop.exception.BadRequestException;
import com.brightloop.exception.DuplicateResourceException;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.CustomerRepository;
import com.brightloop.repository.InvoiceRepository;
import com.brightloop.repository.PaymentRepository;
import com.brightloop.repository.SubscriptionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final PaymentRepository paymentRepository;
    private final AuditService auditService;

    public CustomerService(
            CustomerRepository customerRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            PaymentRepository paymentRepository,
            AuditService auditService
    ) {
        this.customerRepository = customerRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.paymentRepository = paymentRepository;
        this.auditService = auditService;
    }

    public PageResponse<CustomerDto> getCustomers(String query, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        String st = (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) ? status.trim() : null;

        Page<Customer> customerPage = customerRepository.searchCustomers(q, st, pageable);
        Page<CustomerDto> dtoPage = customerPage.map(this::mapToDto);
        return PageResponse.of(dtoPage);
    }

    public CustomerDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto createCustomer(CustomerRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (customerRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("A customer with email " + email + " already exists");
        }

        Customer customer = new Customer();
        customer.setFullName(request.getFullName().trim());
        customer.setEmail(email);
        customer.setPhone(request.getPhone());
        customer.setCompanyName(request.getCompanyName());
        customer.setBillingAddress(request.getBillingAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setCountry(request.getCountry() != null ? request.getCountry() : "India");
        customer.setPostalCode(request.getPostalCode());
        customer.setTaxId(request.getTaxId());
        customer.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        customer.setRegistrationDate(LocalDate.now());

        customer = customerRepository.save(customer);
        auditService.log("CUSTOMER_CREATE", "Customer", customer.getId().toString(), "Created customer: " + customer.getFullName());

        return mapToDto(customer);
    }

    @Transactional
    public CustomerDto updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        String newEmail = request.getEmail().trim().toLowerCase();
        if (!customer.getEmail().equalsIgnoreCase(newEmail) && customerRepository.existsByEmail(newEmail)) {
            throw new DuplicateResourceException("A customer with email " + newEmail + " already exists");
        }

        customer.setFullName(request.getFullName().trim());
        customer.setEmail(newEmail);
        customer.setPhone(request.getPhone());
        customer.setCompanyName(request.getCompanyName());
        customer.setBillingAddress(request.getBillingAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setCountry(request.getCountry());
        customer.setPostalCode(request.getPostalCode());
        customer.setTaxId(request.getTaxId());
        if (request.getStatus() != null) {
            customer.setStatus(request.getStatus());
        }

        customer = customerRepository.save(customer);
        auditService.log("CUSTOMER_UPDATE", "Customer", customer.getId().toString(), "Updated customer: " + customer.getFullName());

        return mapToDto(customer);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        // Business Validation: Do not hard delete if customer has active subscriptions or invoices
        long activeSubs = subscriptionRepository.findByCustomerId(id).stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()) || "CONFIRMED".equalsIgnoreCase(s.getStatus()))
                .count();

        if (activeSubs > 0) {
            // Soft-archive instead to protect billing history
            customer.setStatus("ARCHIVED");
            customerRepository.save(customer);
            auditService.log("CUSTOMER_ARCHIVE", "Customer", customer.getId().toString(),
                    "Customer has " + activeSubs + " active subscriptions; archived instead of deleting.");
            return;
        }

        long invoiceCount = invoiceRepository.countByCustomerId(id);
        if (invoiceCount > 0) {
            customer.setStatus("ARCHIVED");
            customerRepository.save(customer);
            auditService.log("CUSTOMER_ARCHIVE", "Customer", customer.getId().toString(),
                    "Customer has existing historical invoices; archived instead of deleting.");
            return;
        }

        customerRepository.delete(customer);
        auditService.log("CUSTOMER_DELETE", "Customer", id.toString(), "Hard deleted customer ID: " + id);
    }

    public CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setUserId(customer.getUser() != null ? customer.getUser().getId() : null);
        dto.setFullName(customer.getFullName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setCompanyName(customer.getCompanyName());
        dto.setBillingAddress(customer.getBillingAddress());
        dto.setCity(customer.getCity());
        dto.setState(customer.getState());
        dto.setCountry(customer.getCountry());
        dto.setPostalCode(customer.getPostalCode());
        dto.setTaxId(customer.getTaxId());
        dto.setStatus(customer.getStatus());
        dto.setRegistrationDate(customer.getRegistrationDate());
        dto.setCreatedAt(customer.getCreatedAt());

        dto.setSubscriptionsCount(subscriptionRepository.countByCustomerId(customer.getId()));
        dto.setInvoicesCount(invoiceRepository.countByCustomerId(customer.getId()));
        BigDecimal totalSpent = paymentRepository.sumTotalSpentByCustomer(customer.getId());
        dto.setTotalSpent(totalSpent != null ? totalSpent : BigDecimal.ZERO);

        return dto;
    }
}
