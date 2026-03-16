package com.example.thinq_parent.user.dto;

import java.time.LocalDate;

public record UserPregnancySummaryResponse(
		Integer userId,
		String username,
		String babyNickname,
		String meetingTitle,
		LocalDate dueDate,
		Long daysUntilDueDate,
		String daysUntilDueDateText,
		String dDay,
		Integer currentWeek
) {
}
