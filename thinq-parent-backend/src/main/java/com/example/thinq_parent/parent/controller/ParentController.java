package com.example.thinq_parent.parent.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.parent.dto.ParentCreateRequest;
import com.example.thinq_parent.parent.dto.ParentResponse;
import com.example.thinq_parent.parent.dto.ParentUpdateRequest;
import com.example.thinq_parent.parent.service.ParentService;
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
@RequestMapping("/api/v1/parents")
@Tag(name = "Parents", description = "Parent resource CRUD APIs")
public class ParentController {

	private final ParentService parentService;

	public ParentController(ParentService parentService) {
		this.parentService = parentService;
	}

	@PostMapping
	@Operation(summary = "Create parent", description = "Creates a parent resource")
	public ResponseEntity<ApiResponse<ParentResponse>> create(@Valid @RequestBody ParentCreateRequest request) {
		ParentResponse response = parentService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Parent created successfully", response));
	}

	@GetMapping
	@Operation(summary = "Get parent list", description = "Returns all parent resources")
	public ApiResponse<List<ParentResponse>> findAll() {
		return ApiResponse.success("Parent list fetched successfully", parentService.findAll());
	}

	@GetMapping("/{id}")
	@Operation(summary = "Get parent by id", description = "Returns one parent resource by id")
	public ApiResponse<ParentResponse> findById(@PathVariable Long id) {
		return ApiResponse.success("Parent fetched successfully", parentService.findById(id));
	}

	@PutMapping("/{id}")
	@Operation(summary = "Update parent", description = "Updates an existing parent resource")
	public ApiResponse<ParentResponse> update(
			@PathVariable Long id,
			@Valid @RequestBody ParentUpdateRequest request
	) {
		return ApiResponse.success("Parent updated successfully", parentService.update(id, request));
	}

	@DeleteMapping("/{id}")
	@Operation(summary = "Delete parent", description = "Deletes a parent resource by id")
	public ApiResponse<Void> delete(@PathVariable Long id) {
		parentService.delete(id);
		return ApiResponse.success("Parent deleted successfully");
	}
}
