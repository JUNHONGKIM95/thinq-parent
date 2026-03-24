package com.example.thinq_parent.recommandlist.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.recommandlist.dto.RecommandListCheckYnUpdateRequest;
import com.example.thinq_parent.recommandlist.dto.RecommandListResponse;
import com.example.thinq_parent.recommandlist.service.RecommandListService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/recommand-list")
@Tag(name = "Recommand List", description = "Recommended todo list APIs")
public class RecommandListController {

	private final RecommandListService recommandListService;

	public RecommandListController(RecommandListService recommandListService) {
		this.recommandListService = recommandListService;
	}

	@GetMapping("/users/{userId}")
	@Operation(summary = "Get recommand list", description = "Calculates current week from due_date, ensures recommand_list rows exist, and returns joined todo_name and description for the same week")
	public ApiResponse<List<RecommandListResponse>> findByUserId(@PathVariable Integer userId) {
		return ApiResponse.success(
				"Recommand list fetched successfully",
				recommandListService.findByUserId(userId)
		);
	}

	@PatchMapping("/{recommandListId}/check-yn")
	@Operation(summary = "Patch recommand list checkYn", description = "Updates only the check_yn value of one recommand_list row")
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
	public ApiResponse<RecommandListResponse> updateCheckYn(
			@PathVariable Integer recommandListId,
			@Valid @org.springframework.web.bind.annotation.RequestBody RecommandListCheckYnUpdateRequest request
	) {
		return ApiResponse.success(
				"Recommand list checkYn updated successfully",
				recommandListService.updateCheckYn(recommandListId, request)
		);
	}
}
