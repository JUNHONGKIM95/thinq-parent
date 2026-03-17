package com.example.thinq_parent.cheermessage.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CheerMessageCreateRequest(
		@NotNull(message = "groupId is required")
		Integer groupId,

		@NotNull(message = "senderId is required")
		Integer senderId,

		@NotBlank(message = "content is required")
		String content,

		@Size(max = 50, message = "reactionEmoji must be 50 characters or less")
		String reactionEmoji
) {
}
