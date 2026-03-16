package com.example.thinq_parent.schedule.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record ScheduleResponse(
		Integer scheduleId,
		Integer groupId,
		Integer userId,
		String title,
		LocalDateTime startDate,
		LocalDateTime endDate,
		LocalDateTime createdAt,
		LocalDate dueDate,
		Long daysFromToday,
		String dDay
) {
}
