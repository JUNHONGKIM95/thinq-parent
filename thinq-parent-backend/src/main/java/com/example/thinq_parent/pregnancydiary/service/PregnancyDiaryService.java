package com.example.thinq_parent.pregnancydiary.service;

import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryCreateRequest;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryDetailResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageUploadResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryListResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryUpdateRequest;
import org.springframework.web.multipart.MultipartFile;

public interface PregnancyDiaryService {

	PregnancyDiaryListResponse getDiaries(Integer userId, int page, int limit);

	PregnancyDiaryDetailResponse getDiary(Integer diaryId, Integer userId);

	PregnancyDiaryImageUploadResponse uploadImage(Integer userId, MultipartFile file);

	PregnancyDiaryDetailResponse createDiary(PregnancyDiaryCreateRequest request);

	PregnancyDiaryDetailResponse updateDiary(Integer diaryId, PregnancyDiaryUpdateRequest request);

	void deleteDiary(Integer diaryId, Integer authorUserId);

	void deleteDiaryImage(Integer diaryImageId, Integer authorUserId);
}
