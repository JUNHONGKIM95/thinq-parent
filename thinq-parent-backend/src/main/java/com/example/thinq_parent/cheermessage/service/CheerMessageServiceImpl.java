package com.example.thinq_parent.cheermessage.service;

import com.example.thinq_parent.cheermessage.domain.CheerMessage;
import com.example.thinq_parent.cheermessage.dto.CheerMessageCreateRequest;
import com.example.thinq_parent.cheermessage.dto.CheerMessageResponse;
import com.example.thinq_parent.cheermessage.repository.CheerMessageRepository;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Service
@Transactional(readOnly = true)
public class CheerMessageServiceImpl implements CheerMessageService {

	private final CheerMessageRepository cheerMessageRepository;
	private final FamilyGroupRepository familyGroupRepository;
	private final UserRepository userRepository;
	private final Clock clock;

	public CheerMessageServiceImpl(
			CheerMessageRepository cheerMessageRepository,
			FamilyGroupRepository familyGroupRepository,
			UserRepository userRepository,
			Clock clock
	) {
		this.cheerMessageRepository = cheerMessageRepository;
		this.familyGroupRepository = familyGroupRepository;
		this.userRepository = userRepository;
		this.clock = clock;
	}

	@Override
	@Transactional
	public CheerMessageResponse create(CheerMessageCreateRequest request) {
		validateGroup(request.groupId());
		AppUser sender = getUserById(request.senderId());

		CheerMessage cheerMessage = new CheerMessage(
				request.groupId(),
				request.senderId(),
				request.content(),
				request.reactionEmoji()
		);

		return toResponse(cheerMessageRepository.save(cheerMessage), sender.getUsername());
	}

	@Override
	@Transactional
	public CheerMessageResponse findLatestByGroupId(Integer groupId) {
		validateGroup(groupId);

		return cheerMessageRepository.findFirstByGroupIdOrderByCreatedAtDesc(groupId)
				.map(this::expireIfNeeded)
				.map(this::toResponseOrEmpty)
				.orElseGet(() -> new CheerMessageResponse(
						null,
						groupId,
						null,
						null,
						null,
						null,
						null
				));
	}

	@Override
	public CheerMessageResponse findLatestByUserId(Integer userId) {
		AppUser user = getUserById(userId);
		Integer groupId = user.getGroupId();

		if (groupId == null) {
			return new CheerMessageResponse(
					null,
					null,
					null,
					null,
					null,
					null,
					null
			);
		}

		return findLatestContentByGroupId(groupId);
	}

	private CheerMessage expireIfNeeded(CheerMessage message) {
		if (message.getCreatedAt() == null || message.getContent() == null) {
			return message;
		}

		LocalDate today = LocalDate.now(clock);
		if (message.getCreatedAt().toLocalDate().isBefore(today)) {
			message.clearContentForNewDay();
		}
		return message;
	}

	private void validateGroup(Integer groupId) {
		if (!familyGroupRepository.existsById(groupId)) {
			throw new ResourceNotFoundException("Family group not found. groupId=" + groupId);
		}
	}

	private CheerMessageResponse findLatestContentByGroupId(Integer groupId) {
		validateGroup(groupId);

		return cheerMessageRepository.findFirstByGroupIdOrderByCreatedAtDesc(groupId)
				.map(this::toResponseOrEmpty)
				.orElseGet(() -> new CheerMessageResponse(
						null,
						groupId,
						null,
						null,
						null,
						null,
						null
				));
	}

	private AppUser getUserById(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private CheerMessageResponse toResponse(CheerMessage cheerMessage, String senderUsername) {
		return new CheerMessageResponse(
				cheerMessage.getMessageId(),
				cheerMessage.getGroupId(),
				cheerMessage.getSenderId(),
				senderUsername,
				cheerMessage.getContent(),
				cheerMessage.getReactionEmoji(),
				cheerMessage.getCreatedAt()
		);
	}

	private CheerMessageResponse toResponseOrEmpty(CheerMessage cheerMessage) {
		if (cheerMessage.getContent() == null) {
			return new CheerMessageResponse(
					cheerMessage.getMessageId(),
					cheerMessage.getGroupId(),
					null,
					null,
					null,
					null,
					cheerMessage.getCreatedAt()
			);
		}
		return toResponse(cheerMessage, getUserById(cheerMessage.getSenderId()).getUsername());
	}
}
