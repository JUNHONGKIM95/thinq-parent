package com.example.thinq_parent.pregnancydiary.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "pregnancy_diary_images")
public class PregnancyDiaryImage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "diary_image_id")
	private Integer diaryImageId;

	@Column(name = "diary_id", nullable = false)
	private Integer diaryId;

	@Column(name = "bucket_name", nullable = false)
	private String bucketName;

	@Column(name = "file_path", nullable = false)
	private String filePath;

	@Column(name = "original_file_name")
	private String originalFileName;

	@Column(name = "mime_type")
	private String mimeType;

	@Column(name = "file_size")
	private Long fileSize;

	@Column(name = "is_thumbnail", nullable = false)
	private boolean isThumbnail;

	@Column(name = "sort_order", nullable = false)
	private Integer sortOrder;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	protected PregnancyDiaryImage() {
	}

	public PregnancyDiaryImage(
			Integer diaryId,
			String bucketName,
			String filePath,
			String originalFileName,
			String mimeType,
			Long fileSize,
			boolean isThumbnail,
			Integer sortOrder
	) {
		this.diaryId = diaryId;
		this.bucketName = bucketName;
		this.filePath = filePath;
		this.originalFileName = originalFileName;
		this.mimeType = mimeType;
		this.fileSize = fileSize;
		this.isThumbnail = isThumbnail;
		this.sortOrder = sortOrder;
	}

	public void updateThumbnail(boolean thumbnail) {
		this.isThumbnail = thumbnail;
	}

	public Integer getDiaryImageId() {
		return diaryImageId;
	}

	public Integer getDiaryId() {
		return diaryId;
	}

	public String getBucketName() {
		return bucketName;
	}

	public String getFilePath() {
		return filePath;
	}

	public String getOriginalFileName() {
		return originalFileName;
	}

	public String getMimeType() {
		return mimeType;
	}

	public Long getFileSize() {
		return fileSize;
	}

	public boolean isThumbnail() {
		return isThumbnail;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
