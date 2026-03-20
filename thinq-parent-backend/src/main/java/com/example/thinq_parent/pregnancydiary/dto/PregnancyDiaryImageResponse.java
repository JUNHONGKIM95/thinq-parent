package com.example.thinq_parent.pregnancydiary.dto;

import java.time.LocalDateTime;

public record PregnancyDiaryImageResponse(
		Integer diaryImageId,
		String bucketName,
		String filePath,
		String imageUrl,
		String originalFileName,
		String mimeType,
		Long fileSize,
		boolean isThumbnail,
		Integer sortOrder,
		LocalDateTime createdAt
) {
}
