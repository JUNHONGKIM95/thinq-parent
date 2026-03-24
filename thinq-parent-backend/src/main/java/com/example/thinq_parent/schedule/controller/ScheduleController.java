package com.example.thinq_parent.schedule.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.SchedulePatchRequest;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@Tag(name = "Schedules", description = "Calendar schedule CRUD APIs")
public class ScheduleController {

	private final ScheduleService scheduleService;

	public ScheduleController(ScheduleService scheduleService) {
		this.scheduleService = scheduleService;
	}

	@PostMapping
	@Operation(summary = "Create schedule", description = "Creates a calendar schedule with title, memo, scheduleDate, time, and scheduleType")
	@RequestBody(
			description = "Create schedule payload. scheduleType is one of 아기, 가족, 일, 개인, 중요, 기타.",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create schedule",
							value = """
									{
									  "groupId": 5,
									  "userId": 3,
									  "title": "Baby checkup",
									  "memo": "Hospital visit",
									  "scheduleType": "아기",
									  "scheduleDate": "2026-03-22",
									  "time": "18:30:00"
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<ScheduleResponse>> create(
			@Valid @org.springframework.web.bind.annotation.RequestBody ScheduleCreateRequest request
	) {
		ScheduleResponse response = scheduleService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Schedule created successfully", response));
	}

	@GetMapping("/monthly")
	@Operation(summary = "Get monthly schedules", description = "Returns all schedules in the requested year/month for one group")
	public ApiResponse<List<ScheduleResponse>> findMonthlySchedules(
			@RequestParam Integer groupId,
			@RequestParam int year,
			@RequestParam int month
	) {
		return ApiResponse.success(
				"Monthly schedule list fetched successfully",
				scheduleService.findMonthlySchedules(groupId, year, month)
		);
	}

	@GetMapping("/daily")
	@Operation(summary = "Get daily schedules", description = "Returns all schedules for one group on the requested date")
	public ApiResponse<List<ScheduleResponse>> findDailySchedules(
			@RequestParam Integer groupId,
			@RequestParam LocalDate date
	) {
		return ApiResponse.success(
				"Daily schedule list fetched successfully",
				scheduleService.findDailySchedules(groupId, date)
		);
	}

	@GetMapping("/{scheduleId}")
	@Operation(summary = "Get schedule by id", description = "Returns one schedule")
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

	@PatchMapping("/{scheduleId}")
	@Operation(summary = "Patch schedule", description = "Updates title, memo, scheduleDate, time, and scheduleType. Omitted, null, or blank values keep their existing values")
	@RequestBody(
			description = "Editing screen payload. You can set title, memo, scheduleDate, time, and scheduleType in one request.",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = {
							@ExampleObject(
									name = "Reset editable fields",
									value = """
											{
											  "title": "Hospital visit",
											  "memo": "Bring documents and questions",
											  "scheduleType": "중요",
											  "scheduleDate": "2026-03-24",
											  "time": "19:00:00"
											}
											"""
							),
							@ExampleObject(
									name = "Change only one field",
									value = """
											{
											  "memo": "메모만 변경"
											}
											"""
							)
					}
			)
	)
	public ApiResponse<ScheduleResponse> patch(
			@PathVariable Integer scheduleId,
			@Valid @org.springframework.web.bind.annotation.RequestBody SchedulePatchRequest request
	) {
		return ApiResponse.success("Schedule updated successfully", scheduleService.patch(scheduleId, request));
	}

	@DeleteMapping("/{scheduleId}")
	@Operation(summary = "Delete schedule", description = "Deletes one schedule row")
	public ApiResponse<Void> delete(@PathVariable Integer scheduleId) {
		scheduleService.delete(scheduleId);
		return ApiResponse.success("Schedule deleted successfully");
	}
}
