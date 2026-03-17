package com.example.thinq_parent.familygroup.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "family_groups")
public class FamilyGroup {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "group_id")
	private Integer groupId;

	@Column(name = "group_name", nullable = false, length = 100)
	private String groupName;

	@Column(name = "invite_code", unique = true, length = 50)
	private String inviteCode;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "user_id")
	private Integer userId;

	protected FamilyGroup() {
	}

	public FamilyGroup(String groupName, String inviteCode, Integer userId) {
		this.groupName = groupName;
		this.inviteCode = inviteCode;
		this.userId = userId;
	}

	public void updateGroupName(String groupName) {
		this.groupName = groupName;
	}

	public void updateInviteCode(String inviteCode) {
		this.inviteCode = inviteCode;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public String getGroupName() {
		return groupName;
	}

	public String getInviteCode() {
		return inviteCode;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public Integer getUserId() {
		return userId;
	}
}
