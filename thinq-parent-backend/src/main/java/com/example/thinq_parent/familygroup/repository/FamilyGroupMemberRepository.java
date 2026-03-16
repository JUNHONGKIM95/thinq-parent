package com.example.thinq_parent.familygroup.repository;

import com.example.thinq_parent.familygroup.domain.FamilyGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FamilyGroupMemberRepository extends JpaRepository<FamilyGroupMember, Long> {

	boolean existsByGroupIdAndUserId(Integer groupId, Integer userId);

	long countByGroupId(Integer groupId);

	List<FamilyGroupMember> findByGroupIdOrderByJoinedAtAsc(Integer groupId);
}
