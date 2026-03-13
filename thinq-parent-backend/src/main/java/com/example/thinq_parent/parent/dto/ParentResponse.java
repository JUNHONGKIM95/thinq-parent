package com.example.thinq_parent.parent.dto;

import com.example.thinq_parent.parent.domain.ParentAccount;

import java.time.LocalDateTime;

public record ParentResponse(
		Long id,
		String parentName,
		String email,
		String phoneNumber,
		String childName,
		String relationship,
		LocalDateTime createdAt,
		LocalDateTime updatedAt
) {

	public static ParentResponse from(ParentAccount parentAccount) {
		return new ParentResponse(
				parentAccount.getId(),
				parentAccount.getParentName(),
				parentAccount.getEmail(),
				parentAccount.getPhoneNumber(),
				parentAccount.getChildName(),
				parentAccount.getRelationship(),
				parentAccount.getCreatedAt(),
				parentAccount.getUpdatedAt()
		);
	}
}
