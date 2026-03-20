package com.example.thinq_parent.mombti.dto;

import java.time.LocalDateTime;

public record MomBtiAttemptCreateResponse(
		Integer attemptId,
		Integer userId,
		String status,
		LocalDateTime startedAt
) {
}
