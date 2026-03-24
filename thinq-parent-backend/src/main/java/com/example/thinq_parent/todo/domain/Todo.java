package com.example.thinq_parent.todo.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "todos")
public class Todo {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "todo_id")
	private Integer todoId;

	@Column(name = "target_week", nullable = false)
	private Integer targetWeek;

	@Column(name = "todo_name", nullable = false, length = 100)
	private String todoName;

	@Column
	private String description;

	protected Todo() {
	}

	public Integer getTodoId() {
		return todoId;
	}

	public Integer getTargetWeek() {
		return targetWeek;
	}

	public String getTodoName() {
		return todoName;
	}

	public String getDescription() {
		return description;
	}
}
