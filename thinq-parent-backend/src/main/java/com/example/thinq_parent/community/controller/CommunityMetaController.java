package com.example.thinq_parent.community.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.community.dto.BoardResponse;
import com.example.thinq_parent.community.dto.CommunityKeywordResponse;
import com.example.thinq_parent.community.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/community")
@Tag(name = "Community Meta", description = "Community boards and keywords APIs")
public class CommunityMetaController {

	private final CommunityService communityService;

	public CommunityMetaController(CommunityService communityService) {
		this.communityService = communityService;
	}

	@GetMapping("/boards")
	@Operation(summary = "Get boards", description = "Returns active community board tabs")
	public ApiResponse<List<BoardResponse>> getBoards() {
		return ApiResponse.success("Boards fetched successfully", communityService.getBoards());
	}

	@GetMapping("/keywords")
	@Operation(summary = "Get community keywords", description = "Returns active community keywords")
	public ApiResponse<List<CommunityKeywordResponse>> getKeywords() {
		return ApiResponse.success("Community keywords fetched successfully", communityService.getKeywords());
	}
}
