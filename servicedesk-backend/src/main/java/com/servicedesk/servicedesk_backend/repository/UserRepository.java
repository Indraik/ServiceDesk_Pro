package com.servicedesk.servicedesk_backend.repository;

import com.servicedesk.servicedesk_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
