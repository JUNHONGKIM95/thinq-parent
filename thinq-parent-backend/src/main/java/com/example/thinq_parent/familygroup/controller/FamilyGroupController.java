package com.example.thinq_parent.familygroup.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.familygroup.dto.FamilyGroupCreateRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupJoinRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupResponse;
import com.example.thinq_parent.familygroup.service.FamilyGroupService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/family-groups")
@Tag(name = "Family Groups", description = "Family group creation and invite-code join APIs")
public class FamilyGroupController {

	private final FamilyGroupService familyGroupService;

	public FamilyGroupController(FamilyGroupService familyGroupService) {
		this.familyGroupService = familyGroupService;
	}

	@PostMapping
	@Operation(summary = "Create family group", description = "Creates a family group and returns an invite code")
	public ResponseEntity<ApiResponse<FamilyGroupResponse>> create(@Valid @RequestBody FamilyGroupCreateRequest request) {
		FamilyGroupResponse response = familyGroupService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Family group created successfully", response));
	}

	@GetMapping
	@Operation(summary = "Get family group list", description = "Returns all family groups")
	public ApiResponse<List<FamilyGroupResponse>> findAll() {
		return ApiResponse.success("Family group list fetched successfully", familyGroupService.findAll());
	}

	@GetMapping("/{groupId}")
	@Operation(summary = "Get family group by id", description = "Returns one family group with joined members")
	public ApiResponse<FamilyGroupResponse> findById(@PathVariable Integer groupId) {
		return ApiResponse.success("Family group fetched successfully", familyGroupService.findById(groupId));
	}

	@PostMapping("/join")
	@Operation(summary = "Join family group by invite code", description = "Allows another family member to join with a shared invite code")
	public ApiResponse<FamilyGroupResponse> join(@Valid @RequestBody FamilyGroupJoinRequest request) {
		return ApiResponse.success("Family group joined successfully", familyGroupService.join(request));
	}
}
