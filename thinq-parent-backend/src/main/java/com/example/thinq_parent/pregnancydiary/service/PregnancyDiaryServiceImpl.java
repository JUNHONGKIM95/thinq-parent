package com.example.thinq_parent.pregnancydiary.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.pregnancydiary.domain.PregnancyDiary;
import com.example.thinq_parent.pregnancydiary.domain.PregnancyDiaryImage;
import com.example.thinq_parent.pregnancydiary.dto.PaginationResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryCreateRequest;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryDetailResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageRequest;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryImageUploadResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryListItemResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryListResponse;
import com.example.thinq_parent.pregnancydiary.dto.PregnancyDiaryUpdateRequest;
import com.example.thinq_parent.pregnancydiary.repository.PregnancyDiaryImageRepository;
import com.example.thinq_parent.pregnancydiary.repository.PregnancyDiaryRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class PregnancyDiaryServiceImpl implements PregnancyDiaryService {

	private static final String DELETED = "deleted";

	private final PregnancyDiaryRepository pregnancyDiaryRepository;
	private final PregnancyDiaryImageRepository pregnancyDiaryImageRepository;
	private final PregnancyDiaryStorageService pregnancyDiaryStorageService;
	private final UserRepository userRepository;
	private final FamilyGroupRepository familyGroupRepository;

	public PregnancyDiaryServiceImpl(
			PregnancyDiaryRepository pregnancyDiaryRepository,
			PregnancyDiaryImageRepository pregnancyDiaryImageRepository,
			PregnancyDiaryStorageService pregnancyDiaryStorageService,
			UserRepository userRepository,
			FamilyGroupRepository familyGroupRepository
	) {
		this.pregnancyDiaryRepository = pregnancyDiaryRepository;
		this.pregnancyDiaryImageRepository = pregnancyDiaryImageRepository;
		this.pregnancyDiaryStorageService = pregnancyDiaryStorageService;
		this.userRepository = userRepository;
		this.familyGroupRepository = familyGroupRepository;
	}

	@Override
	public PregnancyDiaryListResponse getDiaries(Integer userId, int page, int limit) {
		validatePage(page, limit);
		AppUser user = getUserWithGroup(userId);
		Pageable pageable = PageRequest.of(page - 1, limit);
		Page<PregnancyDiary> diaryPage = pregnancyDiaryRepository
				.findByGroupIdAndStatusNotOrderByDiaryDateDescCreatedAtDesc(user.getGroupId(), DELETED, pageable);

		Map<Integer, List<PregnancyDiaryImage>> imagesByDiaryId = mapImagesByDiaryId(
				pregnancyDiaryImageRepository.findByDiaryIdIn(
						diaryPage.getContent().stream().map(PregnancyDiary::getDiaryId).toList()
				)
		);
		Map<Integer, AppUser> authorsById = loadUsers(
				diaryPage.getContent().stream().map(PregnancyDiary::getAuthorUserId).collect(Collectors.toSet())
		);

		List<PregnancyDiaryListItemResponse> items = diaryPage.getContent().stream()
				.map(diary -> toListItemResponse(
						diary,
						imagesByDiaryId.get(diary.getDiaryId()),
						authorsById.get(diary.getAuthorUserId()),
						user.getUserId()
				))
				.toList();

		return new PregnancyDiaryListResponse(
				items,
				new PaginationResponse(page, limit, diaryPage.getTotalElements(), diaryPage.getTotalPages())
		);
	}

	@Override
	public PregnancyDiaryDetailResponse getDiary(Integer diaryId, Integer userId) {
		AppUser currentUser = getUserWithGroup(userId);
		PregnancyDiary diary = getAccessibleDiary(diaryId, currentUser);
		List<PregnancyDiaryImage> images = pregnancyDiaryImageRepository.findByDiaryIdOrderBySortOrderAscDiaryImageIdAsc(diaryId);
		AppUser author = getUser(diary.getAuthorUserId());
		return toDetailResponse(diary, images, author, currentUser.getUserId());
	}

	@Override
	@Transactional
	public PregnancyDiaryImageUploadResponse uploadImage(Integer userId, MultipartFile file) {
		AppUser currentUser = getUserWithGroup(userId);
		return pregnancyDiaryStorageService.upload(currentUser.getGroupId(), currentUser.getUserId(), file);
	}

	@Override
	@Transactional
	public PregnancyDiaryDetailResponse createDiary(PregnancyDiaryCreateRequest request) {
		AppUser author = getUserWithGroup(request.authorUserId());
		PregnancyDiary savedDiary = pregnancyDiaryRepository.save(
				new PregnancyDiary(author.getGroupId(), author.getUserId(), request.title(), request.content(), request.diaryDate())
		);
		saveAttachedImages(savedDiary.getDiaryId(), request.images());
		return getDiary(savedDiary.getDiaryId(), author.getUserId());
	}

	@Override
	@Transactional
	public PregnancyDiaryDetailResponse updateDiary(Integer diaryId, PregnancyDiaryUpdateRequest request) {
		PregnancyDiary diary = getDiaryForAuthoring(diaryId, request.authorUserId());
		diary.update(request.title(), request.content(), request.diaryDate());

		if (request.deleteImageIds() != null && !request.deleteImageIds().isEmpty()) {
			deleteAttachedImages(diary, request.deleteImageIds());
		}
		saveAttachedImages(diaryId, request.addImages());
		normalizeThumbnail(diaryId, request.thumbnailDiaryImageId(), request.addImages());

		return getDiary(diaryId, request.authorUserId());
	}

	@Override
	@Transactional
	public void deleteDiary(Integer diaryId, Integer authorUserId) {
		PregnancyDiary diary = getDiaryForAuthoring(diaryId, authorUserId);
		diary.softDelete(LocalDateTime.now());
	}

	@Override
	@Transactional
	public void deleteDiaryImage(Integer diaryImageId, Integer authorUserId) {
		PregnancyDiaryImage image = pregnancyDiaryImageRepository.findById(diaryImageId)
				.orElseThrow(() -> new ResourceNotFoundException("Pregnancy diary image not found. diaryImageId=" + diaryImageId));
		PregnancyDiary diary = getDiaryForAuthoring(image.getDiaryId(), authorUserId);
		pregnancyDiaryStorageService.delete(image.getBucketName(), image.getFilePath());
		pregnancyDiaryImageRepository.delete(image);
		normalizeThumbnail(diary.getDiaryId(), null, null);
	}

	private void validatePage(int page, int limit) {
		if (page < 1) {
			throw new InvalidRequestException("page must be greater than or equal to 1");
		}
		if (limit < 1 || limit > 100) {
			throw new InvalidRequestException("limit must be between 1 and 100");
		}
	}

	private AppUser getUser(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private AppUser getUserWithGroup(Integer userId) {
		AppUser user = getUser(userId);
		if (user.getGroupId() == null) {
			throw new InvalidRequestException("User must belong to a family group.");
		}
		if (!familyGroupRepository.existsById(user.getGroupId())) {
			throw new ResourceNotFoundException("Family group not found. groupId=" + user.getGroupId());
		}
		return user;
	}

	private PregnancyDiary getAccessibleDiary(Integer diaryId, AppUser currentUser) {
		PregnancyDiary diary = pregnancyDiaryRepository.findByDiaryIdAndStatusNot(diaryId, DELETED)
				.orElseThrow(() -> new ResourceNotFoundException("Pregnancy diary not found. diaryId=" + diaryId));
		if (!Objects.equals(diary.getGroupId(), currentUser.getGroupId())) {
			throw new InvalidRequestException("Only users in the same group can view this diary.");
		}
		return diary;
	}

	private PregnancyDiary getDiaryForAuthoring(Integer diaryId, Integer authorUserId) {
		AppUser author = getUserWithGroup(authorUserId);
		PregnancyDiary diary = getAccessibleDiary(diaryId, author);
		if (!Objects.equals(diary.getAuthorUserId(), author.getUserId())) {
			throw new InvalidRequestException("Only the author can modify this diary.");
		}
		return diary;
	}

	private void saveAttachedImages(Integer diaryId, List<PregnancyDiaryImageRequest> imageRequests) {
		if (imageRequests == null || imageRequests.isEmpty()) {
			normalizeThumbnail(diaryId, null, null);
			return;
		}
		validateImageRequests(imageRequests);
		List<PregnancyDiaryImage> images = new ArrayList<>();
		int nextSortOrder = nextSortOrder(diaryId);
		for (PregnancyDiaryImageRequest request : imageRequests) {
			if (request.filePath() == null || request.filePath().isBlank()) {
				throw new InvalidRequestException("images.filePath is required");
			}
			String bucketName = validateBucketName(request.bucketName());
			images.add(new PregnancyDiaryImage(
					diaryId,
					bucketName,
					request.filePath(),
					request.originalFileName(),
					request.mimeType(),
					request.fileSize(),
					Boolean.TRUE.equals(request.isThumbnail()),
					request.sortOrder() == null ? nextSortOrder++ : request.sortOrder()
			));
		}
		pregnancyDiaryImageRepository.saveAll(images);
	}

	private void deleteAttachedImages(PregnancyDiary diary, List<Integer> deleteImageIds) {
		Set<Integer> uniqueIds = new HashSet<>(deleteImageIds);
		List<PregnancyDiaryImage> currentImages = pregnancyDiaryImageRepository.findByDiaryIdOrderBySortOrderAscDiaryImageIdAsc(diary.getDiaryId());
		Map<Integer, PregnancyDiaryImage> imagesById = currentImages.stream()
				.collect(Collectors.toMap(PregnancyDiaryImage::getDiaryImageId, Function.identity()));

		for (Integer imageId : uniqueIds) {
			PregnancyDiaryImage image = imagesById.get(imageId);
			if (image == null) {
				throw new InvalidRequestException("deleteImageIds contains an image not attached to this diary.");
			}
			pregnancyDiaryStorageService.delete(image.getBucketName(), image.getFilePath());
			pregnancyDiaryImageRepository.delete(image);
		}
	}

	private void validateImageRequests(List<PregnancyDiaryImageRequest> imageRequests) {
		long thumbnailCount = imageRequests.stream()
				.filter(request -> Boolean.TRUE.equals(request.isThumbnail()))
				.count();
		if (thumbnailCount > 1) {
			throw new InvalidRequestException("Only one thumbnail image can be specified.");
		}
	}

	private String validateBucketName(String bucketName) {
		String resolved = bucketName == null || bucketName.isBlank()
				? pregnancyDiaryStorageService.getDefaultBucketName()
				: bucketName;
		if (!pregnancyDiaryStorageService.getDefaultBucketName().equals(resolved)) {
			throw new InvalidRequestException("Only the configured pregnancy diary storage bucket can be used.");
		}
		return resolved;
	}

	private int nextSortOrder(Integer diaryId) {
		return pregnancyDiaryImageRepository.findByDiaryIdOrderBySortOrderAscDiaryImageIdAsc(diaryId)
				.stream()
				.map(PregnancyDiaryImage::getSortOrder)
				.filter(Objects::nonNull)
				.max(Integer::compareTo)
				.orElse(0) + 1;
	}

	private void normalizeThumbnail(Integer diaryId, Integer thumbnailDiaryImageId, List<PregnancyDiaryImageRequest> addImages) {
		if (thumbnailDiaryImageId != null && addImages != null && addImages.stream().anyMatch(request -> Boolean.TRUE.equals(request.isThumbnail()))) {
			throw new InvalidRequestException("thumbnailDiaryImageId cannot be used together with addImages.isThumbnail=true");
		}

		List<PregnancyDiaryImage> images = pregnancyDiaryImageRepository.findByDiaryIdOrderBySortOrderAscDiaryImageIdAsc(diaryId);
		if (images.isEmpty()) {
			return;
		}

		PregnancyDiaryImage selectedThumbnail = null;
		if (thumbnailDiaryImageId != null) {
			selectedThumbnail = images.stream()
					.filter(image -> Objects.equals(image.getDiaryImageId(), thumbnailDiaryImageId))
					.findFirst()
					.orElseThrow(() -> new InvalidRequestException("thumbnailDiaryImageId is not attached to this diary."));
		}

		if (selectedThumbnail == null) {
			List<PregnancyDiaryImage> thumbnailImages = images.stream()
					.filter(PregnancyDiaryImage::isThumbnail)
					.sorted(Comparator.comparing(PregnancyDiaryImage::getSortOrder).thenComparing(PregnancyDiaryImage::getDiaryImageId))
					.toList();
			if (!thumbnailImages.isEmpty()) {
				selectedThumbnail = thumbnailImages.get(0);
			}
		}

		if (selectedThumbnail == null) {
			selectedThumbnail = images.stream()
					.min(Comparator.comparing(PregnancyDiaryImage::getSortOrder).thenComparing(PregnancyDiaryImage::getDiaryImageId))
					.orElse(null);
		}

		for (PregnancyDiaryImage image : images) {
			image.updateThumbnail(selectedThumbnail != null && Objects.equals(image.getDiaryImageId(), selectedThumbnail.getDiaryImageId()));
		}
	}

	private Map<Integer, List<PregnancyDiaryImage>> mapImagesByDiaryId(List<PregnancyDiaryImage> images) {
		return images.stream().collect(Collectors.groupingBy(PregnancyDiaryImage::getDiaryId));
	}

	private Map<Integer, AppUser> loadUsers(Collection<Integer> userIds) {
		if (userIds.isEmpty()) {
			return Map.of();
		}
		return userRepository.findAllById(userIds)
				.stream()
				.collect(Collectors.toMap(AppUser::getUserId, Function.identity()));
	}

	private PregnancyDiaryListItemResponse toListItemResponse(
			PregnancyDiary diary,
			List<PregnancyDiaryImage> images,
			AppUser author,
			Integer currentUserId
	) {
		PregnancyDiaryImage thumbnail = pickThumbnail(images);
		return new PregnancyDiaryListItemResponse(
				diary.getDiaryId(),
				diary.getTitle(),
				diary.getDiaryDate(),
				diary.getAuthorUserId(),
				author == null ? null : author.getUsername(),
				thumbnail == null ? null : pregnancyDiaryStorageService.resolveImageUrl(thumbnail.getBucketName(), thumbnail.getFilePath()),
				images != null && !images.isEmpty(),
				Objects.equals(diary.getAuthorUserId(), currentUserId)
		);
	}

	private PregnancyDiaryDetailResponse toDetailResponse(
			PregnancyDiary diary,
			List<PregnancyDiaryImage> images,
			AppUser author,
			Integer currentUserId
	) {
		return new PregnancyDiaryDetailResponse(
				diary.getDiaryId(),
				diary.getGroupId(),
				diary.getAuthorUserId(),
				author.getUsername(),
				diary.getTitle(),
				diary.getContent(),
				diary.getDiaryDate(),
				diary.getStatus(),
				diary.getCreatedAt(),
				diary.getUpdatedAt(),
				Objects.equals(diary.getAuthorUserId(), currentUserId),
				images.stream().map(this::toImageResponse).toList()
		);
	}

	private PregnancyDiaryImageResponse toImageResponse(PregnancyDiaryImage image) {
		return new PregnancyDiaryImageResponse(
				image.getDiaryImageId(),
				image.getBucketName(),
				image.getFilePath(),
				pregnancyDiaryStorageService.resolveImageUrl(image.getBucketName(), image.getFilePath()),
				image.getOriginalFileName(),
				image.getMimeType(),
				image.getFileSize(),
				image.isThumbnail(),
				image.getSortOrder(),
				image.getCreatedAt()
		);
	}

	private PregnancyDiaryImage pickThumbnail(List<PregnancyDiaryImage> images) {
		if (images == null || images.isEmpty()) {
			return null;
		}
		return images.stream()
				.filter(PregnancyDiaryImage::isThumbnail)
				.findFirst()
				.orElseGet(() -> images.stream()
						.min(Comparator.comparing(PregnancyDiaryImage::getSortOrder).thenComparing(PregnancyDiaryImage::getDiaryImageId))
						.orElse(null));
	}
}
