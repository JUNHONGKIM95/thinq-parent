package com.example.thinq_parent.mylist.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MyListResponse(
		Integer myListId,
		Integer groupId,
		Integer userId,
		String title,
		LocalDate myListDate,
		LocalDateTime createdAt,
		String checkYn
) {
}
