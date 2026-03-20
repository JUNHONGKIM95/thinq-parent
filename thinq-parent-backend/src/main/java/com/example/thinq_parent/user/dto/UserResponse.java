package com.example.thinq_parent.user.dto;

import com.example.thinq_parent.user.domain.AppUser;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record UserResponse(
		Integer userId,
		String email,
		String username,
		String babyNickname,
		String role,
		Integer groupId,
		LocalDate dueDate,
		Integer currentWeek,
		LocalDateTime createdAt
) {

	public static UserResponse from(AppUser user) {
		return new UserResponse(
				user.getUserId(),
				user.getEmail(),
				user.getUsername(),
				user.getBabyNickname(),
				user.getRole(),
				user.getGroupId(),
				user.getDueDate(),
				user.getCurrentWeek(),
				user.getCreatedAt()
		);
	}
}
