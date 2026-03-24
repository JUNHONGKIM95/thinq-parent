package com.example.thinq_parent.schedule.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ScheduleResponse(
		Integer scheduleId,
		Integer groupId,
		Integer userId,
		String title,
		String memo,
		String scheduleType,
		LocalDate scheduleDate,
		LocalTime time,
		LocalDateTime createdAt
) {
}
