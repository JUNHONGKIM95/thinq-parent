package com.example.thinq_parent.familygroup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FamilyGroupJoinRequest(
		@NotNull(message = "userId is required")
		Integer userId,

		@NotBlank(message = "inviteCode is required")
		@Size(max = 50, message = "inviteCode must be 50 characters or less")
		String inviteCode
) {
}
