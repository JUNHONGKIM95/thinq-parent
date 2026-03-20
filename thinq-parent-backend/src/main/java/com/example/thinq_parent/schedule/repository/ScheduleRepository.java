package com.example.thinq_parent.schedule.repository;

import com.example.thinq_parent.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

	List<Schedule> findByGroupIdAndScheduleDateBetweenOrderByScheduleDateAscTimeAsc(
			Integer groupId,
			LocalDate startDate,
			LocalDate endDate
	);

	List<Schedule> findByGroupIdAndScheduleDateOrderByTimeAsc(Integer groupId, LocalDate scheduleDate);

	List<Schedule> findByGroupIdAndTitleAndScheduleTypeOrderByCreatedAtAsc(
			Integer groupId,
			String title,
			String scheduleType
	);
}
