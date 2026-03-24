package com.example.thinq_parent.user.service;

import com.example.thinq_parent.common.exception.DuplicateResourceException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.service.GroupPregnancySyncService;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.dto.UserBabyNicknameUpdateRequest;
import com.example.thinq_parent.user.dto.UserCreateRequest;
import com.example.thinq_parent.user.dto.UserDueDateUpdateRequest;
import com.example.thinq_parent.user.dto.UserPregnancySummaryResponse;
import com.example.thinq_parent.user.dto.UserResponse;
import com.example.thinq_parent.user.dto.UserUpdateRequest;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final PregnancyInfoCalculator pregnancyInfoCalculator;
	private final GroupPregnancySyncService groupPregnancySyncService;

	public UserServiceImpl(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			PregnancyInfoCalculator pregnancyInfoCalculator,
			GroupPregnancySyncService groupPregnancySyncService
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.pregnancyInfoCalculator = pregnancyInfoCalculator;
		this.groupPregnancySyncService = groupPregnancySyncService;
	}

	@Override
	@Transactional
	public UserResponse create(UserCreateRequest request) {
		validateDuplicateEmail(request.email());
		Integer currentWeek = pregnancyInfoCalculator.calculate(request.dueDate()).currentWeek();

		AppUser user = new AppUser(
				request.email(),
				passwordEncoder.encode(request.password()),
				request.username(),
				request.babyNickname(),
				request.role(),
				request.dueDate(),
				currentWeek
		);

		return UserResponse.from(userRepository.save(user));
	}

	@Override
	public List<UserResponse> findAll() {
		return userRepository.findAll()
				.stream()
				.map(UserResponse::from)
				.toList();
	}

	@Override
	public UserResponse findById(Integer userId) {
		return UserResponse.from(getUserById(userId));
	}

	@Override
	public UserPregnancySummaryResponse getPregnancySummary(Integer userId) {
		AppUser user = getUserById(userId);
		PregnancyCountdownInfo countdown = pregnancyInfoCalculator.calculate(user.getDueDate());

		return new UserPregnancySummaryResponse(
				user.getUserId(),
				user.getUsername(),
				user.getBabyNickname(),
				user.getDueDate(),
				countdown.daysUntilDueDate(),
				user.getCurrentWeek()
		);
	}

	@Override
	@Transactional
	public UserResponse update(Integer userId, UserUpdateRequest request) {
		AppUser user = getUserById(userId);
		String email = mergeString(request.email(), user.getEmail());
		String password = mergePassword(request.password(), user.getPassword());
		String username = mergeString(request.username(), user.getUsername());
		String babyNickname = mergeString(request.babyNickname(), user.getBabyNickname());
		String role = mergeString(request.role(), user.getRole());
		var dueDate = request.dueDate() != null ? request.dueDate() : user.getDueDate();
		Integer currentWeek = pregnancyInfoCalculator.calculate(dueDate).currentWeek();

		validateDuplicateEmail(email, userId);

		user.update(
				email,
				password,
				username,
				babyNickname,
				role,
				dueDate,
				currentWeek
		);
		groupPregnancySyncService.syncUserGroupsPregnancyInfo(user);

		return UserResponse.from(user);
	}

	@Override
	@Transactional
	public UserResponse updateDueDate(Integer userId, UserDueDateUpdateRequest request) {
		AppUser user = getUserById(userId);
		Integer currentWeek = pregnancyInfoCalculator.calculate(request.dueDate()).currentWeek();

		user.update(
				user.getEmail(),
				user.getPassword(),
				user.getUsername(),
				user.getBabyNickname(),
				user.getRole(),
				request.dueDate(),
				currentWeek
		);
		groupPregnancySyncService.syncUserGroupsPregnancyInfo(user);

		return UserResponse.from(user);
	}

	@Override
	@Transactional
	public UserResponse updateBabyNickname(Integer userId, UserBabyNicknameUpdateRequest request) {
		AppUser user = getUserById(userId);

		user.update(
				user.getEmail(),
				user.getPassword(),
				user.getUsername(),
				request.babyNickname(),
				user.getRole(),
				user.getDueDate(),
				user.getCurrentWeek()
		);
		groupPregnancySyncService.syncUserGroupsPregnancyInfo(user);

		return UserResponse.from(user);
	}

	@Override
	@Transactional
	public void delete(Integer userId) {
		userRepository.delete(getUserById(userId));
	}

	private AppUser getUserById(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private void validateDuplicateEmail(String email) {
		if (userRepository.existsByEmail(email)) {
			throw new DuplicateResourceException("Email already exists: " + email);
		}
	}

	private void validateDuplicateEmail(String email, Integer userId) {
		if (userRepository.existsByEmailAndUserIdNot(email, userId)) {
			throw new DuplicateResourceException("Email already exists: " + email);
		}
	}

	private String mergeString(String newValue, String currentValue) {
		if (newValue == null || newValue.isBlank()) {
			return currentValue;
		}
		return newValue;
	}

	private String mergePassword(String rawPassword, String currentEncodedPassword) {
		if (rawPassword == null || rawPassword.isBlank()) {
			return currentEncodedPassword;
		}
		return passwordEncoder.encode(rawPassword);
	}
}
