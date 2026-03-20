package com.example.thinq_parent.todo.service;

import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.service.ScheduleService;
import com.example.thinq_parent.todo.domain.Todo;
import com.example.thinq_parent.todo.dto.RecommendedTodoItemResponse;
import com.example.thinq_parent.todo.dto.RecommendedTodoResponse;
import com.example.thinq_parent.todo.dto.TodoScheduleCreateRequest;
import com.example.thinq_parent.todo.repository.TodoRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class TodoServiceImpl implements TodoService {

	private final TodoRepository todoRepository;
	private final UserRepository userRepository;
	private final ScheduleService scheduleService;

	public TodoServiceImpl(
			TodoRepository todoRepository,
			UserRepository userRepository,
			ScheduleService scheduleService
	) {
		this.todoRepository = todoRepository;
		this.userRepository = userRepository;
		this.scheduleService = scheduleService;
	}

	@Override
	public RecommendedTodoResponse getRecommendedTodos(Integer userId) {
		AppUser user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
		Integer currentWeek = user.getCurrentWeek();
		var todos = currentWeek == null || currentWeek <= 0
				? java.util.List.<RecommendedTodoItemResponse>of()
				: todoRepository.findByTargetWeekOrderByTodoIdAsc(currentWeek)
						.stream()
						.map(todo -> new RecommendedTodoItemResponse(
								todo.getTodoId(),
								todo.getTargetWeek(),
								todo.getTodoName(),
								todo.getDescription()
						))
						.toList();

		return new RecommendedTodoResponse(
				user.getUserId(),
				user.getDueDate(),
				currentWeek,
				todos
		);
	}

	@Override
	public java.util.List<RecommendedTodoItemResponse> getTodosByTargetWeek(Integer targetWeek) {
		if (targetWeek == null || targetWeek <= 0) {
			return java.util.List.of();
		}
		return todoRepository.findByTargetWeekOrderByTodoIdAsc(targetWeek)
				.stream()
				.map(this::toRecommendedItem)
				.toList();
	}

	@Override
	@Transactional
	public ScheduleResponse createScheduleFromTodo(TodoScheduleCreateRequest request) {
		return scheduleService.createFromTodo(request);
	}

	private RecommendedTodoItemResponse toRecommendedItem(Todo todo) {
		return new RecommendedTodoItemResponse(
				todo.getTodoId(),
				todo.getTargetWeek(),
				todo.getTodoName(),
				todo.getDescription()
		);
	}
}
