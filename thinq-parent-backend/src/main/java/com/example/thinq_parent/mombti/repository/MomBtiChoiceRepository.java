package com.example.thinq_parent.mombti.repository;

import com.example.thinq_parent.mombti.domain.MomBtiChoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface MomBtiChoiceRepository extends JpaRepository<MomBtiChoice, Integer> {

	List<MomBtiChoice> findByQuestionIdInOrderByQuestionIdAscDisplayOrderAsc(Collection<Integer> questionIds);
}
