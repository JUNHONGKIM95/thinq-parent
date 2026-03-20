package com.example.thinq_parent.mombti.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "mombti_answer")
public class MomBtiAnswer {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "answer_id")
	private Integer answerId;

	@Column(name = "attempt_id", nullable = false)
	private Integer attemptId;

	@Column(name = "question_id", nullable = false)
	private Integer questionId;

	@Column(name = "choice_id", nullable = false)
	private Integer choiceId;

	@Column(name = "target_trait", nullable = false)
	private String targetTrait;

	@Column(name = "score_value", nullable = false)
	private Integer scoreValue;

	@CreationTimestamp
	@Column(name = "answered_at", updatable = false)
	private LocalDateTime answeredAt;

	protected MomBtiAnswer() {
	}

	public MomBtiAnswer(Integer attemptId, Integer questionId, Integer choiceId, String targetTrait, Integer scoreValue) {
		this.attemptId = attemptId;
		this.questionId = questionId;
		this.choiceId = choiceId;
		this.targetTrait = targetTrait;
		this.scoreValue = scoreValue;
	}

	public Integer getAnswerId() {
		return answerId;
	}

	public Integer getAttemptId() {
		return attemptId;
	}

	public Integer getQuestionId() {
		return questionId;
	}

	public Integer getChoiceId() {
		return choiceId;
	}

	public String getTargetTrait() {
		return targetTrait;
	}

	public Integer getScoreValue() {
		return scoreValue;
	}
}
