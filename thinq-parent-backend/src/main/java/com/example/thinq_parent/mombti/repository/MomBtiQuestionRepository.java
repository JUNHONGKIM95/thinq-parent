package com.example.thinq_parent.mombti.repository;

import com.example.thinq_parent.mombti.domain.MomBtiQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MomBtiQuestionRepository extends JpaRepository<MomBtiQuestion, Integer> {

	List<MomBtiQuestion> findAllByOrderByDisplayOrderAsc();
}
