package com.example.thinq_parent.user.service;

public record PregnancyCountdownInfo(
		Long daysUntilDueDate,
		String daysUntilDueDateText,
		String dDay,
		Integer currentWeek
) {
}
