package com.example.thinq_parent.mombti.dto;

import java.util.List;

public record MomBtiQuestionResponse(
		Integer questionId,
		String questionText,
		String dimension,
		Integer displayOrder,
		List<MomBtiChoiceResponse> choices
) {
}
