package com.example.thinq_parent.mombti.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "mombti_question")
public class MomBtiQuestion {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "question_id")
	private Integer questionId;

	@Column(name = "question_text", nullable = false)
	private String questionText;

	@Column(nullable = false, length = 10)
	private String dimension;

	@Column(name = "display_order", nullable = false)
	private Integer displayOrder;

	@Column(name = "is_active", nullable = false)
	private Character isActive;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "target_trait")
	private String targetTrait;

	@Column(name = "reverse_trait")
	private String reverseTrait;

	protected MomBtiQuestion() {
	}

	public Integer getQuestionId() {
		return questionId;
	}

	public String getQuestionText() {
		return questionText;
	}

	public String getDimension() {
		return dimension;
	}

	public Integer getDisplayOrder() {
		return displayOrder;
	}

	public Character getIsActive() {
		return isActive;
	}

	public String getTargetTrait() {
		return targetTrait;
	}

	public String getReverseTrait() {
		return reverseTrait;
	}
}
