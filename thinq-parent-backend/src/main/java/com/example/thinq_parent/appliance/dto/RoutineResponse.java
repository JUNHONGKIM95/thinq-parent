package com.example.thinq_parent.appliance.dto;

import java.util.List;

public record RoutineResponse(
		Long routineId,
		String routineCode,
		String pregnancyStage,
		String routineName,
		String routineDescription,
		List<ActionItem> actions
) {

	public record ActionItem(
			Long routineActionId,
			Integer sequenceNo,
			String applianceCode,
			String applianceName,
			String actionTitle,
			String actionDescription,
			String targetPowerState,
			String targetMode,
			String targetAlertSound
	) {
	}
}
