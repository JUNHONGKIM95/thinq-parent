package com.example.thinq_parent.schedule.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "schedules")
public class Schedule {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "schedule_id")
	private Integer scheduleId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(nullable = false, length = 200)
	private String title;

	@Column
	private String memo;

	@Column(name = "schedule_type", length = 20, nullable = false)
	private String scheduleType;

	@Column(name = "schedule_date", nullable = false)
	private LocalDate scheduleDate;

	@Column(name = "\"time\"", nullable = false)
	private LocalTime time;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected Schedule() {
	}

	public Schedule(
			Integer groupId,
			Integer userId,
			String title,
			String memo,
			String scheduleType,
			LocalDate scheduleDate,
			LocalTime time
	) {
		this.groupId = groupId;
		this.userId = userId;
		this.title = title;
		this.memo = memo;
		this.scheduleType = scheduleType;
		this.scheduleDate = scheduleDate;
		this.time = time;
	}

	public void update(
			Integer groupId,
			Integer userId,
			String title,
			String memo,
			String scheduleType,
			LocalDate scheduleDate,
			LocalTime time
	) {
		this.groupId = groupId;
		this.userId = userId;
		this.title = title;
		this.memo = memo;
		this.scheduleType = scheduleType;
		this.scheduleDate = scheduleDate;
		this.time = time;
	}

	public void updateTitle(String title) {
		this.title = title;
	}

	public void updateMemo(String memo) {
		this.memo = memo;
	}

	public void updateScheduleDate(LocalDate scheduleDate) {
		this.scheduleDate = scheduleDate;
	}

	public void updateTime(LocalTime time) {
		this.time = time;
	}

	public void updateScheduleType(String scheduleType) {
		this.scheduleType = scheduleType;
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

	public String getMemo() {
		return memo;
	}

	public String getScheduleType() {
		return scheduleType;
	}

	public LocalDate getScheduleDate() {
		return scheduleDate;
	}

	public LocalTime getTime() {
		return time;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
