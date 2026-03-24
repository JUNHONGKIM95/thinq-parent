package com.example.thinq_parent.community.dto;

import java.time.LocalDateTime;

public record CommunityCommentResponse(
		Integer commentId,
		Integer postId,
		Integer authorUserId,
		String authorUsername,
		String content,
		String status,
		String elapsedTimeText,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		LocalDateTime deletedAt
) {
}
