package com.example.thinq_parent.recommandlist.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.recommandlist.domain.RecommandList;
import com.example.thinq_parent.recommandlist.dto.RecommandListCheckYnUpdateRequest;
import com.example.thinq_parent.recommandlist.dto.RecommandListResponse;
import com.example.thinq_parent.recommandlist.repository.RecommandListRepository;
import com.example.thinq_parent.todo.domain.Todo;
import com.example.thinq_parent.todo.repository.TodoRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import com.example.thinq_parent.user.service.PregnancyInfoCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class RecommandListServiceImpl implements RecommandListService {

	private static final Character DEFAULT_CHECK_YN = 'N';

	private final RecommandListRepository recommandListRepository;
	private final UserRepository userRepository;
	private final TodoRepository todoRepository;
	private final PregnancyInfoCalculator pregnancyInfoCalculator;

	public RecommandListServiceImpl(
			RecommandListRepository recommandListRepository,
			UserRepository userRepository,
			TodoRepository todoRepository,
			PregnancyInfoCalculator pregnancyInfoCalculator
	) {
		this.recommandListRepository = recommandListRepository;
		this.userRepository = userRepository;
		this.todoRepository = todoRepository;
		this.pregnancyInfoCalculator = pregnancyInfoCalculator;
	}

	@Override
	@Transactional
	public List<RecommandListResponse> findByUserId(Integer userId) {
		AppUser user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
		if (user.getGroupId() == null) {
			throw new InvalidRequestException("User must belong to a family group.");
		}

		Integer currentWeek = resolveCurrentWeek(user);
		if (currentWeek == null || currentWeek <= 0) {
			return List.of();
		}

		List<Todo> todos = todoRepository.findByTargetWeekOrderByTodoIdAsc(currentWeek);
		Map<Integer, RecommandList> existingByTodoId = recommandListRepository
				.findByGroupIdAndUserIdAndCurrentWeekOrderByRecommandListIdAsc(user.getGroupId(), user.getUserId(), currentWeek)
				.stream()
				.collect(Collectors.toMap(
						RecommandList::getTodoId,
						Function.identity(),
						(existing, ignored) -> existing,
						LinkedHashMap::new
				));

		for (Todo todo : todos) {
			existingByTodoId.computeIfAbsent(
					todo.getTodoId(),
					todoId -> recommandListRepository.save(new RecommandList(
							user.getGroupId(),
							user.getUserId(),
							todoId,
							currentWeek,
							DEFAULT_CHECK_YN
					))
			);
		}

		return todos.stream()
				.map(todo -> toResponse(existingByTodoId.get(todo.getTodoId()), todo))
				.toList();
	}

	@Override
	@Transactional
	public RecommandListResponse updateCheckYn(Integer recommandListId, RecommandListCheckYnUpdateRequest request) {
		RecommandList recommandList = recommandListRepository.findById(recommandListId)
				.orElseThrow(() -> new ResourceNotFoundException("Recommand list item not found. recommandListId=" + recommandListId));
		recommandList.updateCheckYn(validateCheckYn(request.checkYn()));
		Todo todo = todoRepository.findById(recommandList.getTodoId())
				.orElseThrow(() -> new ResourceNotFoundException("Todo not found. todoId=" + recommandList.getTodoId()));
		return toResponse(recommandList, todo);
	}

	private Integer resolveCurrentWeek(AppUser user) {
		if (user.getCurrentWeek() != null) {
			return user.getCurrentWeek();
		}
		return pregnancyInfoCalculator.calculate(user.getDueDate()).currentWeek();
	}

	private Character validateCheckYn(String checkYn) {
		if ("Y".equals(checkYn) || "N".equals(checkYn)) {
			return checkYn.charAt(0);
		}
		throw new InvalidRequestException("checkYn must be Y or N");
	}

	private RecommandListResponse toResponse(RecommandList recommandList, Todo todo) {
		return new RecommandListResponse(
				recommandList.getRecommandListId(),
				recommandList.getGroupId(),
				recommandList.getUserId(),
				recommandList.getTodoId(),
				recommandList.getCurrentWeek(),
				recommandList.getCheckYn() == null ? null : recommandList.getCheckYn().toString(),
				recommandList.getCreatedAt(),
				todo.getTodoName(),
				todo.getDescription()
		);
	}
}
