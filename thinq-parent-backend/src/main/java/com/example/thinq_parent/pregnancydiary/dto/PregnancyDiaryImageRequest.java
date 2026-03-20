package com.example.thinq_parent.pregnancydiary.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record PregnancyDiaryImageRequest(
		String bucketName,
		@Size(max = 500, message = "filePath must be 500 characters or fewer")
		String filePath,
		@Size(max = 255, message = "originalFileName must be 255 characters or fewer")
		String originalFileName,
		@Size(max = 100, message = "mimeType must be 100 characters or fewer")
		String mimeType,
		@Positive(message = "fileSize must be positive")
		Long fileSize,
		Boolean isThumbnail,
		@Positive(message = "sortOrder must be positive")
		Integer sortOrder
) {
}
