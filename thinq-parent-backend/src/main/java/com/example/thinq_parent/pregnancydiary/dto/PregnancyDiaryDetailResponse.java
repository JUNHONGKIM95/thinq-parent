package com.example.thinq_parent.pregnancydiary.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record PregnancyDiaryDetailResponse(
		Integer diaryId,
		Integer groupId,
		Integer authorUserId,
		String authorName,
		String title,
		String content,
		LocalDate diaryDate,
		String status,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		boolean isMine,
		List<PregnancyDiaryImageResponse> images
) {
}
