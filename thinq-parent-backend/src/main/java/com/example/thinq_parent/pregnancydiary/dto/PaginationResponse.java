package com.example.thinq_parent.pregnancydiary.dto;

public record PaginationResponse(
		int page,
		int limit,
		long totalCount,
		int totalPages
) {
}
