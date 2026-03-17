package com.example.thinq_parent.familygroup.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class InviteCodeGenerator {

	private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final int CODE_LENGTH = 8;

	private final SecureRandom secureRandom = new SecureRandom();

	public String generate() {
		StringBuilder builder = new StringBuilder(CODE_LENGTH);
		for (int i = 0; i < CODE_LENGTH; i++) {
			int index = secureRandom.nextInt(CHARACTERS.length());
			builder.append(CHARACTERS.charAt(index));
		}
		return builder.toString();
	}
}
