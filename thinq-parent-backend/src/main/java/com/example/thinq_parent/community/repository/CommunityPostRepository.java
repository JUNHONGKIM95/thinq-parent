package com.example.thinq_parent.community.repository;

import com.example.thinq_parent.community.domain.CommunityPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CommunityPostRepository extends JpaRepository<CommunityPost, Integer> {

	@Query("""
			select p
			from CommunityPost p
			where p.status = 'published'
			  and (:boardId is null or p.boardId = :boardId)
			  and (:keywordId is null or p.keywordId = :keywordId)
			  and (:mombtiResultType is null or p.authorMombtiResultType = :mombtiResultType)
			order by p.createdAt desc
			""")
	List<CommunityPost> findPublishedPosts(
			@Param("boardId") Integer boardId,
			@Param("keywordId") Integer keywordId,
			@Param("mombtiResultType") String mombtiResultType
	);

	Optional<CommunityPost> findByPostIdAndStatusNot(Integer postId, String status);
}
