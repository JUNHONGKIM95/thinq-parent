package com.example.thinq_parent.user.dto;

import java.time.LocalDate;

public record UserPregnancySummaryResponse(
		Integer userId,
		String username,
		String babyNickname,
		LocalDate dueDate,
		Long daysUntilDueDate,
		Integer currentWeek
) {
}
