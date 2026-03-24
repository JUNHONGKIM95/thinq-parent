package com.example.thinq_parent.community.dto;

import java.time.LocalDateTime;

public record CommunityPostResponse(
		Integer postId,
		Integer boardId,
		String boardCode,
		String boardName,
		Integer keywordId,
		String keywordCode,
		String keywordName,
		Integer authorUserId,
		String authorMombtiResultType,
		String title,
		String content,
		String contentPreview,
		Integer likeCount,
		Integer commentCount,
		Integer viewCount,
		Boolean isAnonymous,
		Boolean likedByMe,
		String status,
		String elapsedTimeText,
		LocalDateTime createdAt,
		LocalDateTime updatedAt,
		LocalDateTime deletedAt
) {
}
