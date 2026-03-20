package com.example.thinq_parent.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_posts")
public class CommunityPost {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_id")
	private Integer postId;

	@Column(name = "board_id", nullable = false)
	private Integer boardId;

	@Column(name = "keyword_id", nullable = false)
	private Integer keywordId;

	@Column(name = "author_user_id", nullable = false)
	private Integer authorUserId;

	@Column(name = "author_mombti_result_type", length = 10)
	private String authorMombtiResultType;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(nullable = false)
	private String content;

	@Column(name = "like_count", nullable = false)
	private Integer likeCount;

	@Column(name = "comment_count", nullable = false)
	private Integer commentCount;

	@Column(name = "view_count", nullable = false)
	private Integer viewCount;

	@Column(name = "is_anonymous", nullable = false)
	private Boolean isAnonymous;

	@Column(nullable = false, length = 20)
	private String status;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	@Column(name = "deleted_at")
	private LocalDateTime deletedAt;

	protected CommunityPost() {
	}

	public CommunityPost(
			Integer boardId,
			Integer keywordId,
			Integer authorUserId,
			String authorMombtiResultType,
			String title,
			String content,
			Boolean isAnonymous
	) {
		this.boardId = boardId;
		this.keywordId = keywordId;
		this.authorUserId = authorUserId;
		this.authorMombtiResultType = authorMombtiResultType;
		this.title = title;
		this.content = content;
		this.likeCount = 0;
		this.commentCount = 0;
		this.viewCount = 0;
		this.isAnonymous = Boolean.TRUE.equals(isAnonymous);
		this.status = "published";
	}

	public void patch(Integer boardId, Integer keywordId, String title, String content, Boolean isAnonymous) {
		if (boardId != null) {
			this.boardId = boardId;
		}
		if (keywordId != null) {
			this.keywordId = keywordId;
		}
		if (title != null && !title.isBlank()) {
			this.title = title;
		}
		if (content != null && !content.isBlank()) {
			this.content = content;
		}
		if (isAnonymous != null) {
			this.isAnonymous = isAnonymous;
		}
	}

	public void softDelete(LocalDateTime deletedAt) {
		this.status = "deleted";
		this.deletedAt = deletedAt;
	}

	public void incrementViewCount() {
		this.viewCount = this.viewCount + 1;
	}

	public void updateLikeCount(int likeCount) {
		this.likeCount = likeCount;
	}

	public void updateCommentCount(int commentCount) {
		this.commentCount = commentCount;
	}

	public Integer getPostId() {
		return postId;
	}

	public Integer getBoardId() {
		return boardId;
	}

	public Integer getKeywordId() {
		return keywordId;
	}

	public Integer getAuthorUserId() {
		return authorUserId;
	}

	public String getAuthorMombtiResultType() {
		return authorMombtiResultType;
	}

	public String getTitle() {
		return title;
	}

	public String getContent() {
		return content;
	}

	public Integer getLikeCount() {
		return likeCount;
	}

	public Integer getCommentCount() {
		return commentCount;
	}

	public Integer getViewCount() {
		return viewCount;
	}

	public Boolean getIsAnonymous() {
		return isAnonymous;
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
