package com.example.thinq_parent.pregnancydiary.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageUploadResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PregnancyDiaryStorageServiceImpl implements PregnancyDiaryStorageService {

	private static final List<String> ALLOWED_MIME_TYPES = List.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/heic",
			"image/heif"
	);

	private final JdbcTemplate jdbcTemplate;
	private final RestClient restClient;
	private final String projectUrl;
	private final String serviceRoleKey;
	private final String defaultBucketName;
	private final long maxImageSizeBytes;
	private final int signedUrlDurationSeconds;

	public PregnancyDiaryStorageServiceImpl(
			JdbcTemplate jdbcTemplate,
			@Value("${supabase.project-url:https://tvaxyqnthesqpeeifgbe.supabase.co}") String projectUrl,
			@Value("${supabase.service-role-key}") String serviceRoleKey,
			@Value("${supabase.storage.pregnancy-diary-bucket:pregnancy-diary-images}") String defaultBucketName,
			@Value("${supabase.storage.max-image-size-bytes:10485760}") long maxImageSizeBytes,
			@Value("${supabase.storage.signed-url-duration-seconds:3600}") int signedUrlDurationSeconds
	) {
		this.jdbcTemplate = jdbcTemplate;
		this.projectUrl = projectUrl;
		this.serviceRoleKey = serviceRoleKey;
		this.defaultBucketName = defaultBucketName;
		this.maxImageSizeBytes = maxImageSizeBytes;
		this.signedUrlDurationSeconds = signedUrlDurationSeconds;
		this.restClient = RestClient.builder()
				.baseUrl(projectUrl)
				.build();
	}

	@Override
	public PregnancyDiaryImageUploadResponse upload(Integer groupId, Integer userId, MultipartFile file) {
		requireServiceRoleKey();
		validateBucketExists(defaultBucketName);
		validateFile(file);

		String mimeType = normalizeMimeType(file.getContentType());
		String extension = extractExtension(file.getOriginalFilename(), mimeType);
		String filePath = "groups/" + groupId + "/diaries/" + userId + "/" + UUID.randomUUID() + "." + extension;

		try {
			restClient.post()
					.uri("/storage/v1/object/" + defaultBucketName + "/" + encodePath(filePath))
					.contentType(MediaType.parseMediaType(mimeType))
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("apikey", serviceRoleKey)
					.header("x-upsert", "false")
					.body(file.getBytes())
					.retrieve()
					.toBodilessEntity();
		} catch (IOException exception) {
			throw new InvalidRequestException("Failed to read upload file");
		} catch (RestClientResponseException exception) {
			throw new InvalidRequestException("Storage upload failed: " + exception.getStatusCode().value());
		} catch (RestClientException exception) {
			throw new InvalidRequestException("Storage upload failed");
		}

		return new PregnancyDiaryImageUploadResponse(
				defaultBucketName,
				filePath,
				file.getOriginalFilename(),
				mimeType,
				file.getSize()
		);
	}

	@Override
	public String resolveImageUrl(String bucketName, String filePath) {
		if (!StringUtils.hasText(bucketName) || !StringUtils.hasText(filePath)) {
			return null;
		}
		validateBucketExists(bucketName);
		Boolean isPublic = jdbcTemplate.queryForObject(
				"select public from storage.buckets where name = ?",
				Boolean.class,
				bucketName
		);
		if (Boolean.TRUE.equals(isPublic)) {
			return projectUrl + "/storage/v1/object/public/" + bucketName + "/" + encodePath(filePath);
		}
		if (!StringUtils.hasText(serviceRoleKey)) {
			return null;
		}

		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> responseBody = restClient.post()
					.uri("/storage/v1/object/sign/" + bucketName + "/" + encodePath(filePath))
					.contentType(MediaType.APPLICATION_JSON)
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("apikey", serviceRoleKey)
					.body(Map.of("expiresIn", signedUrlDurationSeconds))
					.retrieve()
					.body(Map.class);
			String signedPath = responseBody == null ? null : stringValue(responseBody.get("signedURL"));
			if (!StringUtils.hasText(signedPath) && responseBody != null) {
				signedPath = stringValue(responseBody.get("signedUrl"));
			}
			if (!StringUtils.hasText(signedPath)) {
				return null;
			}
			return signedPath.startsWith("http")
					? signedPath
					: projectUrl + "/storage/v1" + signedPath;
		} catch (Exception exception) {
			return null;
		}
	}

	private String stringValue(Object value) {
		return value == null ? null : value.toString();
	}

	@Override
	public void delete(String bucketName, String filePath) {
		requireServiceRoleKey();
		validateBucketExists(bucketName);
		try {
			restClient.delete()
					.uri("/storage/v1/object/" + bucketName + "/" + encodePath(filePath))
					.header("Authorization", "Bearer " + serviceRoleKey)
					.header("apikey", serviceRoleKey)
					.retrieve()
					.toBodilessEntity();
		} catch (RestClientResponseException exception) {
			throw new InvalidRequestException("Storage delete failed: " + exception.getStatusCode().value());
		} catch (RestClientException exception) {
			throw new InvalidRequestException("Storage delete failed");
		}
	}

	@Override
	public String getDefaultBucketName() {
		return defaultBucketName;
	}

	private void validateFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new InvalidRequestException("file is required");
		}
		String mimeType = normalizeMimeType(file.getContentType());
		if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
			throw new InvalidRequestException("Only image files are allowed");
		}
		if (file.getSize() > maxImageSizeBytes) {
			throw new InvalidRequestException("Image file is too large");
		}
	}

	private String normalizeMimeType(String mimeType) {
		if (!StringUtils.hasText(mimeType)) {
			throw new InvalidRequestException("mime type is required");
		}
		return mimeType.toLowerCase();
	}

	private String extractExtension(String originalFileName, String mimeType) {
		if (StringUtils.hasText(originalFileName) && originalFileName.contains(".")) {
			String extension = originalFileName.substring(originalFileName.lastIndexOf('.') + 1).toLowerCase();
			if (!extension.isBlank()) {
				return extension;
			}
		}
		return switch (mimeType) {
			case "image/jpeg" -> "jpg";
			case "image/png" -> "png";
			case "image/webp" -> "webp";
			case "image/heic" -> "heic";
			case "image/heif" -> "heif";
			default -> throw new InvalidRequestException("Unsupported image type");
		};
	}

	private void validateBucketExists(String bucketName) {
		Integer count = jdbcTemplate.queryForObject(
				"select count(*) from storage.buckets where name = ?",
				Integer.class,
				bucketName
		);
		if (count == null || count == 0) {
			throw new ResourceNotFoundException("Storage bucket not found. bucketName=" + bucketName);
		}
	}

	private void requireServiceRoleKey() {
		if (!StringUtils.hasText(serviceRoleKey)) {
			throw new InvalidRequestException(
					"Supabase service role key is not configured for storage operations. "
							+ "Set SUPABASE_SERVICE_ROLE_KEY or supabase.service-role-key."
			);
		}
	}

	private String encodePath(String filePath) {
		String[] segments = filePath.split("/");
		StringBuilder encoded = new StringBuilder();
		for (int i = 0; i < segments.length; i++) {
			if (i > 0) {
				encoded.append('/');
			}
			encoded.append(URLEncoder.encode(segments[i], StandardCharsets.UTF_8));
		}
		return encoded.toString();
	}
}
