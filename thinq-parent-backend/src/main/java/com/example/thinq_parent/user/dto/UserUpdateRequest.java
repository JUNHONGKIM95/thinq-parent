package com.example.thinq_parent.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserUpdateRequest(
		@NotBlank(message = "email is required")
		@Email(message = "email must be valid")
		@Size(max = 100, message = "email must be 100 characters or less")
		String email,

		@NotBlank(message = "password is required")
		@Size(max = 255, message = "password must be 255 characters or less")
		String password,

		@NotBlank(message = "username is required")
		@Size(max = 50, message = "username must be 50 characters or less")
		String username,

		@Size(max = 50, message = "babyNickname must be 50 characters or less")
		String babyNickname,

		@Size(max = 20, message = "role must be 20 characters or less")
		String role,

		LocalDate dueDate
) {
}
