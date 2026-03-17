package com.example.thinq_parent.user.service;

import com.example.thinq_parent.common.exception.DuplicateResourceException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.dto.UserCreateRequest;
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

	public UserServiceImpl(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			PregnancyInfoCalculator pregnancyInfoCalculator
	) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.pregnancyInfoCalculator = pregnancyInfoCalculator;
	}

	@Override
	@Transactional
	public UserResponse create(UserCreateRequest request) {
		validateDuplicateEmail(request.email());

		AppUser user = new AppUser(
				request.email(),
				passwordEncoder.encode(request.password()),
				request.username(),
				request.babyNickname(),
				request.role(),
				request.dueDate()
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
				countdown.currentWeek()
		);
	}

	@Override
	@Transactional
	public UserResponse update(Integer userId, UserUpdateRequest request) {
		AppUser user = getUserById(userId);
		validateDuplicateEmail(request.email(), userId);

		user.update(
				request.email(),
				passwordEncoder.encode(request.password()),
				request.username(),
				request.babyNickname(),
				request.role(),
				request.dueDate()
		);

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
}
