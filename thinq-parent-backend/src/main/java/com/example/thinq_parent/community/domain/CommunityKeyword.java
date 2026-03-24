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
@Table(name = "community_keywords")
public class CommunityKeyword {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "keyword_id")
	private Integer keywordId;

	@Column(name = "keyword_code", nullable = false, unique = true, length = 30)
	private String keywordCode;

	@Column(name = "keyword_name", nullable = false, length = 100)
	private String keywordName;

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

	protected CommunityKeyword() {
	}

	public Integer getKeywordId() {
		return keywordId;
	}

	public String getKeywordCode() {
		return keywordCode;
	}

	public String getKeywordName() {
		return keywordName;
	}

	public Integer getSortOrder() {
		return sortOrder;
	}

	public Boolean getIsActive() {
		return isActive;
	}
}
