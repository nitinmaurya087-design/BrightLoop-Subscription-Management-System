package com.brightloop.service;

import com.brightloop.entity.AuditLog;
import com.brightloop.entity.User;
import com.brightloop.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuditService {

    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(String action, String entityType, String entityId, String details, String ipAddress) {
        try {
            Long userId = null;
            String userEmail = "SYSTEM";

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof User user) {
                userId = user.getId();
                userEmail = user.getEmail();
            }

            AuditLog entry = new AuditLog(action, entityType, entityId, userId, userEmail, details, ipAddress);
            auditLogRepository.save(entry);
            log.info("[AUDIT] Action: {} | Entity: {}#{} | User: {} | Details: {}", action, entityType, entityId, userEmail, details);
        } catch (Exception e) {
            log.warn("Failed to record audit log: {}", e.getMessage());
        }
    }

    public void log(String action, String entityType, String entityId, String details) {
        log(action, entityType, entityId, details, "127.0.0.1");
    }
}
