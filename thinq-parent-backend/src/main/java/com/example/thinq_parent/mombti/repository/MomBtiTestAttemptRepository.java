package com.example.thinq_parent.mombti.repository;

import com.example.thinq_parent.mombti.domain.MomBtiTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MomBtiTestAttemptRepository extends JpaRepository<MomBtiTestAttempt, Integer> {

	Optional<MomBtiTestAttempt> findFirstByUserIdOrderByCreatedAtDesc(Integer userId);

	Optional<MomBtiTestAttempt> findFirstByUserIdAndStatusOrderByCompletedAtDescCreatedAtDesc(Integer userId, String status);
}
