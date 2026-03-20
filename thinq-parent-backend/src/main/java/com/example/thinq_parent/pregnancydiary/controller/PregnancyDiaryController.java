package com.example.thinq_parent.pregnancydiary.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryCreateRequest;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryDetailResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageUploadResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryListResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryUpdateRequest;
import com.example.thinq_parent.pregnancydiary.service.PregnancyDiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping({"/api/pregnancy-diaries", "/api/v1/pregnancy-diaries"})
@Tag(name = "Pregnancy Diaries", description = "Pregnancy diary list, detail, create, update, delete, and image APIs")
public class PregnancyDiaryController {

	private final PregnancyDiaryService pregnancyDiaryService;

	public PregnancyDiaryController(PregnancyDiaryService pregnancyDiaryService) {
		this.pregnancyDiaryService = pregnancyDiaryService;
	}

	@GetMapping
	@Operation(summary = "Get pregnancy diary list", description = "Returns same-group diary list with pagination, author name, thumbnail image URL, and isMine flag")
	public ApiResponse<PregnancyDiaryListResponse> getDiaries(
			@RequestParam Integer userId,
			@RequestParam(defaultValue = "1") int page,
			@RequestParam(defaultValue = "10") int limit
	) {
		return ApiResponse.success(
				"Pregnancy diaries fetched successfully",
				pregnancyDiaryService.getDiaries(userId, page, limit)
		);
	}

	@GetMapping("/{diaryId}")
	@Operation(summary = "Get pregnancy diary detail", description = "Returns one same-group diary with image list and isMine flag")
	public ApiResponse<PregnancyDiaryDetailResponse> getDiary(
			@PathVariable Integer diaryId,
			@RequestParam Integer userId
	) {
		return ApiResponse.success(
				"Pregnancy diary fetched successfully",
				pregnancyDiaryService.getDiary(diaryId, userId)
		);
	}

	@PostMapping(value = "/images/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	@Operation(summary = "Upload pregnancy diary image", description = "Uploads an image file to the configured Supabase Storage bucket and returns metadata for later diary create/update requests")
	public ResponseEntity<ApiResponse<PregnancyDiaryImageUploadResponse>> uploadImage(
			@RequestParam Integer userId,
			@RequestPart("file") MultipartFile file
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success(
						"Pregnancy diary image uploaded successfully",
						pregnancyDiaryService.uploadImage(userId, file)
				));
	}

	@PostMapping
	@Operation(summary = "Create pregnancy diary", description = "Creates one diary and optionally inserts diary image rows from previously uploaded metadata")
	@RequestBody(
			description = "Create diary payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create pregnancy diary",
							value = """
									{
									  "authorUserId": 3,
									  "title": "오늘의 기록",
									  "content": "배가 조금씩 불러오고 태동이 신기하게 느껴졌어요.",
									  "diaryDate": "2026-03-20",
									  "images": [
									    {
									      "bucketName": "pregnancy-diary-images",
									      "filePath": "groups/3/diaries/3/example.jpg",
									      "originalFileName": "example.jpg",
									      "mimeType": "image/jpeg",
									      "fileSize": 120400,
									      "isThumbnail": true,
									      "sortOrder": 1
									    }
									  ]
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<PregnancyDiaryDetailResponse>> createDiary(
			@Valid @org.springframework.web.bind.annotation.RequestBody PregnancyDiaryCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success(
						"Pregnancy diary created successfully",
						pregnancyDiaryService.createDiary(request)
				));
	}

	@PutMapping("/{diaryId}")
	@Operation(summary = "Update pregnancy diary", description = "Updates diary text/date and optionally adds images, deletes images, or changes the representative thumbnail")
	@RequestBody(
			description = "Update diary payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Update pregnancy diary",
							value = """
									{
									  "authorUserId": 3,
									  "title": "수정된 기록",
									  "content": "오늘은 더 편안한 하루를 보냈어요.",
									  "diaryDate": "2026-03-21",
									  "addImages": [],
									  "deleteImageIds": [],
									  "thumbnailDiaryImageId": 11
									}
									"""
					)
			)
	)
	public ApiResponse<PregnancyDiaryDetailResponse> updateDiary(
			@PathVariable Integer diaryId,
			@Valid @org.springframework.web.bind.annotation.RequestBody PregnancyDiaryUpdateRequest request
	) {
		return ApiResponse.success(
				"Pregnancy diary updated successfully",
				pregnancyDiaryService.updateDiary(diaryId, request)
		);
	}

	@DeleteMapping("/{diaryId}")
	@Operation(summary = "Delete pregnancy diary", description = "Soft deletes one diary by setting status=deleted and deleted_at")
	public ApiResponse<Void> deleteDiary(
			@PathVariable Integer diaryId,
			@RequestParam Integer authorUserId
	) {
		pregnancyDiaryService.deleteDiary(diaryId, authorUserId);
		return ApiResponse.success("Pregnancy diary deleted successfully");
	}

	@DeleteMapping("/images/{diaryImageId}")
	@Operation(summary = "Delete pregnancy diary image", description = "Deletes the storage file and removes one image row. Only the diary author can perform this action")
	public ApiResponse<Void> deleteDiaryImage(
			@PathVariable Integer diaryImageId,
			@RequestParam Integer authorUserId
	) {
		pregnancyDiaryService.deleteDiaryImage(diaryImageId, authorUserId);
		return ApiResponse.success("Pregnancy diary image deleted successfully");
	}
}
