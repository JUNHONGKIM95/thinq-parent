package com.example.thinq_parent.community.repository;

import com.example.thinq_parent.community.domain.CommunityPostLike;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityPostLikeRepository extends JpaRepository<CommunityPostLike, Integer> {

	Optional<CommunityPostLike> findByPostIdAndUserId(Integer postId, Integer userId);

	long countByPostId(Integer postId);
}
