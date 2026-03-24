package com.example.thinq_parent.pregnancydiary.dto;

public record PregnancyDiaryImageUploadResponse(
		String bucketName,
		String filePath,
		String originalFileName,
		String mimeType,
		Long fileSize
) {
}
