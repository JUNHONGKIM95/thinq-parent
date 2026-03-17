package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.schedule.dto.ScheduleDdayInfo;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Component
public class ScheduleDdayCalculator {

	private final Clock clock;

	public ScheduleDdayCalculator(Clock clock) {
		this.clock = clock;
	}

	public ScheduleDdayInfo calculate(LocalDateTime endDate) {
		if (endDate == null) {
			return new ScheduleDdayInfo(null, null);
		}

		LocalDate today = LocalDate.now(clock);
		LocalDate dueDate = endDate.toLocalDate();
		long diff = ChronoUnit.DAYS.between(today, dueDate);

		// 오늘을 기준으로 남은 날짜를 계산해 화면에서 바로 D-Day 문자열로 사용할 수 있게 만든다.
		if (diff > 0) {
			return new ScheduleDdayInfo(diff, "D-" + diff);
		}
		if (diff == 0) {
			return new ScheduleDdayInfo(0L, "D-Day");
		}
		return new ScheduleDdayInfo(diff, "D+" + Math.abs(diff));
	}
}
