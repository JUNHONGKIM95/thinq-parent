package com.example.thinq_parent.mylist.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.mylist.dto.MyListCheckYnUpdateRequest;
import com.example.thinq_parent.mylist.dto.MyListCreateRequest;
import com.example.thinq_parent.mylist.dto.MyListResponse;
import com.example.thinq_parent.mylist.dto.MyListTitleUpdateRequest;
import com.example.thinq_parent.mylist.service.MyListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
@RequestMapping("/api/v1/my-list")
@Tag(name = "My List", description = "User-created daily todo list APIs")
public class MyListController {

	private final MyListService myListService;

	public MyListController(MyListService myListService) {
		this.myListService = myListService;
	}

	@PostMapping("/users/{userId}")
	@Operation(
			summary = "Create my list item",
			description = "Creates one my_list row for the user's group. The frontend only sends title and myListDate."
	)
	@RequestBody(
			description = "Title and date payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create my list item",
							value = """
									{
									  "title": "Take iron supplement",
									  "myListDate": "2026-03-19"
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<MyListResponse>> create(
			@PathVariable Integer userId,
			@Valid @org.springframework.web.bind.annotation.RequestBody MyListCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success(
						"My list item created successfully",
						myListService.create(userId, request)
				));
	}

	@GetMapping("/groups/{groupId}")
	@Operation(
			summary = "Get all my list items",
			description = "Returns all my_list rows for one group in reverse creation order"
	)
	public ApiResponse<List<MyListResponse>> findByGroupId(@PathVariable Integer groupId) {
		return ApiResponse.success(
				"My list fetched successfully",
				myListService.findByGroupId(groupId)
		);
	}

	@GetMapping("/groups/{groupId}/daily")
	@Operation(
			summary = "Get daily my list items",
			description = "Returns my_list rows for one group on the requested date"
	)
	public ApiResponse<List<MyListResponse>> findByGroupIdAndDate(
			@PathVariable Integer groupId,
			@RequestParam LocalDate date
	) {
		return ApiResponse.success(
				"Daily my list fetched successfully",
				myListService.findByGroupIdAndDate(groupId, date)
		);
	}

	@PatchMapping("/{myListId}/title")
	@Operation(summary = "Patch my list title", description = "Updates only the title of one my_list row")
	@RequestBody(
			description = "Title only payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Patch title",
							value = """
									{
									  "title": "Walk for 20 minutes"
									}
									"""
					)
			)
	)
	public ApiResponse<MyListResponse> updateTitle(
			@PathVariable Integer myListId,
			@Valid @org.springframework.web.bind.annotation.RequestBody MyListTitleUpdateRequest request
	) {
		return ApiResponse.success(
				"My list title updated successfully",
				myListService.updateTitle(myListId, request)
		);
	}

	@PatchMapping("/{myListId}/check-yn")
	@Operation(summary = "Patch my list checkYn", description = "Updates only the check_yn value of one my_list row")
	@RequestBody(
			description = "check_yn payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Patch checkYn",
							value = """
									{
									  "checkYn": "Y"
									}
									"""
					)
			)
	)
	public ApiResponse<MyListResponse> updateCheckYn(
			@PathVariable Integer myListId,
			@Valid @org.springframework.web.bind.annotation.RequestBody MyListCheckYnUpdateRequest request
	) {
		return ApiResponse.success(
				"My list checkYn updated successfully",
				myListService.updateCheckYn(myListId, request)
		);
	}

	@DeleteMapping("/{myListId}")
	@Operation(summary = "Delete my list item", description = "Deletes one my_list row by my_list_id")
	public ApiResponse<Void> delete(@PathVariable Integer myListId) {
		myListService.delete(myListId);
		return ApiResponse.success("My list item deleted successfully");
	}
}
