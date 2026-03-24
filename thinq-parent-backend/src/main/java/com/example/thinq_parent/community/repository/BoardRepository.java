package com.example.thinq_parent.community.repository;

import com.example.thinq_parent.community.domain.Board;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Integer> {

	List<Board> findByIsActiveTrueOrderBySortOrderAsc();
}
