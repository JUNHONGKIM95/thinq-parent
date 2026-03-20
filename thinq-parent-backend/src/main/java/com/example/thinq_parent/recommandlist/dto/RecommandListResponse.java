package com.example.thinq_parent.recommandlist.dto;

import java.time.LocalDateTime;

public record RecommandListResponse(
		Integer recommandListId,
		Integer groupId,
		Integer userId,
		Integer todoId,
		Integer currentWeek,
		String checkYn,
		LocalDateTime createdAt,
		String todoName,
		String description
) {
}
