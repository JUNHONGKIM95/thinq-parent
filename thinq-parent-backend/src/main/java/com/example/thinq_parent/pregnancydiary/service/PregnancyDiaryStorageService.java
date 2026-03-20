package com.example.thinq_parent.pregnancydiary.service;

import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PregnancyDiaryStorageService {

	PregnancyDiaryImageUploadResponse upload(Integer groupId, Integer userId, MultipartFile file);

	String resolveImageUrl(String bucketName, String filePath);

	void delete(String bucketName, String filePath);

	String getDefaultBucketName();
}
