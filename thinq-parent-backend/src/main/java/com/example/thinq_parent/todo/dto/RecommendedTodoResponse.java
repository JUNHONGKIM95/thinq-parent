package com.example.thinq_parent.todo.dto;

import java.time.LocalDate;
import java.util.List;

public record RecommendedTodoResponse(
		Integer userId,
		LocalDate dueDate,
		Integer currentWeek,
		List<RecommendedTodoItemResponse> todos
) {
}
