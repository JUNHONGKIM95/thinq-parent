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
@Table(name = "appliance_master")
public class ApplianceMaster {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "appliance_master_id")
	private Long applianceMasterId;

	@Column(name = "appliance_code", nullable = false, unique = true, length = 30)
	private String applianceCode;

	@Column(name = "appliance_name", nullable = false, length = 100)
	private String applianceName;

	@Column(name = "appliance_description")
	private String applianceDescription;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected ApplianceMaster() {
	}

	public Long getApplianceMasterId() {
		return applianceMasterId;
	}

	public String getApplianceCode() {
		return applianceCode;
	}

	public String getApplianceName() {
		return applianceName;
	}

	public String getApplianceDescription() {
		return applianceDescription;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
