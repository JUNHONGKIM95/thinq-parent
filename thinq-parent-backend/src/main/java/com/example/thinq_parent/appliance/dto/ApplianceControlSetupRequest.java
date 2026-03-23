package com.example.thinq_parent.appliance.dto;

import jakarta.validation.constraints.NotNull;

public record ApplianceControlSetupRequest(
		@NotNull(message = "routineId는 필수입니다")
		Long routineId
) {
}
