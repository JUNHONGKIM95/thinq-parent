package com.example.thinq_parent.familygroup.service;

import com.example.thinq_parent.common.exception.DuplicateResourceException;
import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.domain.FamilyGroup;
import com.example.thinq_parent.familygroup.dto.FamilyGroupCreateRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupJoinRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupMemberResponse;
import com.example.thinq_parent.familygroup.dto.FamilyGroupNameUpdateRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupResponse;
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
	private final UserRepository userRepository;
	private final InviteCodeGenerator inviteCodeGenerator;
	private final GroupPregnancySyncService groupPregnancySyncService;

	public FamilyGroupServiceImpl(
			FamilyGroupRepository familyGroupRepository,
			UserRepository userRepository,
			InviteCodeGenerator inviteCodeGenerator,
			GroupPregnancySyncService groupPregnancySyncService
	) {
		this.familyGroupRepository = familyGroupRepository;
		this.userRepository = userRepository;
		this.inviteCodeGenerator = inviteCodeGenerator;
		this.groupPregnancySyncService = groupPregnancySyncService;
	}

	@Override
	@Transactional
	public FamilyGroupResponse create(FamilyGroupCreateRequest request) {
		AppUser owner = getUserById(request.userId());
		validateOwnerCanCreateGroup(owner);
		String inviteCode = createUniqueInviteCode();
		FamilyGroup familyGroup = new FamilyGroup(
				request.groupName(),
				inviteCode,
				request.userId()
		);

		FamilyGroup savedGroup = familyGroupRepository.save(familyGroup);
		owner.updateGroupId(savedGroup.getGroupId());
		groupPregnancySyncService.syncGroupPregnancyInfo(savedGroup, owner);
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
		AppUser joinedUser = getUserById(request.userId());
		FamilyGroup familyGroup = familyGroupRepository.findByInviteCode(request.inviteCode())
				.orElseThrow(() -> new ResourceNotFoundException("Family group not found for inviteCode=" + request.inviteCode()));

		if (joinedUser.getGroupId() != null) {
			if (joinedUser.getGroupId().equals(familyGroup.getGroupId())) {
				throw new DuplicateResourceException("User already joined this family group. userId=" + request.userId());
			}
			throw new InvalidRequestException("User already belongs to another family group. userId=" + request.userId());
		}

		joinedUser.updateGroupId(familyGroup.getGroupId());
		groupPregnancySyncService.syncGroupPregnancyInfo(familyGroup, joinedUser);
		return toResponse(familyGroup);
	}

	@Override
	@Transactional
	public FamilyGroupResponse updateGroupName(Integer groupId, FamilyGroupNameUpdateRequest request) {
		FamilyGroup familyGroup = getGroupById(groupId);
		familyGroup.updateGroupName(request.groupName());
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
		String inviteCode = inviteCodeGenerator.generate();
		while (familyGroupRepository.existsByInviteCode(inviteCode)) {
			inviteCode = inviteCodeGenerator.generate();
		}
		return inviteCode;
	}

	private void validateOwnerCanCreateGroup(AppUser owner) {
		if (!"USER".equalsIgnoreCase(owner.getRole())) {
			throw new InvalidRequestException("Only USER role accounts can create a family group. userId=" + owner.getUserId());
		}
		if (familyGroupRepository.existsByUserId(owner.getUserId())) {
			throw new DuplicateResourceException("Each account can create only one family group. userId=" + owner.getUserId());
		}
		if (owner.getGroupId() != null) {
			throw new InvalidRequestException("User already belongs to a family group. userId=" + owner.getUserId());
		}
	}

	private FamilyGroupResponse toResponse(FamilyGroup familyGroup) {
		List<FamilyGroupMemberResponse> members = userRepository.findByGroupIdOrderByCreatedAtAsc(familyGroup.getGroupId())
				.stream()
				.map(user -> new FamilyGroupMemberResponse(
						user.getUserId(),
						user.getUsername(),
						user.getEmail(),
						user.getCreatedAt()
				))
				.toList();

		return new FamilyGroupResponse(
				familyGroup.getGroupId(),
				familyGroup.getGroupName(),
				familyGroup.getInviteCode(),
				familyGroup.getUserId(),
				familyGroup.getCreatedAt(),
				userRepository.countByGroupId(familyGroup.getGroupId()),
				members
		);
	}
}
