package com.brightloop.service;

import com.brightloop.dto.staff.CreateStaffRequest;
import com.brightloop.dto.staff.StaffDto;
import com.brightloop.entity.Role;
import com.brightloop.entity.StaffProfile;
import com.brightloop.entity.User;
import com.brightloop.exception.DuplicateResourceException;
import com.brightloop.exception.ResourceNotFoundException;
import com.brightloop.repository.StaffProfileRepository;
import com.brightloop.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class StaffService {

    private final UserRepository userRepository;
    private final StaffProfileRepository staffProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public StaffService(
            UserRepository userRepository,
            StaffProfileRepository staffProfileRepository,
            PasswordEncoder passwordEncoder,
            AuditService auditService
    ) {
        this.userRepository = userRepository;
        this.staffProfileRepository = staffProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public List<StaffDto> getAllStaff() {
        List<User> staffUsers = userRepository.findByRole(Role.STAFF);
        List<User> adminUsers = userRepository.findByRole(Role.ADMIN);

        List<User> allStaff = new ArrayList<>();
        allStaff.addAll(adminUsers);
        allStaff.addAll(staffUsers);

        List<StaffDto> result = new ArrayList<>();
        for (User u : allStaff) {
            StaffDto dto = new StaffDto();
            dto.setUserId(u.getId());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole());
            dto.setStatus(u.getStatus());
            dto.setCreatedAt(u.getCreatedAt());

            Optional<StaffProfile> profileOpt = staffProfileRepository.findByUser(u);
            if (profileOpt.isPresent()) {
                StaffProfile p = profileOpt.get();
                dto.setId(p.getId());
                dto.setFullName(p.getFullName());
                dto.setDepartment(p.getDepartment());
                dto.setDesignation(p.getDesignation());
                dto.setPhone(p.getPhone());
            } else {
                dto.setFullName(u.getEmail());
            }
            result.add(dto);
        }
        return result;
    }

    @Transactional
    public StaffDto createStaff(CreateStaffRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("An account with email " + email + " already exists");
        }

        User user = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                Role.STAFF,
                "ACTIVE"
        );
        user = userRepository.save(user);

        StaffProfile profile = new StaffProfile(
                user,
                request.getFullName().trim(),
                request.getDepartment(),
                request.getDesignation(),
                request.getPhone()
        );
        profile = staffProfileRepository.save(profile);

        auditService.log("STAFF_CREATE", "User", user.getId().toString(),
                "Created new staff member: " + profile.getFullName() + " (" + email + ")");

        StaffDto dto = new StaffDto();
        dto.setId(profile.getId());
        dto.setUserId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setStatus(user.getStatus());
        dto.setFullName(profile.getFullName());
        dto.setDepartment(profile.getDepartment());
        dto.setDesignation(profile.getDesignation());
        dto.setPhone(profile.getPhone());
        dto.setCreatedAt(profile.getCreatedAt());

        return dto;
    }

    @Transactional
    public void deactivateStaff(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found with id: " + userId));

        user.setStatus("INACTIVE");
        userRepository.save(user);

        auditService.log("STAFF_DEACTIVATE", "User", userId.toString(), "Deactivated staff member: " + user.getEmail());
    }
}
