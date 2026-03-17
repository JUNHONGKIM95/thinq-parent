package com.example.thinq_parent.cheermessage.dto;

import java.time.LocalDateTime;

public record CheerMessageResponse(
		Integer messageId,
		Integer groupId,
		Integer senderId,
		String senderUsername,
		String content,
		String reactionEmoji,
		LocalDateTime createdAt
) {
}
