package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.common.exception.DuplicateResourceException;
import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.schedule.domain.Schedule;
import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.ScheduleDdayInfo;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.dto.ScheduleUpdateRequest;
import com.example.thinq_parent.schedule.repository.ScheduleRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

	private final ScheduleRepository scheduleRepository;
	private final FamilyGroupRepository familyGroupRepository;
	private final UserRepository userRepository;
	private final ScheduleDdayCalculator scheduleDdayCalculator;
	private final Clock clock;

	public ScheduleServiceImpl(
			ScheduleRepository scheduleRepository,
			FamilyGroupRepository familyGroupRepository,
			UserRepository userRepository,
			ScheduleDdayCalculator scheduleDdayCalculator,
			Clock clock
	) {
		this.scheduleRepository = scheduleRepository;
		this.familyGroupRepository = familyGroupRepository;
		this.userRepository = userRepository;
		this.scheduleDdayCalculator = scheduleDdayCalculator;
		this.clock = clock;
	}

	@Override
	@Transactional
	public ScheduleResponse create(ScheduleCreateRequest request) {
		validateScheduleDates(request.startDate(), request.endDate());
		validateScheduleId(request.scheduleId());
		validateGroupId(request.groupId());
		AppUser user = getUserById(request.userId());

		LocalDateTime startDate = request.startDate() != null ? request.startDate() : LocalDateTime.now(clock);
		// startDate가 비어 있으면 생성 시각을 시작 시각으로 저장해서 화면에서 바로 정렬 기준으로 쓸 수 있게 한다.
		Schedule schedule = new Schedule(
				request.scheduleId(),
				request.groupId(),
				request.userId(),
				request.title(),
				startDate,
				request.endDate()
		);

		Schedule savedSchedule = scheduleRepository.save(schedule);
		syncUserDueDate(user, request.endDate().toLocalDate());
		return toResponse(savedSchedule);
	}

	@Override
	public List<ScheduleResponse> findAll() {
		return scheduleRepository.findAll()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public ScheduleResponse findById(Integer scheduleId) {
		return toResponse(getScheduleById(scheduleId));
	}

	@Override
	public List<ScheduleResponse> findByUserId(Integer userId) {
		return scheduleRepository.findByUserIdOrderByCreatedAtDesc(userId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public List<ScheduleResponse> findByGroupId(Integer groupId) {
		return scheduleRepository.findByGroupIdOrderByCreatedAtDesc(groupId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public ScheduleResponse findLatestDueDateByUserId(Integer userId) {
		getUserById(userId);
		Schedule schedule = scheduleRepository.findFirstByUserIdAndEndDateIsNotNullOrderByCreatedAtDesc(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule not found for userId=" + userId));
		return toResponse(schedule);
	}

	@Override
	@Transactional
	public ScheduleResponse update(Integer scheduleId, ScheduleUpdateRequest request) {
		validateScheduleDates(request.startDate(), request.endDate());
		Schedule schedule = getScheduleById(scheduleId);
		validateGroupId(request.groupId());
		AppUser user = getUserById(request.userId());

		LocalDateTime startDate = request.startDate() != null ? request.startDate() : schedule.getStartDate();
		schedule.update(
				request.groupId(),
				request.userId(),
				request.title(),
				startDate,
				request.endDate()
		);

		syncUserDueDate(user, request.endDate().toLocalDate());
		return toResponse(schedule);
	}

	@Override
	@Transactional
	public void delete(Integer scheduleId) {
		Schedule schedule = getScheduleById(scheduleId);
		Integer userId = schedule.getUserId();

		scheduleRepository.delete(schedule);
		refreshUserDueDate(userId);
	}

	private Schedule getScheduleById(Integer scheduleId) {
		return scheduleRepository.findById(scheduleId)
				.orElseThrow(() -> new ResourceNotFoundException("Schedule not found. scheduleId=" + scheduleId));
	}

	private AppUser getUserById(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private void validateScheduleId(Integer scheduleId) {
		if (scheduleRepository.existsById(scheduleId)) {
			throw new DuplicateResourceException("Schedule already exists. scheduleId=" + scheduleId);
		}
	}

	private void validateScheduleDates(LocalDateTime startDate, LocalDateTime endDate) {
		if (startDate != null && endDate.isBefore(startDate)) {
			throw new InvalidRequestException("endDate must be after startDate");
		}
	}

	private void validateGroupId(Integer groupId) {
		// DB 외래키 에러까지 가지 않도록 schedules 저장 전에 family_groups 존재 여부를 먼저 확인한다.
		if (!familyGroupRepository.existsById(groupId)) {
			throw new ResourceNotFoundException("Family group not found. groupId=" + groupId);
		}
	}

	private ScheduleResponse toResponse(Schedule schedule) {
		ScheduleDdayInfo ddayInfo = scheduleDdayCalculator.calculate(schedule.getEndDate());
		LocalDate dueDate = schedule.getEndDate() == null ? null : schedule.getEndDate().toLocalDate();

		return new ScheduleResponse(
				schedule.getScheduleId(),
				schedule.getGroupId(),
				schedule.getUserId(),
				schedule.getTitle(),
				schedule.getStartDate(),
				schedule.getEndDate(),
				schedule.getCreatedAt(),
				dueDate,
				ddayInfo.daysFromToday(),
				ddayInfo.dDay()
		);
	}

	private void syncUserDueDate(AppUser user, LocalDate dueDate) {
		// 사용자 테이블의 due_date도 같이 맞춰 두면 사용자 조회 API에서도 동일한 출산 예정일을 사용할 수 있다.
		user.updateDueDate(dueDate);
	}

	private void refreshUserDueDate(Integer userId) {
		AppUser user = getUserById(userId);
		LocalDate dueDate = scheduleRepository.findFirstByUserIdAndEndDateIsNotNullOrderByCreatedAtDesc(userId)
				.map(Schedule::getEndDate)
				.map(LocalDateTime::toLocalDate)
				.orElse(null);
		user.updateDueDate(dueDate);
	}
}
