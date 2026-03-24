package com.example.thinq_parent.mombti.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record MomBtiAnswerSubmitRequest(
		@NotEmpty(message = "answers is required")
		List<@Valid MomBtiAnswerItemRequest> answers
) {
}
