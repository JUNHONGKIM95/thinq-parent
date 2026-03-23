package com.example.thinq_parent.user.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class AppUser {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_id")
	private Integer userId;

	@Column(nullable = false, unique = true, length = 100)
	private String email;

	@Column(nullable = false, length = 255)
	private String password;

	@Column(nullable = false, length = 50)
	private String username;

	@Column(name = "baby_nickname", length = 50)
	private String babyNickname;

	@Column(length = 20)
	private String role;

	@Column(name = "group_id")
	private Integer groupId;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "due_date")
	private LocalDate dueDate;

	protected AppUser() {
	}

	public AppUser(String email, String password, String username, String babyNickname, String role, LocalDate dueDate) {
		this.email = email;
		this.password = password;
		this.username = username;
		this.babyNickname = babyNickname;
		this.role = role;
		this.dueDate = dueDate;
	}

	public void update(String email, String password, String username, String babyNickname, String role, LocalDate dueDate) {
		this.email = email;
		this.password = password;
		this.username = username;
		this.babyNickname = babyNickname;
		this.role = role;
		this.dueDate = dueDate;
	}

	public void updateDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public void updatePregnancyInfo(String babyNickname, LocalDate dueDate) {
		this.babyNickname = babyNickname;
		this.dueDate = dueDate;
	}

	public Integer getUserId() {
		return userId;
	}

	public String getEmail() {
		return email;
	}

	public String getPassword() {
		return password;
	}

	public String getUsername() {
		return username;
	}

	public String getBabyNickname() {
		return babyNickname;
	}

	public String getRole() {
		return role;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}
}
