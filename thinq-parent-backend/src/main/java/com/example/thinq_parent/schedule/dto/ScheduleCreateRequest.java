package com.example.thinq_parent.schedule.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record ScheduleCreateRequest(
		@NotNull(message = "groupId is required")
		Integer groupId,

		@NotNull(message = "userId is required")
		Integer userId,

		@NotBlank(message = "title is required")
		@Size(max = 200, message = "title must be 200 characters or less")
		@NoBrokenText(message = "title contains broken characters")
		String title,

		@Size(max = 1000, message = "memo must be 1000 characters or less")
		@NoBrokenText(message = "memo contains broken characters")
		String memo,

		@NotBlank(message = "scheduleType is required")
		@Size(max = 20, message = "scheduleType must be 20 characters or less")
		@NoBrokenText(message = "scheduleType contains broken characters")
		String scheduleType,

		@NotNull(message = "scheduleDate is required")
		LocalDate scheduleDate,

		@NotNull(message = "time is required")
		LocalTime time
) {
}
