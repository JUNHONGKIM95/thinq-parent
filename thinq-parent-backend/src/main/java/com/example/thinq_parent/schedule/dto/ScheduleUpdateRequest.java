package com.example.thinq_parent.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record ScheduleUpdateRequest(
		@NotNull(message = "groupId is required")
		Integer groupId,

		@NotNull(message = "userId is required")
		Integer userId,

		@NotBlank(message = "title is required")
		@Size(max = 200, message = "title must be 200 characters or less")
		String title,

		LocalDateTime startDate,

		@NotNull(message = "endDate is required")
		LocalDateTime endDate
) {
}
