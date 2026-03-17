package com.example.thinq_parent.user.service;

import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class PregnancyInfoCalculator {

	private static final int FULL_TERM_DAYS = 280;

	private final Clock clock;

	public PregnancyInfoCalculator(Clock clock) {
		this.clock = clock;
	}

	public PregnancyCountdownInfo calculate(LocalDate dueDate) {
		if (dueDate == null) {
			return new PregnancyCountdownInfo(null, null);
		}

		LocalDate today = LocalDate.now(clock);
		long daysUntilDueDate = ChronoUnit.DAYS.between(today, dueDate);
		int currentWeek = calculateCurrentWeek(daysUntilDueDate);
		return new PregnancyCountdownInfo(daysUntilDueDate, currentWeek);
	}

	private int calculateCurrentWeek(long daysUntilDueDate) {
		long elapsedPregnancyDays = FULL_TERM_DAYS - daysUntilDueDate;

		if (elapsedPregnancyDays <= 0) {
			return 0;
		}

		return (int) ((elapsedPregnancyDays - 1) / 7) + 1;
	}
}
