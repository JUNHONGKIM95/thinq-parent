package com.example.thinq_parent.mombti.dto;

import jakarta.validation.constraints.NotNull;

public record MomBtiAttemptCreateRequest(
		@NotNull(message = "userId is required")
		Integer userId
) {
}
