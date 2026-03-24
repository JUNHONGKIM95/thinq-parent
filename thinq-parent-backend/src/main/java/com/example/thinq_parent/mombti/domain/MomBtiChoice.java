package com.example.thinq_parent.mombti.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "mombti_choice")
public class MomBtiChoice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "choice_id")
	private Integer choiceId;

	@Column(name = "question_id", nullable = false)
	private Integer questionId;

	@Column(name = "choice_text", nullable = false)
	private String choiceText;

	@Column(name = "target_trait", nullable = false)
	private String targetTrait;

	@Column(name = "score_value", nullable = false)
	private Integer scoreValue;

	@Column(name = "display_order", nullable = false)
	private Integer displayOrder;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	protected MomBtiChoice() {
	}

	public Integer getChoiceId() {
		return choiceId;
	}

	public Integer getQuestionId() {
		return questionId;
	}

	public String getChoiceText() {
		return choiceText;
	}

	public String getTargetTrait() {
		return targetTrait;
	}

	public Integer getScoreValue() {
		return scoreValue;
	}

	public Integer getDisplayOrder() {
		return displayOrder;
	}
}
