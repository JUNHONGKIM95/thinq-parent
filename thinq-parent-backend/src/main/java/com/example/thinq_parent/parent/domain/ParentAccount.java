package com.example.thinq_parent.parent.domain;

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
@Table(name = "parents")
public class ParentAccount {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, length = 50)
	private String parentName;

	@Column(nullable = false, length = 100)
	private String email;

	@Column(nullable = false, length = 20)
	private String phoneNumber;

	@Column(nullable = false, length = 50)
	private String childName;

	@Column(nullable = false, length = 30)
	private String relationship;

	@CreationTimestamp
	@Column(nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(nullable = false)
	private LocalDateTime updatedAt;

	protected ParentAccount() {
	}

	public ParentAccount(String parentName, String email, String phoneNumber, String childName, String relationship) {
		this.parentName = parentName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.childName = childName;
		this.relationship = relationship;
	}

	public void update(String parentName, String email, String phoneNumber, String childName, String relationship) {
		this.parentName = parentName;
		this.email = email;
		this.phoneNumber = phoneNumber;
		this.childName = childName;
		this.relationship = relationship;
	}

	public Long getId() {
		return id;
	}

	public String getParentName() {
		return parentName;
	}

	public String getEmail() {
		return email;
	}

	public String getPhoneNumber() {
		return phoneNumber;
	}

	public String getChildName() {
		return childName;
	}

	public String getRelationship() {
		return relationship;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
