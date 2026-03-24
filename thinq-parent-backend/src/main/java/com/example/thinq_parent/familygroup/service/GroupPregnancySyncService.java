package com.example.thinq_parent.familygroup.service;

import com.example.thinq_parent.familygroup.domain.FamilyGroup;
import com.example.thinq_parent.schedule.service.DueDateScheduleSyncService;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import com.example.thinq_parent.user.service.PregnancyInfoCalculator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class GroupPregnancySyncService {

	private final UserRepository userRepository;
	private final DueDateScheduleSyncService dueDateScheduleSyncService;
	private final PregnancyInfoCalculator pregnancyInfoCalculator;

	public GroupPregnancySyncService(
			UserRepository userRepository,
			DueDateScheduleSyncService dueDateScheduleSyncService,
			PregnancyInfoCalculator pregnancyInfoCalculator
	) {
		this.userRepository = userRepository;
		this.dueDateScheduleSyncService = dueDateScheduleSyncService;
		this.pregnancyInfoCalculator = pregnancyInfoCalculator;
	}

	@Transactional
	public void syncGroupPregnancyInfo(FamilyGroup familyGroup, AppUser fallbackUser) {
		AppUser sourceUser = resolvePregnancyInfoSource(familyGroup, fallbackUser);
		if (sourceUser == null) {
			return;
		}

		Integer currentWeek = pregnancyInfoCalculator.calculate(sourceUser.getDueDate()).currentWeek();
		for (AppUser user : userRepository.findByGroupIdOrderByCreatedAtAsc(familyGroup.getGroupId())) {
			user.updatePregnancyInfo(sourceUser.getBabyNickname(), sourceUser.getDueDate(), currentWeek);
		}
		dueDateScheduleSyncService.sync(familyGroup.getGroupId(), sourceUser.getUserId(), sourceUser.getDueDate());
	}

	@Transactional
	public void syncUserGroupsPregnancyInfo(AppUser sourceUser) {
		if (sourceUser.getGroupId() == null) {
			return;
		}

		Integer currentWeek = pregnancyInfoCalculator.calculate(sourceUser.getDueDate()).currentWeek();
		for (AppUser user : userRepository.findByGroupIdOrderByCreatedAtAsc(sourceUser.getGroupId())) {
			user.updatePregnancyInfo(sourceUser.getBabyNickname(), sourceUser.getDueDate(), currentWeek);
		}
		dueDateScheduleSyncService.sync(sourceUser.getGroupId(), sourceUser.getUserId(), sourceUser.getDueDate());
	}

	@Transactional
	public void syncGroupDueDate(Integer groupId, LocalDate dueDate) {
		if (groupId == null) {
			return;
		}

		Integer currentWeek = pregnancyInfoCalculator.calculate(dueDate).currentWeek();
		for (AppUser user : userRepository.findByGroupIdOrderByCreatedAtAsc(groupId)) {
			user.updateDueDate(dueDate, currentWeek);
		}
		Integer ownerUserId = userRepository.findByGroupIdOrderByCreatedAtAsc(groupId)
				.stream()
				.findFirst()
				.map(AppUser::getUserId)
				.orElse(null);
		dueDateScheduleSyncService.sync(groupId, ownerUserId, dueDate);
	}

	private AppUser resolvePregnancyInfoSource(FamilyGroup familyGroup, AppUser fallbackUser) {
		AppUser owner = getUserById(familyGroup.getUserId());
		if (hasPregnancyInfo(owner)) {
			return owner;
		}

		List<AppUser> groupedUsers = userRepository.findByGroupIdOrderByCreatedAtAsc(familyGroup.getGroupId());
		for (AppUser user : groupedUsers) {
			if (hasPregnancyInfo(user)) {
				return user;
			}
		}

		return hasPregnancyInfo(fallbackUser) ? fallbackUser : null;
	}

	private AppUser getUserById(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new IllegalStateException("User not found during group sync. userId=" + userId));
	}

	private boolean hasPregnancyInfo(AppUser user) {
		return user.getBabyNickname() != null || user.getDueDate() != null;
	}
}
