package com.example.thinq_parent.community.dto;

public record BoardResponse(
		Integer boardId,
		String boardCode,
		String boardName,
		String description
) {
}
