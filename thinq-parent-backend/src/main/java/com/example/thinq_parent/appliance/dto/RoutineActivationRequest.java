package com.example.thinq_parent.appliance.dto;

import jakarta.validation.constraints.NotNull;

public record RoutineActivationRequest(
		@NotNull(message = "activated는 필수입니다")
		Boolean activated
) {
}
