package com.example.thinq_parent.familygroup.repository;

import com.example.thinq_parent.familygroup.domain.FamilyGroupMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FamilyGroupMemberRepository extends JpaRepository<FamilyGroupMember, Integer> {

	boolean existsByGroupIdAndUserId(Integer groupId, Integer userId);

	long countByGroupId(Integer groupId);

	List<FamilyGroupMember> findByGroupIdOrderByJoinedAtAsc(Integer groupId);

	Optional<FamilyGroupMember> findFirstByUserIdOrderByJoinedAtAsc(Integer userId);
}
