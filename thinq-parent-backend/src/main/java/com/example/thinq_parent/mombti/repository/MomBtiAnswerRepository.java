package com.example.thinq_parent.mombti.repository;

import com.example.thinq_parent.mombti.domain.MomBtiAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MomBtiAnswerRepository extends JpaRepository<MomBtiAnswer, Integer> {

	List<MomBtiAnswer> findByAttemptIdOrderByAnswerIdAsc(Integer attemptId);

	void deleteByAttemptId(Integer attemptId);
}
