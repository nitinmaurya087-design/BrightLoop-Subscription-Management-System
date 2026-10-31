package com.brightloop.service;

import com.brightloop.entity.Customer;
import com.brightloop.entity.Role;
import com.brightloop.entity.StaffProfile;
import com.brightloop.entity.User;
import com.brightloop.repository.CustomerRepository;
import com.brightloop.repository.StaffProfileRepository;
import com.brightloop.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class DataInitializerService implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializerService.class);

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializerService(
            UserRepository userRepository,
            StaffProfileRepository staffProfileRepository,
            CustomerRepository customerRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.customerRepository = customerRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        log.info("Ensuring demo users and BCrypt credentials are valid...");

        initDemoUser("admin@brightloop.com", "Admin@12345", Role.ADMIN, "System Administrator", "Executive", "Super Admin", "+91 90000 00001");
        initDemoUser("nitinmaurya087@gmail.com", "Admin@12345", Role.ADMIN, "Nitin Maurya", "Executive", "Super Administrator", "+91 98765 43210");
        initDemoUser("staff@brightloop.com", "Staff@12345", Role.STAFF, "Rohan Verma", "Billing & Sales", "Senior Billing Specialist", "+91 98765 43210");
        initDemoUser("customer@brightloop.com", "Customer@12345", Role.CUSTOMER, "Aditi Rao", null, null, "+91 91234 56780");

        log.info("Demo credentials validated successfully.");
    }

    private void initDemoUser(String email, String rawPassword, Role role, String fullName, String dept, String designation, String phone) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        User user;
        if (userOpt.isEmpty()) {
            user = new User(email, passwordEncoder.encode(rawPassword), role, "ACTIVE");
            user = userRepository.save(user);
            log.info("Created demo user: {}", email);
        } else {
            user = userOpt.get();
            // Ensure password matches the demo password
            if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                user.setRole(role);
                user.setStatus("ACTIVE");
                user = userRepository.save(user);
                log.info("Updated password hash for demo user: {}", email);
            }
        }

        if (role == Role.ADMIN || role == Role.STAFF) {
            Optional<StaffProfile> profileOpt = staffProfileRepository.findByUser(user);
            if (profileOpt.isEmpty()) {
                StaffProfile profile = new StaffProfile(user, fullName, dept, designation, phone);
                staffProfileRepository.save(profile);
            }
        } else if (role == Role.CUSTOMER) {
            Optional<Customer> custOpt = customerRepository.findByEmail(email);
            if (custOpt.isPresent()) {
                Customer customer = custOpt.get();
                if (customer.getUser() == null) {
                    customer.setUser(user);
                    customerRepository.save(customer);
                }
            }
        }
    }
}
