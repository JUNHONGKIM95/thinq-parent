package com.example.thinq_parent.user.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record UserDueDateUpdateRequest(
		@NotNull(message = "dueDate is required")
		LocalDate dueDate
) {
}
