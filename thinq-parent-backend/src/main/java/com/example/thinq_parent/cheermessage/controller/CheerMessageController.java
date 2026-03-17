package com.example.thinq_parent.cheermessage.controller;

import com.example.thinq_parent.cheermessage.dto.CheerMessageCreateRequest;
import com.example.thinq_parent.cheermessage.dto.CheerMessageResponse;
import com.example.thinq_parent.cheermessage.service.CheerMessageService;
import com.example.thinq_parent.common.api.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cheer-messages")
@Tag(name = "Cheer Messages", description = "Cheer message create and latest-message APIs")
public class CheerMessageController {

	private final CheerMessageService cheerMessageService;

	public CheerMessageController(CheerMessageService cheerMessageService) {
		this.cheerMessageService = cheerMessageService;
	}

	@PostMapping
	@Operation(summary = "Create cheer message", description = "Stores a cheer message written by a user for a family group")
	public ResponseEntity<ApiResponse<CheerMessageResponse>> create(@Valid @RequestBody CheerMessageCreateRequest request) {
		CheerMessageResponse response = cheerMessageService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Cheer message created successfully", response));
	}

	@GetMapping("/groups/{groupId}/latest")
	@Operation(summary = "Get latest cheer message", description = "Returns the latest cheer message for a family group. If none exists, content and senderUsername are null.")
	public ApiResponse<CheerMessageResponse> findLatestByGroupId(@PathVariable Integer groupId) {
		return ApiResponse.success("Latest cheer message fetched successfully", cheerMessageService.findLatestByGroupId(groupId));
	}

	@GetMapping("/users/{userId}/latest")
	@Operation(summary = "Get latest cheer message by user", description = "Finds the family group for a user and returns the latest cheer message content by createdAt.")
	public ApiResponse<CheerMessageResponse> findLatestByUserId(@PathVariable Integer userId) {
		return ApiResponse.success("Latest cheer message fetched successfully", cheerMessageService.findLatestByUserId(userId));
	}
}
