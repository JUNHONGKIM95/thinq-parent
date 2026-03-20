package com.example.thinq_parent.community.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "community_post_likes")
public class CommunityPostLike {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "post_like_id")
	private Integer postLikeId;

	@Column(name = "post_id", nullable = false)
	private Integer postId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected CommunityPostLike() {
	}

	public CommunityPostLike(Integer postId, Integer userId) {
		this.postId = postId;
		this.userId = userId;
	}
}
