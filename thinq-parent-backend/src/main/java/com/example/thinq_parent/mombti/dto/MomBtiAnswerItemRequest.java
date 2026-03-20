package com.example.thinq_parent.mombti.dto;

import jakarta.validation.constraints.NotNull;

public record MomBtiAnswerItemRequest(
		@NotNull(message = "questionId is required")
		Integer questionId,

		@NotNull(message = "choiceId is required")
		Integer choiceId
) {
}
