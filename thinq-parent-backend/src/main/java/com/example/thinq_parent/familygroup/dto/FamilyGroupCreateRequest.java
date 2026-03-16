package com.example.thinq_parent.familygroup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record FamilyGroupCreateRequest(
		@NotNull(message = "groupId is required")
		Integer groupId,

		@NotBlank(message = "groupName is required")
		@Size(max = 100, message = "groupName must be 100 characters or less")
		String groupName,

		@NotNull(message = "userId is required")
		Integer userId
) {
}
