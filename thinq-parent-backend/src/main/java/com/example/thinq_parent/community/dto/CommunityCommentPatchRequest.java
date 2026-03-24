package com.example.thinq_parent.community.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommunityCommentPatchRequest(
		@NotNull(message = "authorUserId is required")
		Integer authorUserId,

		@NotBlank(message = "content is required")
		@NoBrokenText(message = "content contains broken characters")
		String content
) {
}
