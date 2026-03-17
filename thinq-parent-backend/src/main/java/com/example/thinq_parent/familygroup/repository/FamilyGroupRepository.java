package com.example.thinq_parent.familygroup.repository;

import com.example.thinq_parent.familygroup.domain.FamilyGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FamilyGroupRepository extends JpaRepository<FamilyGroup, Integer> {

	boolean existsByInviteCode(String inviteCode);

	boolean existsByUserId(Integer userId);

	Optional<FamilyGroup> findByInviteCode(String inviteCode);
}
