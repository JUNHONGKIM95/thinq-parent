package com.example.thinq_parent.community.repository;

import com.example.thinq_parent.community.domain.CommunityComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment, Integer> {

	List<CommunityComment> findByPostIdAndStatusOrderByCreatedAtAsc(Integer postId, String status);

	long countByPostIdAndStatus(Integer postId, String status);

	Optional<CommunityComment> findByCommentIdAndStatusNot(Integer commentId, String status);
}
