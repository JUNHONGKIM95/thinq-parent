package com.example.thinq_parent.appliance.controller;

import com.example.thinq_parent.appliance.dto.AlertSoundUpdateRequest;
import com.example.thinq_parent.appliance.dto.ApplianceControlResponse;
import com.example.thinq_parent.appliance.dto.ApplianceControlSetupRequest;
import com.example.thinq_parent.appliance.dto.RoutineResponse;
import com.example.thinq_parent.appliance.service.ApplianceControlService;
import com.example.thinq_parent.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/appliance-controls")
@Tag(name = "Appliance Control", description = "가전 제어 API - 루틴 선택, 가전 상태 조회, 알림음 제어")
public class ApplianceControlController {

	private final ApplianceControlService applianceControlService;

	public ApplianceControlController(ApplianceControlService applianceControlService) {
		this.applianceControlService = applianceControlService;
	}

	@PostMapping
	@Operation(summary = "가전 제어 초기 설정", description = "루틴(초기/중기/후기)을 선택하여 4개 가전의 제어 상태를 등록합니다. 이미 등록된 경우 루틴만 변경됩니다.")
	public ApiResponse<List<ApplianceControlResponse>> setupControls(
			@Parameter(description = "사용자 ID", required = true)
			@RequestHeader("X-USER-ID") Integer userId,
			@Valid @RequestBody ApplianceControlSetupRequest request
	) {
		return ApiResponse.success(
				"가전 제어 설정이 완료되었습니다.",
				applianceControlService.setupControls(userId, request)
		);
	}

	@GetMapping
	@Operation(summary = "내 가전 제어 목록 조회", description = "사용자의 4개 가전 제어 상태와 선택된 루틴 정보, 각 가전의 동작 방식을 조회합니다.")
	public ApiResponse<List<ApplianceControlResponse>> getControls(
			@Parameter(description = "사용자 ID", required = true)
			@RequestHeader("X-USER-ID") Integer userId
	) {
		return ApiResponse.success(
				"가전 제어 목록을 조회했습니다.",
				applianceControlService.getControls(userId)
		);
	}

	@GetMapping("/{id}")
	@Operation(summary = "개별 가전 제어 상세 조회", description = "특정 가전의 제어 상태와 해당 루틴에서의 동작 정보를 조회합니다.")
	public ApiResponse<ApplianceControlResponse> getControl(
			@Parameter(description = "사용자 ID", required = true)
			@RequestHeader("X-USER-ID") Integer userId,
			@Parameter(description = "가전 제어 ID", required = true)
			@PathVariable Long id
	) {
		return ApiResponse.success(
				"가전 제어 상세를 조회했습니다.",
				applianceControlService.getControl(userId, id)
		);
	}

	@PatchMapping("/{id}/alert-sound")
	@Operation(summary = "알림음 제어", description = "특정 가전의 알림음을 ON/OFF 합니다.")
	public ApiResponse<ApplianceControlResponse> updateAlertSound(
			@Parameter(description = "사용자 ID", required = true)
			@RequestHeader("X-USER-ID") Integer userId,
			@Parameter(description = "가전 제어 ID", required = true)
			@PathVariable Long id,
			@Valid @RequestBody AlertSoundUpdateRequest request
	) {
		return ApiResponse.success(
				"알림음 설정이 변경되었습니다.",
				applianceControlService.updateAlertSound(userId, id, request)
		);
	}

	@GetMapping("/routines")
	@Operation(summary = "루틴 목록 조회", description = "3개 루틴(초기/중기/후기)과 각 루틴의 가전 동작 목록을 조회합니다.")
	public ApiResponse<List<RoutineResponse>> getRoutines() {
		return ApiResponse.success(
				"루틴 목록을 조회했습니다.",
				applianceControlService.getRoutines()
		);
	}
}
