package com.example.thinq_parent.user.service;

import com.example.thinq_parent.user.dto.UserCreateRequest;
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

	void delete(Integer userId);
}
