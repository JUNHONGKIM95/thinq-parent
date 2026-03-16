package com.example.thinq_parent.parent.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
	
public record ParentCreateRequest(
		@NotBlank(message = "parentName is required")
		@Size(max = 50, message = "parentName must be 50 characters or less")
		String parentName,

		@NotBlank(message = "email is required")
		@Email(message = "email must be valid")
		String email,

		@NotBlank(message = "phoneNumber is required")
		@Size(max = 20, message = "phoneNumber must be 20 characters or less")
		String phoneNumber,

		@NotBlank(message = "childName is required")
		@Size(max = 50, message = "childName must be 50 characters or less")
		String childName,

		@NotBlank(message = "relationship is required")
		@Size(max = 30, message = "relationship must be 30 characters or less")
		String relationship
) {
}
