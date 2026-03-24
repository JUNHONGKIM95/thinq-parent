package com.example.thinq_parent.mylist.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MyListTitleUpdateRequest(
		@NotBlank(message = "title is required")
		@Size(max = 200, message = "title must be 200 characters or less")
		@NoBrokenText(message = "title contains broken characters")
		String title
) {
}
