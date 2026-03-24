package com.example.thinq_parent.familygroup.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record FamilyGroupNameUpdateRequest(
		@NotBlank(message = "groupName is required")
		@Size(max = 100, message = "groupName must be 100 characters or less")
		@NoBrokenText(message = "groupName contains broken characters")
		String groupName
) {
}
