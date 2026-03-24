package com.example.thinq_parent.pregnancydiary.repository;

import com.example.thinq_parent.pregnancydiary.domain.PregnancyDiary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PregnancyDiaryRepository extends JpaRepository<PregnancyDiary, Integer> {

	Page<PregnancyDiary> findByGroupIdAndStatusNotOrderByDiaryDateDescCreatedAtDesc(
			Integer groupId,
			String status,
			Pageable pageable
	);

	Optional<PregnancyDiary> findByDiaryIdAndStatusNot(Integer diaryId, String status);
}
