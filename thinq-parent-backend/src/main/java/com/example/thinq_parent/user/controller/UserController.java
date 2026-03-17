package com.example.thinq_parent.user.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.user.dto.UserCreateRequest;
import com.example.thinq_parent.user.dto.UserPregnancySummaryResponse;
import com.example.thinq_parent.user.dto.UserResponse;
import com.example.thinq_parent.user.dto.UserUpdateRequest;
import com.example.thinq_parent.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "Users", description = "User resource CRUD APIs")
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping
	@Operation(summary = "Create user", description = "Creates a new user resource")
	public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
		UserResponse response = userService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("User created successfully", response));
	}

	@GetMapping
	@Operation(summary = "Get user list", description = "Returns all users")
	public ApiResponse<List<UserResponse>> findAll() {
		return ApiResponse.success("User list fetched successfully", userService.findAll());
	}

	@GetMapping("/{userId}")
	@Operation(summary = "Get user by id", description = "Returns one user by userId")
	public ApiResponse<UserResponse> findById(@PathVariable Integer userId) {
		return ApiResponse.success("User fetched successfully", userService.findById(userId));
	}

	@GetMapping("/{userId}/pregnancy-summary")
	@Operation(summary = "Get pregnancy summary", description = "Returns due date, remaining days until due date, and current pregnancy week")
	public ApiResponse<UserPregnancySummaryResponse> getPregnancySummary(@PathVariable Integer userId) {
		return ApiResponse.success("Pregnancy summary fetched successfully", userService.getPregnancySummary(userId));
	}

	@PutMapping("/{userId}")
	@Operation(summary = "Update user", description = "Updates an existing user")
	public ApiResponse<UserResponse> update(
			@PathVariable Integer userId,
			@Valid @RequestBody UserUpdateRequest request
	) {
		return ApiResponse.success("User updated successfully", userService.update(userId, request));
	}

	@DeleteMapping("/{userId}")
	@Operation(summary = "Delete user", description = "Deletes a user by userId")
	public ApiResponse<Void> delete(@PathVariable Integer userId) {
		userService.delete(userId);
		return ApiResponse.success("User deleted successfully");
	}
}
