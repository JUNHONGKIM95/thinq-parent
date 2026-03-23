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
@Table(name = "routine_action")
public class RoutineAction {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "routine_action_id")
	private Long routineActionId;

	@Column(name = "routine_id", nullable = false)
	private Long routineId;

	@Column(name = "appliance_master_id", nullable = false)
	private Long applianceMasterId;

	@Column(name = "sequence_no", nullable = false)
	private Integer sequenceNo;

	@Column(name = "action_title", nullable = false, length = 100)
	private String actionTitle;

	@Column(name = "action_description")
	private String actionDescription;

	@Column(name = "target_power_state", length = 20)
	private String targetPowerState;

	@Column(name = "target_mode", length = 50)
	private String targetMode;

	@Column(name = "target_alert_sound", length = 20)
	private String targetAlertSound;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected RoutineAction() {
	}

	public Long getRoutineActionId() {
		return routineActionId;
	}

	public Long getRoutineId() {
		return routineId;
	}

	public Long getApplianceMasterId() {
		return applianceMasterId;
	}

	public Integer getSequenceNo() {
		return sequenceNo;
	}

	public String getActionTitle() {
		return actionTitle;
	}

	public String getActionDescription() {
		return actionDescription;
	}

	public String getTargetPowerState() {
		return targetPowerState;
	}

	public String getTargetMode() {
		return targetMode;
	}

	public String getTargetAlertSound() {
		return targetAlertSound;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
