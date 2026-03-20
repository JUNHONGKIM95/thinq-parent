package com.example.thinq_parent.user.service;

import com.example.thinq_parent.user.dto.UserCreateRequest;
import com.example.thinq_parent.user.dto.UserDueDateUpdateRequest;
import com.example.thinq_parent.user.dto.UserBabyNicknameUpdateRequest;
import com.example.thinq_parent.user.dto.UserPregnancySummaryResponse;
import com.example.thinq_parent.user.dto.UserResponse;
import com.example.thinq_parent.user.dto.UserUpdateRequest;

import java.util.List;

public interface UserService {

	UserResponse create(UserCreateRequest request);

	List<UserResponse> findAll();

	UserResponse findById(Integer userId);

	UserPregnancySummaryResponse getPregnancySummary(Integer userId);

	UserResponse update(Integer userId, UserUpdateRequest request);

	UserResponse updateDueDate(Integer userId, UserDueDateUpdateRequest request);

	UserResponse updateBabyNickname(Integer userId, UserBabyNicknameUpdateRequest request);

	void delete(Integer userId);
}
