package com.example.thinq_parent.mombti.dto;

public record MomBtiResultProfileResponse(
		String resultType,
		String title,
		String subtitle,
		String summary,
		String content,
		String imageUrl
) {
}
