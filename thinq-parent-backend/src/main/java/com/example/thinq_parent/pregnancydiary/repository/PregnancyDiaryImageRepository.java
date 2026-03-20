package com.example.thinq_parent.pregnancydiary.repository;

import com.example.thinq_parent.pregnancydiary.domain.PregnancyDiaryImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface PregnancyDiaryImageRepository extends JpaRepository<PregnancyDiaryImage, Integer> {

	List<PregnancyDiaryImage> findByDiaryIdOrderBySortOrderAscDiaryImageIdAsc(Integer diaryId);

	List<PregnancyDiaryImage> findByDiaryIdIn(Collection<Integer> diaryIds);
}
