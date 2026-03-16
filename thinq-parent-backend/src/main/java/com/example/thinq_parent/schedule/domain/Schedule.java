package com.example.thinq_parent.schedule.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "schedules")
public class Schedule {

	@Id
	@Column(name = "schedule_id")
	// 스키마 정의에 auto_increment가 없어서 schedule_id는 요청값을 그대로 사용한다.
	private Integer scheduleId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(nullable = false, length = 200)
	private String title;

	@Column(name = "start_date")
	private LocalDateTime startDate;

	@Column(name = "end_date")
	private LocalDateTime endDate;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected Schedule() {
	}

	public Schedule(
			Integer scheduleId,
			Integer groupId,
			Integer userId,
			String title,
			LocalDateTime startDate,
			LocalDateTime endDate
	) {
		this.scheduleId = scheduleId;
		this.groupId = groupId;
		this.userId = userId;
		this.title = title;
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public void update(Integer groupId, Integer userId, String title, LocalDateTime startDate, LocalDateTime endDate) {
		this.groupId = groupId;
		this.userId = userId;
		this.title = title;
		this.startDate = startDate;
		this.endDate = endDate;
	}

	public Integer getScheduleId() {
		return scheduleId;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public Integer getUserId() {
		return userId;
	}

	public String getTitle() {
		return title;
	}

	public LocalDateTime getStartDate() {
		return startDate;
	}

	public LocalDateTime getEndDate() {
		return endDate;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
