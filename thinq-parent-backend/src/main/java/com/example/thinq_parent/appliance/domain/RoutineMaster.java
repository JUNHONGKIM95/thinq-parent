package com.example.thinq_parent.appliance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "routine_master")
public class RoutineMaster {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "routine_id")
	private Long routineId;

	@Column(name = "routine_code", nullable = false, unique = true, length = 30)
	private String routineCode;

	@Column(name = "pregnancy_stage", nullable = false, unique = true, length = 20)
	private String pregnancyStage;

	@Column(name = "routine_name", nullable = false, length = 100)
	private String routineName;

	@Column(name = "routine_description")
	private String routineDescription;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected RoutineMaster() {
	}

	public Long getRoutineId() {
		return routineId;
	}

	public String getRoutineCode() {
		return routineCode;
	}

	public String getPregnancyStage() {
		return pregnancyStage;
	}

	public String getRoutineName() {
		return routineName;
	}

	public String getRoutineDescription() {
		return routineDescription;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
