package com.example.thinq_parent.familygroup.dto;

import java.time.LocalDateTime;
import java.util.List;

public record FamilyGroupResponse(
		Integer groupId,
		String groupName,
		String inviteCode,
		Integer ownerUserId,
		LocalDateTime createdAt,
		long memberCount,
		List<FamilyGroupMemberResponse> members
) {
}
