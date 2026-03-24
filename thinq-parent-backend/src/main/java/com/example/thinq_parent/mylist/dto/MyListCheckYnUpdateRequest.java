package com.example.thinq_parent.mylist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record MyListCheckYnUpdateRequest(
		@NotBlank(message = "checkYn is required")
		@Pattern(regexp = "Y|N", message = "checkYn must be Y or N")
		String checkYn
) {
}
