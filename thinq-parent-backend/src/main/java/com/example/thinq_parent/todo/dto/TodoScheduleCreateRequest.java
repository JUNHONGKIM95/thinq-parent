package com.example.thinq_parent.todo.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record TodoScheduleCreateRequest(
		@NotNull(message = "todoId is required")
		Integer todoId,

		@NotNull(message = "groupId is required")
		Integer groupId,

		@NotNull(message = "userId is required")
		Integer userId,

		@Size(max = 1000, message = "memo must be 1000 characters or less")
		@NoBrokenText(message = "memo contains broken characters")
		String memo,

		@NotNull(message = "scheduleDate is required")
		LocalDate scheduleDate,

		@NotNull(message = "time is required")
		LocalTime time
) {
}
