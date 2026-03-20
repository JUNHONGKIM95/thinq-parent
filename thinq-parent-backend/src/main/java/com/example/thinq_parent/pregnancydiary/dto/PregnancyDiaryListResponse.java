package com.example.thinq_parent.pregnancydiary.dto;

import java.util.List;

public record PregnancyDiaryListResponse(
		List<PregnancyDiaryListItemResponse> items,
		PaginationResponse pagination
) {
}
