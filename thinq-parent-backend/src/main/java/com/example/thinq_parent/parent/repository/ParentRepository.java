package com.example.thinq_parent.parent.repository;

import com.example.thinq_parent.parent.domain.ParentAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ParentRepository extends JpaRepository<ParentAccount, Long> {
}
