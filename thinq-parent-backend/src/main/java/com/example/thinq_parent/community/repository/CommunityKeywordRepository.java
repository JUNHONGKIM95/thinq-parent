package com.example.thinq_parent.community.repository;

import com.example.thinq_parent.community.domain.CommunityKeyword;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityKeywordRepository extends JpaRepository<CommunityKeyword, Integer> {

	List<CommunityKeyword> findByIsActiveTrueOrderBySortOrderAsc();
}
