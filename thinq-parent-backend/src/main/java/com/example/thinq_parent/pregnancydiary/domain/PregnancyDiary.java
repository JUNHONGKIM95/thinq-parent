package com.example.thinq_parent.pregnancydiary.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pregnancy_diaries")
public class PregnancyDiary {

	private static final String PUBLISHED = "published";
	private static final String DELETED = "deleted";

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "diary_id")
	private Integer diaryId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "author_user_id", nullable = false)
	private Integer authorUserId;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false, columnDefinition = "text")
	private String content;

	@Column(name = "diary_date", nullable = false)
	private LocalDate diaryDate;

	@Column(nullable = false, length = 20)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	protected PregnancyDiary() {
	}

	public PregnancyDiary(Integer groupId, Integer authorUserId, String title, String content, LocalDate diaryDate) {
		this.groupId = groupId;
		this.authorUserId = authorUserId;
		this.title = title;
		this.content = content;
		this.diaryDate = diaryDate;
		this.status = PUBLISHED;
	}

	public void update(String title, String content, LocalDate diaryDate) {
		this.title = title;
		this.content = content;
		this.diaryDate = diaryDate;
	}

	public void softDelete(LocalDateTime deletedAt) {
		this.status = DELETED;
		this.deletedAt = deletedAt;
	}

	public Integer getDiaryId() {
		return diaryId;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public Integer getAuthorUserId() {
		return authorUserId;
	}

	public String getTitle() {
		return title;
	}

	public String getContent() {
		return content;
	}

	public LocalDate getDiaryDate() {
		return diaryDate;
	}

	public String getStatus() {
		return status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public LocalDateTime getDeletedAt() {
		return deletedAt;
	}
}
