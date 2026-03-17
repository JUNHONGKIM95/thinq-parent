package com.example.thinq_parent.schedule.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.dto.ScheduleUpdateRequest;
import com.example.thinq_parent.schedule.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@Tag(name = "Schedules", description = "Expected delivery schedule CRUD and D-Day APIs")
public class ScheduleController {

	private final ScheduleService scheduleService;

	public ScheduleController(ScheduleService scheduleService) {
		this.scheduleService = scheduleService;
	}

	@PostMapping
	@Operation(summary = "Create schedule", description = "Saves a due-date schedule for a pregnant user")
	public ResponseEntity<ApiResponse<ScheduleResponse>> create(@Valid @RequestBody ScheduleCreateRequest request) {
		ScheduleResponse response = scheduleService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Schedule created successfully", response));
	}

	@GetMapping
	@Operation(summary = "Get schedule list", description = "Returns all schedules, or filters by userId/groupId when query params are provided")
	public ApiResponse<List<ScheduleResponse>> findAll(
			@RequestParam(required = false) Integer userId,
			@RequestParam(required = false) Integer groupId
	) {
		if (userId != null) {
			return ApiResponse.success("Schedule list fetched successfully", scheduleService.findByUserId(userId));
		}
		if (groupId != null) {
			return ApiResponse.success("Schedule list fetched successfully", scheduleService.findByGroupId(groupId));
		}
		return ApiResponse.success("Schedule list fetched successfully", scheduleService.findAll());
	}

	@GetMapping("/{scheduleId}")
	@Operation(summary = "Get schedule by id", description = "Returns one schedule including D-Day information")
	public ApiResponse<ScheduleResponse> findById(@PathVariable Integer scheduleId) {
		return ApiResponse.success("Schedule fetched successfully", scheduleService.findById(scheduleId));
	}

	@GetMapping("/users/{userId}/latest")
	@Operation(summary = "Get latest due date by user", description = "Returns the latest saved due-date schedule for a user")
	public ApiResponse<ScheduleResponse> findLatestByUserId(@PathVariable Integer userId) {
		return ApiResponse.success("Latest schedule fetched successfully", scheduleService.findLatestDueDateByUserId(userId));
	}

	@GetMapping("/daily/{userId}/{date}")
	@Operation(summary = "Get daily schedules by user", description = "Returns schedules for a specific user and date")
	public ApiResponse<List<ScheduleResponse>> findDailyByUserId(
			@PathVariable Integer userId,
			@PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
	) {
		return ApiResponse.success("Daily schedules fetched successfully", scheduleService.findDailyByUserId(userId, date));
	}

	@PutMapping("/{scheduleId}")
	@Operation(summary = "Update schedule", description = "Updates a saved due-date schedule")
	public ApiResponse<ScheduleResponse> update(
			@PathVariable Integer scheduleId,
			@Valid @RequestBody ScheduleUpdateRequest request
	) {
		return ApiResponse.success("Schedule updated successfully", scheduleService.update(scheduleId, request));
	}

	@DeleteMapping("/{scheduleId}")
	@Operation(summary = "Delete schedule", description = "Deletes a due-date schedule and clears user due_date if needed")
	public ApiResponse<Void> delete(@PathVariable Integer scheduleId) {
		scheduleService.delete(scheduleId);
		return ApiResponse.success("Schedule deleted successfully");
	}
}
