package com.example.thinq_parent.mombti.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "mombti_result_profile")
public class MomBtiResultProfile {

	@Id
	@Column(name = "result_type", length = 10)
	private String resultType;

	@Column(nullable = false)
	private String title;

	@Column
	private String subtitle;

	@Column(nullable = false)
	private String summary;

	@Column
	private String content;

	@Column(name = "image_url")
	private String imageUrl;

	@Column(name = "created_at", insertable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", insertable = false, updatable = false)
	private LocalDateTime updatedAt;

	protected MomBtiResultProfile() {
	}

	public String getResultType() {
		return resultType;
	}

	public String getTitle() {
		return title;
	}

	public String getSubtitle() {
		return subtitle;
	}

	public String getSummary() {
		return summary;
	}

	public String getContent() {
		return content;
	}

	public String getImageUrl() {
		return imageUrl;
	}
}
