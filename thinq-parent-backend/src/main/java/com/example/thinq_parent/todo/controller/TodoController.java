package com.example.thinq_parent.todo.controller;

import com.example.thinq_parent.common.api.ApiResponse;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.todo.dto.RecommendedTodoItemResponse;
import com.example.thinq_parent.todo.dto.RecommendedTodoResponse;
import com.example.thinq_parent.todo.dto.TodoScheduleCreateRequest;
import com.example.thinq_parent.todo.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/todos")
@Tag(name = "Todos", description = "Pregnancy week based todo recommendation APIs")
public class TodoController {

	private final TodoService todoService;

	public TodoController(TodoService todoService) {
		this.todoService = todoService;
	}

	@GetMapping("/recommended")
	@Operation(summary = "Get recommended todos", description = "Returns todoId, targetWeek, todoName, and description whose target_week matches the user's current pregnancy week")
	public ApiResponse<RecommendedTodoResponse> getRecommendedTodos(@RequestParam Integer userId) {
		return ApiResponse.success(
				"Recommended todo list fetched successfully",
				todoService.getRecommendedTodos(userId)
		);
	}

	@GetMapping("/by-week")
	@Operation(summary = "Get todos by target week", description = "Returns todoId, targetWeek, todoName, and description whose target_week matches the requested pregnancy week")
	public ApiResponse<List<RecommendedTodoItemResponse>> getTodosByTargetWeek(@RequestParam Integer targetWeek) {
		return ApiResponse.success(
				"Todo list fetched successfully by target week",
				todoService.getTodosByTargetWeek(targetWeek)
		);
	}

	@PostMapping("/schedule")
	@Operation(summary = "Create schedule from todo", description = "Creates a schedule from a selected recommended todo")
	public ResponseEntity<ApiResponse<ScheduleResponse>> createScheduleFromTodo(
			@Valid @RequestBody TodoScheduleCreateRequest request
	) {
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success(
						"Schedule created from todo successfully",
						todoService.createScheduleFromTodo(request)
				));
	}
}
