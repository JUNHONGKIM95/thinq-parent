package com.example.thinq_parent.schedule.service;

import com.example.thinq_parent.schedule.dto.ScheduleCreateRequest;
import com.example.thinq_parent.schedule.dto.ScheduleResponse;
import com.example.thinq_parent.schedule.dto.ScheduleUpdateRequest;

import java.util.List;

public interface ScheduleService {

	ScheduleResponse create(ScheduleCreateRequest request);

	List<ScheduleResponse> findAll();

	ScheduleResponse findById(Integer scheduleId);

	List<ScheduleResponse> findByUserId(Integer userId);

	List<ScheduleResponse> findByGroupId(Integer groupId);

	ScheduleResponse findLatestDueDateByUserId(Integer userId);

	ScheduleResponse update(Integer scheduleId, ScheduleUpdateRequest request);

	void delete(Integer scheduleId);
}
