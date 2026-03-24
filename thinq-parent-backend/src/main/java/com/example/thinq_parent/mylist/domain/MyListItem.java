package com.example.thinq_parent.mylist.domain;

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
@Table(name = "my_list")
public class MyListItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "my_list_id")
	private Integer myListId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(nullable = false, length = 200)
	private String title;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "check_yn", nullable = false)
	private Character checkYn;

	@Column(name = "my_list_date", nullable = false)
	private LocalDate myListDate;

	protected MyListItem() {
	}

	public MyListItem(Integer groupId, Integer userId, String title, Character checkYn, LocalDate myListDate) {
		this.groupId = groupId;
		this.userId = userId;
		this.title = title;
		this.checkYn = checkYn;
		this.myListDate = myListDate;
	}

	public void updateTitle(String title) {
		this.title = title;
	}

	public void updateCheckYn(Character checkYn) {
		this.checkYn = checkYn;
	}

	public Integer getMyListId() {
		return myListId;
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

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public Character getCheckYn() {
		return checkYn;
	}

	public LocalDate getMyListDate() {
		return myListDate;
	}
}
