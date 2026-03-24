package com.example.thinq_parent.community.service;

import com.example.thinq_parent.community.dto.BoardResponse;
import com.example.thinq_parent.community.dto.CommunityCommentCreateRequest;
import com.example.thinq_parent.community.dto.CommunityCommentPatchRequest;
import com.example.thinq_parent.community.dto.CommunityCommentResponse;
import com.example.thinq_parent.community.dto.CommunityKeywordResponse;
import com.example.thinq_parent.community.dto.CommunityPostCreateRequest;
import com.example.thinq_parent.community.dto.CommunityPostPatchRequest;
import com.example.thinq_parent.community.dto.CommunityPostResponse;

import java.util.List;

public interface CommunityService {

	List<BoardResponse> getBoards();

	List<CommunityKeywordResponse> getKeywords();

	List<CommunityPostResponse> getPosts(Integer boardId, Integer keywordId, boolean sameMombtiOnly, Integer userId);

	CommunityPostResponse getPost(Integer postId, Integer userId);

	CommunityPostResponse createPost(CommunityPostCreateRequest request);

	CommunityPostResponse patchPost(Integer postId, CommunityPostPatchRequest request);

	void deletePost(Integer postId, Integer authorUserId);

	List<CommunityCommentResponse> getComments(Integer postId);

	CommunityCommentResponse createComment(Integer postId, CommunityCommentCreateRequest request);

	CommunityCommentResponse patchComment(Integer commentId, CommunityCommentPatchRequest request);

	void deleteComment(Integer commentId, Integer authorUserId);

	CommunityPostResponse likePost(Integer postId, Integer userId);

	CommunityPostResponse unlikePost(Integer postId, Integer userId);
}
