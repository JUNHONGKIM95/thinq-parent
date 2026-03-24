package com.example.thinq_parent.schedule.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record SchedulePatchRequest(
		@Size(max = 200, message = "title must be 200 characters or less")
		@NoBrokenText(message = "title contains broken characters")
		String title,

		@Size(max = 1000, message = "memo must be 1000 characters or less")
		@NoBrokenText(message = "memo contains broken characters")
		String memo,

		@Size(max = 20, message = "scheduleType must be 20 characters or less")
		@NoBrokenText(message = "scheduleType contains broken characters")
		String scheduleType,

		LocalDate scheduleDate,

		LocalTime time
) {
}
