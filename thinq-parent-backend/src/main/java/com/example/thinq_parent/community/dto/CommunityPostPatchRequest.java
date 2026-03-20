package com.example.thinq_parent.community.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommunityPostPatchRequest(
		@NotNull(message = "authorUserId is required")
		Integer authorUserId,

		Integer boardId,
		Integer keywordId,

		@Size(max = 200, message = "title must be 200 characters or less")
		@NoBrokenText(message = "title contains broken characters")
		String title,

		@NoBrokenText(message = "content contains broken characters")
		String content,

		Boolean isAnonymous
) {
}
