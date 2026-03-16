package com.example.thinq_parent.schedule.repository;

import com.example.thinq_parent.schedule.domain.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ScheduleRepository extends JpaRepository<Schedule, Integer> {

	List<Schedule> findByUserIdOrderByCreatedAtDesc(Integer userId);

	List<Schedule> findByGroupIdOrderByCreatedAtDesc(Integer groupId);

	Optional<Schedule> findFirstByUserIdAndEndDateIsNotNullOrderByCreatedAtDesc(Integer userId);
}
