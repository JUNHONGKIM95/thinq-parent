package com.example.thinq_parent.pregnancydiary.dto;

import java.time.LocalDate;

public record PregnancyDiaryListItemResponse(
		Integer diaryId,
		String title,
		LocalDate diaryDate,
		Integer authorUserId,
		String authorName,
		String thumbnailImageUrl,
		boolean hasImage,
		boolean isMine
) {
}
