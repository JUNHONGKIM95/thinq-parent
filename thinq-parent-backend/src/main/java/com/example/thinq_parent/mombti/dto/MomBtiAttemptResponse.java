package com.example.thinq_parent.mombti.dto;

import java.time.LocalDateTime;

public record MomBtiAttemptResponse(
		Integer attemptId,
		Integer userId,
		String status,
		String resultType,
		LocalDateTime startedAt,
		LocalDateTime completedAt,
		LocalDateTime createdAt,
		MomBtiScoreResponse scores,
		MomBtiResultProfileResponse profile
) {
}
