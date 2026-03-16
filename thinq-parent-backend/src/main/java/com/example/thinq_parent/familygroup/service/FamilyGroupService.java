package com.example.thinq_parent.familygroup.service;

import com.example.thinq_parent.familygroup.dto.FamilyGroupCreateRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupJoinRequest;
import com.example.thinq_parent.familygroup.dto.FamilyGroupResponse;

import java.util.List;

public interface FamilyGroupService {

	FamilyGroupResponse create(FamilyGroupCreateRequest request);

	List<FamilyGroupResponse> findAll();

	FamilyGroupResponse findById(Integer groupId);

	FamilyGroupResponse join(FamilyGroupJoinRequest request);
}
