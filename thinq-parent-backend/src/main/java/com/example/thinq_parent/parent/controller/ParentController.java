package com.example.thinq_parent.parent.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.parent.dto.ParentCreateRequest;
import com.example.thinq_parent.parent.dto.ParentResponse;
import com.example.thinq_parent.parent.dto.ParentUpdateRequest;
import com.example.thinq_parent.parent.service.ParentService;
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
public class ParentController {

	private final ParentService parentService;

	public ParentController(ParentService parentService) {
		this.parentService = parentService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<ParentResponse>> create(@Valid @RequestBody ParentCreateRequest request) {
		ParentResponse response = parentService.create(request);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Parent created successfully", response));
	}

	@GetMapping
	public ApiResponse<List<ParentResponse>> findAll() {
		return ApiResponse.success("Parent list fetched successfully", parentService.findAll());
	}

	@GetMapping("/{id}")
	public ApiResponse<ParentResponse> findById(@PathVariable Long id) {
		return ApiResponse.success("Parent fetched successfully", parentService.findById(id));
	}

	@PutMapping("/{id}")
	public ApiResponse<ParentResponse> update(
			@PathVariable Long id,
			@Valid @RequestBody ParentUpdateRequest request
	) {
		return ApiResponse.success("Parent updated successfully", parentService.update(id, request));
	}

	@DeleteMapping("/{id}")
	public ApiResponse<Void> delete(@PathVariable Long id) {
		parentService.delete(id);
		return ApiResponse.success("Parent deleted successfully");
	}
}
