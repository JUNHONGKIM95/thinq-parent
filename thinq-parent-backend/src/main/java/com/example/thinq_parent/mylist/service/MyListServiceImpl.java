package com.example.thinq_parent.mylist.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.familygroup.repository.FamilyGroupRepository;
import com.example.thinq_parent.mylist.domain.MyListItem;
import com.example.thinq_parent.mylist.dto.MyListCheckYnUpdateRequest;
import com.example.thinq_parent.mylist.dto.MyListCreateRequest;
import com.example.thinq_parent.mylist.dto.MyListResponse;
import com.example.thinq_parent.mylist.dto.MyListTitleUpdateRequest;
import com.example.thinq_parent.mylist.repository.MyListRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class MyListServiceImpl implements MyListService {

	private static final Character DEFAULT_CHECK_YN = 'N';

	private final MyListRepository myListRepository;
	private final UserRepository userRepository;
	private final FamilyGroupRepository familyGroupRepository;

	public MyListServiceImpl(
			MyListRepository myListRepository,
			UserRepository userRepository,
			FamilyGroupRepository familyGroupRepository
	) {
		this.myListRepository = myListRepository;
		this.userRepository = userRepository;
		this.familyGroupRepository = familyGroupRepository;
	}

	@Override
	@Transactional
	public MyListResponse create(Integer userId, MyListCreateRequest request) {
		AppUser user = getUser(userId);
		Integer groupId = user.getGroupId();
		if (groupId == null) {
			throw new InvalidRequestException("User must belong to a family group to create my list items.");
		}

		MyListItem myListItem = new MyListItem(
				groupId,
				user.getUserId(),
				request.title(),
				DEFAULT_CHECK_YN,
				request.myListDate()
		);

		return toResponse(myListRepository.save(myListItem));
	}

	@Override
	public List<MyListResponse> findByGroupId(Integer groupId) {
		validateGroup(groupId);
		return myListRepository.findByGroupIdOrderByCreatedAtDesc(groupId)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	public List<MyListResponse> findByGroupIdAndDate(Integer groupId, LocalDate date) {
		validateGroup(groupId);
		return myListRepository.findByGroupIdAndMyListDateOrderByCreatedAtDesc(groupId, date)
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Override
	@Transactional
	public MyListResponse updateTitle(Integer myListId, MyListTitleUpdateRequest request) {
		MyListItem myListItem = getMyListItem(myListId);
		myListItem.updateTitle(request.title());
		return toResponse(myListItem);
	}

	@Override
	@Transactional
	public MyListResponse updateCheckYn(Integer myListId, MyListCheckYnUpdateRequest request) {
		MyListItem myListItem = getMyListItem(myListId);
		myListItem.updateCheckYn(validateCheckYn(request.checkYn()));
		return toResponse(myListItem);
	}

	@Override
	@Transactional
	public void delete(Integer myListId) {
		myListRepository.delete(getMyListItem(myListId));
	}

	private AppUser getUser(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private void validateGroup(Integer groupId) {
		if (!familyGroupRepository.existsById(groupId)) {
			throw new ResourceNotFoundException("Family group not found. groupId=" + groupId);
		}
	}

	private MyListItem getMyListItem(Integer myListId) {
		return myListRepository.findById(myListId)
				.orElseThrow(() -> new ResourceNotFoundException("My list item not found. myListId=" + myListId));
	}

	private Character validateCheckYn(String checkYn) {
		if ("Y".equals(checkYn) || "N".equals(checkYn)) {
			return checkYn.charAt(0);
		}
		throw new InvalidRequestException("checkYn must be Y or N");
	}

	private MyListResponse toResponse(MyListItem myListItem) {
		return new MyListResponse(
				myListItem.getMyListId(),
				myListItem.getGroupId(),
				myListItem.getUserId(),
				myListItem.getTitle(),
				myListItem.getMyListDate(),
				myListItem.getCreatedAt(),
				myListItem.getCheckYn() == null ? null : myListItem.getCheckYn().toString()
		);
	}
}
