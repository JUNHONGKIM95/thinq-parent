package com.example.thinq_parent.familygroup.dto;

import java.time.LocalDateTime;

public record FamilyGroupMemberResponse(
		Integer userId,
		String username,
		String email,
		LocalDateTime joinedAt
) {
}
