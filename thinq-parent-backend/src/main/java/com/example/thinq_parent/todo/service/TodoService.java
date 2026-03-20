package com.example.thinq_parent.todo.service;

import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.todo.dto.RecommendedTodoItemResponse;
import com.example.thinq_parent.todo.dto.RecommendedTodoResponse;
import com.example.thinq_parent.todo.dto.TodoScheduleCreateRequest;

import java.util.List;

public interface TodoService {

	RecommendedTodoResponse getRecommendedTodos(Integer userId);

	List<RecommendedTodoItemResponse> getTodosByTargetWeek(Integer targetWeek);

	ScheduleResponse createScheduleFromTodo(TodoScheduleCreateRequest request);
}
