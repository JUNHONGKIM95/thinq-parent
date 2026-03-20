package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.schedule.domain.Schedule;
import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.SchedulePatchRequest;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.repository.ScheduleRepository;
import com.example.thinq_parent.todo.domain.Todo;
import com.example.thinq_parent.todo.dto.TodoScheduleCreateRequest;
import com.example.thinq_parent.todo.repository.TodoRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

	private static final String TYPE_BABY = "\uC544\uAE30";
	private static final String TYPE_FAMILY = "\uAC00\uC871";
	private static final String TYPE_WORK = "\uC77C";
	private static final String TYPE_PERSONAL = "\uAC1C\uC778";
	private static final String TYPE_IMPORTANT = "\uC911\uC694";
	private static final String TYPE_ETC = "\uAE30\uD0C0";
	private static final String DUE_DATE_TITLE = "\uCD9C\uC0B0 \uC608\uC815\uC77C";

	private static final Set<String> SCHEDULE_TYPES = Set.of(
			TYPE_BABY,
			TYPE_FAMILY,
			TYPE_WORK,
			TYPE_PERSONAL,
			TYPE_IMPORTANT,
			TYPE_ETC
	);

	private final ScheduleRepository scheduleRepository;
	private final FamilyGroupRepository familyGroupRepository;
	private final UserRepository userRepository;
	private final TodoRepository todoRepository;

	public ScheduleServiceImpl(
			ScheduleRepository scheduleRepository,
			FamilyGroupRepository familyGroupRepository,
			UserRepository userRepository,
			TodoRepository todoRepository
	) {
		this.scheduleRepository = scheduleRepository;
		this.familyGroupRepository = familyGroupRepository;
		this.userRepository = userRepository;
		this.todoRepository = todoRepository;
	}

	@Override
	@Transactional
	public ScheduleResponse create(ScheduleCreateRequest request) {
		AppUser user = validateGroupMember(request.groupId(), request.userId());
		validateScheduleType(request.scheduleType());

		Schedule schedule = new Schedule(
				request.groupId(),
				user.getUserId(),
				request.title(),
				request.memo(),
				normalizeValue(request.scheduleType()),
				request.scheduleDate(),
				request.time()
		);

		return toResponse(scheduleRepository.save(schedule));
	}

	@Override
	public ScheduleResponse findById(Integer scheduleId) {
		return toResponse(getScheduleById(scheduleId));
	}

	@Override
	public List<ScheduleResponse> findMonthlySchedules(Integer groupId, int year, int month) {
		validateGroupId(groupId);
		LocalDate startDate = LocalDate.of(year, month, 1);
		LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

		return scheduleRepository.findByGroupIdAndScheduleDateBetweenOrderByScheduleDateAscTimeAsc(groupId, startDate, endDate)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public List<ScheduleResponse> findDailySchedules(Integer groupId, LocalDate date) {
		validateGroupId(groupId);
		return scheduleRepository.findByGroupIdAndScheduleDateOrderByTimeAsc(groupId, date)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public ScheduleResponse createFromTodo(TodoScheduleCreateRequest request) {
		AppUser user = validateGroupMember(request.groupId(), request.userId());
		Todo todo = todoRepository.findById(request.todoId())
				.orElseThrow(() -> new ResourceNotFoundException("Todo not found. todoId=" + request.todoId()));

		String memo = request.memo() != null && !request.memo().isBlank()
				? request.memo()
				: todo.getDescription();

		Schedule schedule = new Schedule(
				request.groupId(),
				user.getUserId(),
				todo.getTodoName(),
				memo,
				TYPE_BABY,
				request.scheduleDate(),
				request.time()
		);

		return toResponse(scheduleRepository.save(schedule));
	}

	@Override
	@Transactional
	public ScheduleResponse patch(Integer scheduleId, SchedulePatchRequest request) {
		Schedule schedule = getScheduleById(scheduleId);
		validateEditableSchedule(schedule);

		String title = mergeString(request.title(), schedule.getTitle());
		String memo = mergeNullableString(request.memo(), schedule.getMemo());
		String scheduleType = mergeString(request.scheduleType(), schedule.getScheduleType());
		LocalDate scheduleDate = request.scheduleDate() != null ? request.scheduleDate() : schedule.getScheduleDate();
		LocalTime time = request.time() != null ? request.time() : schedule.getTime();
		validateScheduleType(scheduleType);

		schedule.updateTitle(title);
		schedule.updateMemo(memo);
		schedule.updateScheduleDate(scheduleDate);
		schedule.updateTime(time);
		schedule.updateScheduleType(scheduleType);

		return toResponse(schedule);
	}

	@Override
	@Transactional
	public void delete(Integer scheduleId) {
		Schedule schedule = getScheduleById(scheduleId);
		validateEditableSchedule(schedule);
		scheduleRepository.delete(schedule);
	}

	private Schedule getScheduleById(Integer scheduleId) {
		return scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule not found. scheduleId=" + scheduleId));
	}

	private void validateGroupId(Integer groupId) {
		if (!familyGroupRepository.existsById(groupId)) {
			throw new ResourceNotFoundException("Family group not found. groupId=" + groupId);
		}
	}

	private AppUser validateGroupMember(Integer groupId, Integer userId) {
		validateGroupId(groupId);
		AppUser user = userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
		if (user.getGroupId() == null || !user.getGroupId().equals(groupId)) {
			throw new InvalidRequestException("User is not a member of the requested group. userId=" + userId);
		}
		return user;
	}

	private void validateEditableSchedule(Schedule schedule) {
		if (isAutoDueDateSchedule(schedule)) {
			throw new InvalidRequestException("Due date schedules are managed automatically and cannot be edited manually.");
		}
	}

	private void validateScheduleType(String scheduleType) {
		if (scheduleType == null || scheduleType.isBlank()) {
			throw new InvalidRequestException("scheduleType is required");
		}
		if (!SCHEDULE_TYPES.contains(scheduleType)) {
			throw new InvalidRequestException("scheduleType must be one of \uC544\uAE30, \uAC00\uC871, \uC77C, \uAC1C\uC778, \uC911\uC694, \uAE30\uD0C0");
		}
	}

	private boolean isAutoDueDateSchedule(Schedule schedule) {
		return DUE_DATE_TITLE.equals(schedule.getTitle())
				&& TYPE_IMPORTANT.equals(schedule.getScheduleType());
	}

	private String normalizeValue(String value) {
		return value == null || value.isBlank() ? null : value;
	}

	private String mergeString(String newValue, String currentValue) {
		return newValue == null || newValue.isBlank() ? currentValue : newValue;
	}

	private String mergeNullableString(String newValue, String currentValue) {
		return newValue == null ? currentValue : (newValue.isBlank() ? currentValue : newValue);
	}

	private ScheduleResponse toResponse(Schedule schedule) {
		return new ScheduleResponse(
				schedule.getScheduleId(),
				schedule.getGroupId(),
				schedule.getUserId(),
				schedule.getTitle(),
				schedule.getMemo(),
				schedule.getScheduleType(),
				schedule.getScheduleDate(),
				schedule.getTime(),
				schedule.getCreatedAt()
		);
	}
}
