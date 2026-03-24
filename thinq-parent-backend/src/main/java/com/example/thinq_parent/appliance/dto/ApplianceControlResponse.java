package com.example.thinq_parent.appliance.dto;

import java.time.LocalDateTime;

public record ApplianceControlResponse(
		Long userApplianceControlId,
		Long applianceMasterId,
		String applianceCode,
		String applianceName,
		String applianceDescription,
		Long routineId,
		String routineCode,
		String pregnancyStage,
		String routineName,
		Boolean routineActivated,
		Boolean alertSoundEnabled,
		RoutineActionInfo action,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {

	public record RoutineActionInfo(
			Long routineActionId,
			Integer sequenceNo,
			String actionTitle,
			String actionDescription,
			String targetPowerState,
			String targetMode,
			String targetAlertSound
	) {
	}
}
