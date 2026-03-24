package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.schedule.domain.Schedule;
import com.example.thinq_parent.schedule.repository.ScheduleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class DueDateScheduleSyncService {

	private static final String DUE_DATE_TITLE = "\uCD9C\uC0B0 \uC608\uC815\uC77C";
	private static final LocalTime DUE_DATE_TIME = LocalTime.MIDNIGHT;
	private static final String DUE_DATE_SCHEDULE_TYPE = "\uC911\uC694";

	private final ScheduleRepository scheduleRepository;

	public DueDateScheduleSyncService(ScheduleRepository scheduleRepository) {
		this.scheduleRepository = scheduleRepository;
	}

	@Transactional
	public void sync(Integer groupId, Integer userId, LocalDate dueDate) {
		if (groupId == null) {
			return;
		}

		List<Schedule> dueDateSchedules = scheduleRepository.findByGroupIdAndTitleAndScheduleTypeOrderByCreatedAtAsc(
				groupId,
				DUE_DATE_TITLE,
				DUE_DATE_SCHEDULE_TYPE
		);
		if (dueDate == null) {
			if (!dueDateSchedules.isEmpty()) {
				scheduleRepository.deleteAll(dueDateSchedules);
			}
			return;
		}

		if (!dueDateSchedules.isEmpty()) {
			Schedule schedule = dueDateSchedules.get(0);
			schedule.update(
					groupId,
					userId,
					DUE_DATE_TITLE,
					null,
					DUE_DATE_SCHEDULE_TYPE,
					dueDate,
					DUE_DATE_TIME
			);
			if (dueDateSchedules.size() > 1) {
				scheduleRepository.deleteAll(dueDateSchedules.subList(1, dueDateSchedules.size()));
			}
			return;
		}

		if (userId == null) {
			return;
		}

		Schedule schedule = new Schedule(
				groupId,
				userId,
				DUE_DATE_TITLE,
				null,
				DUE_DATE_SCHEDULE_TYPE,
				dueDate,
				DUE_DATE_TIME
		);
		scheduleRepository.save(schedule);
	}
}
