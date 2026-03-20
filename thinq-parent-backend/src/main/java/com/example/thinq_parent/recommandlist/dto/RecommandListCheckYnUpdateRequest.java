package com.example.thinq_parent.recommandlist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RecommandListCheckYnUpdateRequest(
		@NotBlank(message = "checkYn is required")
		@Pattern(regexp = "Y|N", message = "checkYn must be Y or N")
		String checkYn
) {
}
