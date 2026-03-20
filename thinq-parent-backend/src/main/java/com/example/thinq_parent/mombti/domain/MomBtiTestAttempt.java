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
@Table(name = "mombti_test_attempt")
public class MomBtiTestAttempt {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "attempt_id")
	private Integer attemptId;

	@Column(name = "user_id", nullable = false)
	private Integer userId;

	@Column(name = "result_type")
	private String resultType;

	@Column(name = "score_p", nullable = false)
	private Integer scoreP;

	@Column(name = "score_r", nullable = false)
	private Integer scoreR;

	@Column(name = "score_t", nullable = false)
	private Integer scoreT;

	@Column(name = "score_f", nullable = false)
	private Integer scoreF;

	@Column(name = "score_i", nullable = false)
	private Integer scoreI;

	@Column(name = "score_c", nullable = false)
	private Integer scoreC;

	@Column(name = "score_e", nullable = false)
	private Integer scoreE;

	@Column(name = "score_m", nullable = false)
	private Integer scoreM;

	@Column(nullable = false)
	private String status;

	@Column(name = "started_at")
	private LocalDateTime startedAt;

	@Column(name = "completed_at")
	private LocalDateTime completedAt;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected MomBtiTestAttempt() {
	}

	public MomBtiTestAttempt(Integer userId, String status, LocalDateTime startedAt) {
		this.userId = userId;
		this.status = status;
		this.startedAt = startedAt;
		this.scoreP = 0;
		this.scoreR = 0;
		this.scoreT = 0;
		this.scoreF = 0;
		this.scoreI = 0;
		this.scoreC = 0;
		this.scoreE = 0;
		this.scoreM = 0;
	}

	public void complete(
			String resultType,
			Integer scoreP,
			Integer scoreR,
			Integer scoreT,
			Integer scoreF,
			Integer scoreI,
			Integer scoreC,
			Integer scoreE,
			Integer scoreM,
			LocalDateTime completedAt
	) {
		this.resultType = resultType;
		this.scoreP = scoreP;
		this.scoreR = scoreR;
		this.scoreT = scoreT;
		this.scoreF = scoreF;
		this.scoreI = scoreI;
		this.scoreC = scoreC;
		this.scoreE = scoreE;
		this.scoreM = scoreM;
		this.status = "COMPLETED";
		this.completedAt = completedAt;
	}

	public Integer getAttemptId() {
		return attemptId;
	}

	public Integer getUserId() {
		return userId;
	}

	public String getResultType() {
		return resultType;
	}

	public Integer getScoreP() {
		return scoreP;
	}

	public Integer getScoreR() {
		return scoreR;
	}

	public Integer getScoreT() {
		return scoreT;
	}

	public Integer getScoreF() {
		return scoreF;
	}

	public Integer getScoreI() {
		return scoreI;
	}

	public Integer getScoreC() {
		return scoreC;
	}

	public Integer getScoreE() {
		return scoreE;
	}

	public Integer getScoreM() {
		return scoreM;
	}

	public String getStatus() {
		return status;
	}

	public LocalDateTime getStartedAt() {
		return startedAt;
	}

	public LocalDateTime getCompletedAt() {
		return completedAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
