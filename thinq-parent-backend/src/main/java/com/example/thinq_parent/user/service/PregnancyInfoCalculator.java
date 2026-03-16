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
			return new PregnancyCountdownInfo(null, null, null, null);
		}

		LocalDate today = LocalDate.now(clock);
		long daysUntilDueDate = ChronoUnit.DAYS.between(today, dueDate);
		int currentWeek = calculateCurrentWeek(daysUntilDueDate);

		// 홈 화면에서는 "102일 전" 같은 문구가 필요해서 D-Day 표기와 별도로 화면용 텍스트를 같이 만든다.
		if (daysUntilDueDate > 0) {
			return new PregnancyCountdownInfo(daysUntilDueDate, daysUntilDueDate + "일 전", "D-" + daysUntilDueDate, currentWeek);
		}
		if (daysUntilDueDate == 0) {
			return new PregnancyCountdownInfo(0L, "오늘", "D-Day", currentWeek);
		}

		long overdueDays = Math.abs(daysUntilDueDate);
		return new PregnancyCountdownInfo(daysUntilDueDate, overdueDays + "일 지남", "D+" + overdueDays, currentWeek);
	}

	private int calculateCurrentWeek(long daysUntilDueDate) {
		long elapsedPregnancyDays = FULL_TERM_DAYS - daysUntilDueDate;

		if (elapsedPregnancyDays <= 0) {
			return 0;
		}

		return (int) ((elapsedPregnancyDays - 1) / 7) + 1;
	}
}
