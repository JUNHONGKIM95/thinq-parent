package com.example.thinq_parent.todo.dto;

public record RecommendedTodoItemResponse(
		Integer todoId,
		Integer targetWeek,
		String todoName,
		String description
) {
}
