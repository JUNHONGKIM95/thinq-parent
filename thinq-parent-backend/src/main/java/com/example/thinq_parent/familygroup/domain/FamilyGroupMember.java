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
@Table(name = "family_members")
public class FamilyGroupMember {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "member_id")
	private Integer memberId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@CreationTimestamp
	@Column(name = "joined_at", updatable = false)
	private LocalDateTime joinedAt;

	protected FamilyGroupMember() {
	}

	public FamilyGroupMember(Integer groupId, Integer userId) {
		this.groupId = groupId;
		this.userId = userId;
	}

	public Integer getMemberId() {
		return memberId;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public Integer getUserId() {
		return userId;
	}

	public LocalDateTime getJoinedAt() {
		return joinedAt;
	}
}
