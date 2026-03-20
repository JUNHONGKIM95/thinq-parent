package com.example.thinq_parent.community.domain;

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
@Table(name = "boards")
public class Board {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "board_id")
	private Integer boardId;

	@Column(name = "board_code", nullable = false, unique = true, length = 30)
	private String boardCode;

	@Column(name = "board_name", nullable = false, length = 100)
	private String boardName;

	@Column
	private String description;

	@Column(name = "sort_order", nullable = false)
	private Integer sortOrder;

	@Column(name = "is_active", nullable = false)
	private Boolean isActive;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	@UpdateTimestamp
	@Column(name = "updated_at")
	private LocalDateTime updatedAt;

	protected Board() {
	}

	public Integer getBoardId() {
		return boardId;
	}

	public String getBoardCode() {
		return boardCode;
	}

	public String getBoardName() {
		return boardName;
	}

	public String getDescription() {
		return description;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public Boolean getIsActive() {
		return isActive;
	}
}
