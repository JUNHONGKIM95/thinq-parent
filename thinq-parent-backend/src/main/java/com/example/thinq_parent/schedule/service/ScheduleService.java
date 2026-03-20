package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.SchedulePatchRequest;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.todo.dto.TodoScheduleCreateRequest;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleService {

	ScheduleResponse create(ScheduleCreateRequest request);

	ScheduleResponse findById(Integer scheduleId);

	List<ScheduleResponse> findMonthlySchedules(Integer groupId, int year, int month);

	List<ScheduleResponse> findDailySchedules(Integer groupId, LocalDate date);

	ScheduleResponse createFromTodo(TodoScheduleCreateRequest request);

	ScheduleResponse patch(Integer scheduleId, SchedulePatchRequest request);

	void delete(Integer scheduleId);
}
