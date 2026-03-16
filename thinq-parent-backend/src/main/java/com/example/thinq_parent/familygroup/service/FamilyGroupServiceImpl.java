package com.example.thinq_parent.familygroup.service;

import com.example.thinq_parent.common.exception.DuplicateResourceException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.domain.FamilyGroup;
import com.example.thinq_parent.familygroup.domain.FamilyGroupMember;
import com.example.thinq_parent.familygroup.dto.FamilyGroupCreateRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupJoinRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupMemberResponse;
import com.example.thinq_parent.familygroup.dto.FamilyGroupResponse;
import com.example.thinq_parent.familygroup.repository.FamilyGroupMemberRepository;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class FamilyGroupServiceImpl implements FamilyGroupService {

	private final FamilyGroupRepository familyGroupRepository;
	private final FamilyGroupMemberRepository familyGroupMemberRepository;
	private final UserRepository userRepository;
	private final InviteCodeGenerator inviteCodeGenerator;

	public FamilyGroupServiceImpl(
			FamilyGroupRepository familyGroupRepository,
			FamilyGroupMemberRepository familyGroupMemberRepository,
			UserRepository userRepository,
			InviteCodeGenerator inviteCodeGenerator
	) {
		this.familyGroupRepository = familyGroupRepository;
		this.familyGroupMemberRepository = familyGroupMemberRepository;
		this.userRepository = userRepository;
		this.inviteCodeGenerator = inviteCodeGenerator;
	}

	@Override
	@Transactional
	public FamilyGroupResponse create(FamilyGroupCreateRequest request) {
		if (familyGroupRepository.existsById(request.groupId())) {
			throw new DuplicateResourceException("Family group already exists. groupId=" + request.groupId());
		}

		getUserById(request.userId());
		String inviteCode = createUniqueInviteCode();
		FamilyGroup familyGroup = new FamilyGroup(
				request.groupId(),
				request.groupName(),
				inviteCode,
				request.userId()
		);

		FamilyGroup savedGroup = familyGroupRepository.save(familyGroup);
		addMemberIfNeeded(savedGroup.getGroupId(), request.userId());
		return toResponse(savedGroup);
	}

	@Override
	public List<FamilyGroupResponse> findAll() {
		return familyGroupRepository.findAll()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public FamilyGroupResponse findById(Integer groupId) {
		return toResponse(getGroupById(groupId));
	}

	@Override
	@Transactional
	public FamilyGroupResponse join(FamilyGroupJoinRequest request) {
		getUserById(request.userId());
		FamilyGroup familyGroup = familyGroupRepository.findByInviteCode(request.inviteCode())
				.orElseThrow(() -> new ResourceNotFoundException("Family group not found for inviteCode=" + request.inviteCode()));

		if (familyGroupMemberRepository.existsByGroupIdAndUserId(familyGroup.getGroupId(), request.userId())) {
			throw new DuplicateResourceException("User already joined this family group. userId=" + request.userId());
		}

		familyGroupMemberRepository.save(new FamilyGroupMember(familyGroup.getGroupId(), request.userId()));
		return toResponse(familyGroup);
	}

	private FamilyGroup getGroupById(Integer groupId) {
		return familyGroupRepository.findById(groupId)
				.orElseThrow(() -> new ResourceNotFoundException("Family group not found. groupId=" + groupId));
	}

	private AppUser getUserById(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private String createUniqueInviteCode() {
		// 초대코드는 공유 링크처럼 쓰이기 때문에 충돌이 나지 않도록 중복 검사를 통과할 때까지 새로 만든다.
		String inviteCode = inviteCodeGenerator.generate();
		while (familyGroupRepository.existsByInviteCode(inviteCode)) {
			inviteCode = inviteCodeGenerator.generate();
		}
		return inviteCode;
	}

	private void addMemberIfNeeded(Integer groupId, Integer userId) {
		if (!familyGroupMemberRepository.existsByGroupIdAndUserId(groupId, userId)) {
			familyGroupMemberRepository.save(new FamilyGroupMember(groupId, userId));
		}
	}

	private FamilyGroupResponse toResponse(FamilyGroup familyGroup) {
		List<FamilyGroupMemberResponse> members = familyGroupMemberRepository.findByGroupIdOrderByJoinedAtAsc(familyGroup.getGroupId())
				.stream()
				.map(this::toMemberResponse)
				.toList();

		return new FamilyGroupResponse(
				familyGroup.getGroupId(),
				familyGroup.getGroupName(),
				familyGroup.getInviteCode(),
				familyGroup.getUserId(),
				familyGroup.getCreatedAt(),
				familyGroupMemberRepository.countByGroupId(familyGroup.getGroupId()),
				members
		);
	}

	private FamilyGroupMemberResponse toMemberResponse(FamilyGroupMember member) {
		AppUser user = getUserById(member.getUserId());
		return new FamilyGroupMemberResponse(
				user.getUserId(),
				user.getUsername(),
				user.getEmail(),
				member.getJoinedAt()
		);
	}
}
