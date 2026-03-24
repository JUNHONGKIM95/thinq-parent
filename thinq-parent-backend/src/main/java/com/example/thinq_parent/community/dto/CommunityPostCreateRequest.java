package com.example.thinq_parent.community.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CommunityPostCreateRequest(
		@NotNull(message = "authorUserId is required")
		Integer authorUserId,

		@NotNull(message = "boardId is required")
		Integer boardId,

		@NotNull(message = "keywordId is required")
		Integer keywordId,

		@NotBlank(message = "title is required")
		@Size(max = 200, message = "title must be 200 characters or less")
		@NoBrokenText(message = "title contains broken characters")
		String title,

		@NotBlank(message = "content is required")
		@NoBrokenText(message = "content contains broken characters")
		String content,

		Boolean isAnonymous
) {
}
