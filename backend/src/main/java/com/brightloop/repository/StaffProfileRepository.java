package com.brightloop.repository;

import com.brightloop.entity.StaffProfile;
import com.brightloop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StaffProfileRepository extends JpaRepository<StaffProfile, Long> {
    Optional<StaffProfile> findByUser(User user);
    Optional<StaffProfile> findByUserId(Long userId);
}
