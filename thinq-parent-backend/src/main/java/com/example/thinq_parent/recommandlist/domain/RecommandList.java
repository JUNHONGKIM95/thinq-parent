package com.example.thinq_parent.recommandlist.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "recommand_list")
public class RecommandList {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "recommand_list_id")
	private Integer recommandListId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "todo_id", nullable = false)
	private Integer todoId;

	@Column(name = "current_week", nullable = false)
	private Integer currentWeek;

	@Column(name = "check_yn", nullable = false)
	private Character checkYn;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected RecommandList() {
	}

	public RecommandList(Integer groupId, Integer userId, Integer todoId, Integer currentWeek, Character checkYn) {
		this.groupId = groupId;
		this.userId = userId;
		this.todoId = todoId;
		this.currentWeek = currentWeek;
		this.checkYn = checkYn;
	}

	public void updateCheckYn(Character checkYn) {
		this.checkYn = checkYn;
	}

	public Integer getRecommandListId() {
		return recommandListId;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public Integer getUserId() {
		return userId;
	}

	public Integer getTodoId() {
		return todoId;
	}

	public Integer getCurrentWeek() {
		return currentWeek;
	}

	public Character getCheckYn() {
		return checkYn;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
