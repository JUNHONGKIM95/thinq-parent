package com.example.thinq_parent.user.dto;

import com.example.thinq_parent.common.validation.NoBrokenText;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserBabyNicknameUpdateRequest(
		@NotBlank(message = "babyNickname is required")
		@Size(max = 50, message = "babyNickname must be 50 characters or less")
		@NoBrokenText(message = "babyNickname contains broken characters")
		String babyNickname
) {
}
