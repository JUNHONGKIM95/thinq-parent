package com.example.thinq_parent.appliance.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_appliance_control")
public class UserApplianceControl {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_appliance_control_id")
	private Long userApplianceControlId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "appliance_master_id", nullable = false)
	private Long applianceMasterId;

	@Column(name = "routine_id", nullable = false)
	private Long routineId;

	@Column(name = "routine_activated", nullable = false)
	private Boolean routineActivated = false;

	@Column(name = "alert_sound_enabled", nullable = false)
	private Boolean alertSoundEnabled = true;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	protected UserApplianceControl() {
	}

	public UserApplianceControl(Integer userId, Long applianceMasterId, Long routineId) {
		this.userId = userId;
		this.applianceMasterId = applianceMasterId;
		this.routineId = routineId;
		this.routineActivated = true;
		this.alertSoundEnabled = true;
	}

	public void updateAlertSound(Boolean enabled) {
		this.alertSoundEnabled = enabled;
	}

	public void updateRoutine(Long routineId) {
		this.routineId = routineId;
	}

	public void updateRoutineActivated(Boolean activated) {
		this.routineActivated = activated;
	}

	public Long getUserApplianceControlId() {
		return userApplianceControlId;
	}

	public Integer getUserId() {
		return userId;
	}

	public Long getApplianceMasterId() {
		return applianceMasterId;
	}

	public Long getRoutineId() {
		return routineId;
	}

	public Boolean getRoutineActivated() {
		return routineActivated;
	}

	public Boolean getAlertSoundEnabled() {
		return alertSoundEnabled;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
