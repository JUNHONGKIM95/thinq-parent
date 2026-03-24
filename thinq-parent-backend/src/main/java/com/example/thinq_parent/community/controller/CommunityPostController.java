package com.example.thinq_parent.community.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.community.dto.CommunityCommentCreateRequest;
import com.example.thinq_parent.community.dto.CommunityCommentPatchRequest;
import com.example.thinq_parent.community.dto.CommunityCommentResponse;
import com.example.thinq_parent.community.dto.CommunityPostCreateRequest;
import com.example.thinq_parent.community.dto.CommunityPostPatchRequest;
import com.example.thinq_parent.community.dto.CommunityPostResponse;
import com.example.thinq_parent.community.service.CommunityService;
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

import java.util.List;

@RestController
@RequestMapping("/api/v1/community")
@Tag(name = "Community", description = "Community posts, comments, and likes APIs")
public class CommunityPostController {

	private final CommunityService communityService;

	public CommunityPostController(CommunityService communityService) {
		this.communityService = communityService;
	}

	@GetMapping("/posts")
	@Operation(summary = "Get community posts", description = "Returns published posts with optional board, keyword, and same MomBTI filters")
	public ApiResponse<List<CommunityPostResponse>> getPosts(
			@RequestParam(required = false) Integer boardId,
			@RequestParam(required = false) Integer keywordId,
			@RequestParam(defaultValue = "false") boolean sameMombtiOnly,
			@RequestParam(required = false) Integer userId
	) {
		return ApiResponse.success(
				"Community posts fetched successfully",
				communityService.getPosts(boardId, keywordId, sameMombtiOnly, userId)
		);
	}

	@GetMapping("/posts/{postId}")
	@Operation(summary = "Get community post detail", description = "Returns one post and increases its view count")
	public ApiResponse<CommunityPostResponse> getPost(@PathVariable Integer postId) {
		return ApiResponse.success("Community post fetched successfully", communityService.getPost(postId));
	}

	@PostMapping("/posts")
	@Operation(summary = "Create community post", description = "Creates one community post and snapshots the author's latest MomBTI result")
	@RequestBody(
			description = "Create post payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create community post",
							value = """
									{
									  "authorUserId": 3,
									  "boardId": 1,
									  "keywordId": 4,
									  "title": "입덧이 너무 심해요",
									  "content": "요즘 아침마다 너무 힘든데 다들 어떻게 버티셨나요?",
									  "isAnonymous": false
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<CommunityPostResponse>> createPost(
			@Valid @org.springframework.web.bind.annotation.RequestBody CommunityPostCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Community post created successfully", communityService.createPost(request)));
	}

	@PatchMapping("/posts/{postId}")
	@Operation(summary = "Patch community post", description = "Updates board, keyword, title, content, and anonymous flag")
	@RequestBody(
			description = "Patch post payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Patch community post",
							value = """
									{
									  "authorUserId": 3,
									  "boardId": 2,
									  "keywordId": 1,
									  "title": "제목 수정",
									  "content": "내용 수정",
									  "isAnonymous": true
									}
									"""
					)
			)
	)
	public ApiResponse<CommunityPostResponse> patchPost(
			@PathVariable Integer postId,
			@Valid @org.springframework.web.bind.annotation.RequestBody CommunityPostPatchRequest request
	) {
		return ApiResponse.success("Community post updated successfully", communityService.patchPost(postId, request));
	}

	@DeleteMapping("/posts/{postId}")
	@Operation(summary = "Delete community post", description = "Soft deletes one community post")
	public ApiResponse<Void> deletePost(
			@PathVariable Integer postId,
			@RequestParam Integer authorUserId
	) {
		communityService.deletePost(postId, authorUserId);
		return ApiResponse.success("Community post deleted successfully");
	}

	@GetMapping("/posts/{postId}/comments")
	@Operation(summary = "Get comments", description = "Returns published comments for one post")
	public ApiResponse<List<CommunityCommentResponse>> getComments(@PathVariable Integer postId) {
		return ApiResponse.success("Community comments fetched successfully", communityService.getComments(postId));
	}

	@PostMapping("/posts/{postId}/comments")
	@Operation(summary = "Create comment", description = "Creates one comment and updates post comment_count")
	@RequestBody(
			description = "Create comment payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Create comment",
							value = """
									{
									  "authorUserId": 4,
									  "content": "저도 비슷했어요. 병원에 꼭 말씀해보세요."
									}
									"""
					)
			)
	)
	public ResponseEntity<ApiResponse<CommunityCommentResponse>> createComment(
			@PathVariable Integer postId,
			@Valid @org.springframework.web.bind.annotation.RequestBody CommunityCommentCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Community comment created successfully", communityService.createComment(postId, request)));
	}

	@PatchMapping("/comments/{commentId}")
	@Operation(summary = "Patch comment", description = "Updates one comment's content")
	@RequestBody(
			description = "Patch comment payload",
			required = true,
			content = @Content(
					mediaType = "application/json",
					examples = @ExampleObject(
							name = "Patch comment",
							value = """
									{
									  "authorUserId": 4,
									  "content": "댓글 내용 수정"
									}
									"""
					)
			)
	)
	public ApiResponse<CommunityCommentResponse> patchComment(
			@PathVariable Integer commentId,
			@Valid @org.springframework.web.bind.annotation.RequestBody CommunityCommentPatchRequest request
	) {
		return ApiResponse.success("Community comment updated successfully", communityService.patchComment(commentId, request));
	}

	@DeleteMapping("/comments/{commentId}")
	@Operation(summary = "Delete comment", description = "Soft deletes one comment and updates post comment_count")
	public ApiResponse<Void> deleteComment(
			@PathVariable Integer commentId,
			@RequestParam Integer authorUserId
	) {
		communityService.deleteComment(commentId, authorUserId);
		return ApiResponse.success("Community comment deleted successfully");
	}

	@PostMapping("/posts/{postId}/likes")
	@Operation(summary = "Like post", description = "Adds one post like and updates post like_count")
	public ApiResponse<CommunityPostResponse> likePost(
			@PathVariable Integer postId,
			@RequestParam Integer userId
	) {
		return ApiResponse.success("Community post liked successfully", communityService.likePost(postId, userId));
	}

	@DeleteMapping("/posts/{postId}/likes")
	@Operation(summary = "Unlike post", description = "Removes one post like and updates post like_count")
	public ApiResponse<CommunityPostResponse> unlikePost(
			@PathVariable Integer postId,
			@RequestParam Integer userId
	) {
		return ApiResponse.success("Community post unliked successfully", communityService.unlikePost(postId, userId));
	}
}
