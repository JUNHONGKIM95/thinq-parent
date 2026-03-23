package com.example.thinq_parent.appliance.service;

import com.example.thinq_parent.appliance.dto.AlertSoundUpdateRequest;
import com.example.thinq_parent.appliance.dto.ApplianceControlResponse;
import com.example.thinq_parent.appliance.dto.ApplianceControlSetupRequest;
import com.example.thinq_parent.appliance.dto.RoutineResponse;

import java.util.List;

public interface ApplianceControlService {

	List<ApplianceControlResponse> setupControls(Integer userId, ApplianceControlSetupRequest request);

	List<ApplianceControlResponse> getControls(Integer userId);

	ApplianceControlResponse getControl(Integer userId, Long userApplianceControlId);

	ApplianceControlResponse updateAlertSound(Integer userId, Long userApplianceControlId, AlertSoundUpdateRequest request);

	List<RoutineResponse> getRoutines();
}
