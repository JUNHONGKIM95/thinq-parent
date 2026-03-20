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
@Table(name = "community_comments")
public class CommunityComment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "comment_id")
	private Integer commentId;

	@Column(name = "post_id", nullable = false)
	private Integer postId;

	@Column(name = "author_user_id", nullable = false)
	private Integer authorUserId;

	@Column(nullable = false)
	private String content;

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

	protected CommunityComment() {
	}

	public CommunityComment(Integer postId, Integer authorUserId, String content) {
		this.postId = postId;
		this.authorUserId = authorUserId;
		this.content = content;
		this.status = "published";
	}

	public void patch(String content) {
		if (content != null && !content.isBlank()) {
			this.content = content;
		}
	}

	public void softDelete(LocalDateTime deletedAt) {
		this.status = "deleted";
		this.deletedAt = deletedAt;
	}

	public Integer getCommentId() {
		return commentId;
	}

	public Integer getPostId() {
		return postId;
	}

	public Integer getAuthorUserId() {
		return authorUserId;
	}

	public String getContent() {
		return content;
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
