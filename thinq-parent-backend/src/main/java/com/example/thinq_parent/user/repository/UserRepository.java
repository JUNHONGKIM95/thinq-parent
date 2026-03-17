package com.example.thinq_parent.user.repository;

import com.example.thinq_parent.user.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<AppUser, Integer> {

	boolean existsByEmail(String email);

	boolean existsByEmailAndUserIdNot(String email, Integer userId);
}
