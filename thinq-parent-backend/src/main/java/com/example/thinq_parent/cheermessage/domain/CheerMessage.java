package com.example.thinq_parent.cheermessage.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cheer_messages")
public class CheerMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "message_id")
	private Integer messageId;

	@Column(name = "group_id", nullable = false)
	private Integer groupId;

	@Column(name = "sender_id", nullable = false)
	private Integer senderId;

	@Column(columnDefinition = "text")
	private String content;

	@Column(name = "reaction_emoji", length = 50)
	private String reactionEmoji;

	@CreationTimestamp
	@Column(name = "created_at", updatable = false)
	private LocalDateTime createdAt;

	protected CheerMessage() {
	}

	public CheerMessage(Integer groupId, Integer senderId, String content, String reactionEmoji) {
		this.groupId = groupId;
		this.senderId = senderId;
		this.content = content;
		this.reactionEmoji = reactionEmoji;
	}

	public Integer getMessageId() {
		return messageId;
	}

	public Integer getGroupId() {
		return groupId;
	}

	public Integer getSenderId() {
		return senderId;
	}

	public String getContent() {
		return content;
	}

	public void clearContentForNewDay() {
		this.content = null;
		this.reactionEmoji = null;
	}

	public String getReactionEmoji() {
		return reactionEmoji;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
