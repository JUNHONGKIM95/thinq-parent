package com.example.thinq_parent.community.service;

import com.example.thinq_parent.common.exception.InvalidRequestException;
import com.example.thinq_parent.common.exception.ResourceNotFoundException;
import com.example.thinq_parent.community.domain.Board;
import com.example.thinq_parent.community.domain.CommunityComment;
import com.example.thinq_parent.community.domain.CommunityKeyword;
import com.example.thinq_parent.community.domain.CommunityPost;
import com.example.thinq_parent.community.domain.CommunityPostLike;
import com.example.thinq_parent.community.dto.BoardResponse;
import com.example.thinq_parent.community.dto.CommunityCommentCreateRequest;
import com.example.thinq_parent.community.dto.CommunityCommentPatchRequest;
import com.example.thinq_parent.community.dto.CommunityCommentResponse;
import com.example.thinq_parent.community.dto.CommunityKeywordResponse;
import com.example.thinq_parent.community.dto.CommunityPostCreateRequest;
import com.example.thinq_parent.community.dto.CommunityPostPatchRequest;
import com.example.thinq_parent.community.dto.CommunityPostResponse;
import com.example.thinq_parent.community.repository.BoardRepository;
import com.example.thinq_parent.community.repository.CommunityCommentRepository;
import com.example.thinq_parent.community.repository.CommunityKeywordRepository;
import com.example.thinq_parent.community.repository.CommunityPostLikeRepository;
import com.example.thinq_parent.community.repository.CommunityPostRepository;
import com.example.thinq_parent.mombti.domain.MomBtiTestAttempt;
import com.example.thinq_parent.mombti.repository.MomBtiTestAttemptRepository;
import com.example.thinq_parent.user.domain.AppUser;
import com.example.thinq_parent.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class CommunityServiceImpl implements CommunityService {

	private static final String PUBLISHED = "published";
	private static final String DELETED = "deleted";
	private static final String COMPLETED = "COMPLETED";

	private final BoardRepository boardRepository;
	private final CommunityKeywordRepository keywordRepository;
	private final CommunityPostRepository postRepository;
	private final CommunityCommentRepository commentRepository;
	private final CommunityPostLikeRepository postLikeRepository;
	private final UserRepository userRepository;
	private final MomBtiTestAttemptRepository momBtiTestAttemptRepository;

	public CommunityServiceImpl(
			BoardRepository boardRepository,
			CommunityKeywordRepository keywordRepository,
			CommunityPostRepository postRepository,
			CommunityCommentRepository commentRepository,
			CommunityPostLikeRepository postLikeRepository,
			UserRepository userRepository,
			MomBtiTestAttemptRepository momBtiTestAttemptRepository
	) {
		this.boardRepository = boardRepository;
		this.keywordRepository = keywordRepository;
		this.postRepository = postRepository;
		this.commentRepository = commentRepository;
		this.postLikeRepository = postLikeRepository;
		this.userRepository = userRepository;
		this.momBtiTestAttemptRepository = momBtiTestAttemptRepository;
	}

	@Override
	public List<BoardResponse> getBoards() {
		return boardRepository.findByIsActiveTrueOrderBySortOrderAsc()
				.stream()
				.map(board -> new BoardResponse(
						board.getBoardId(),
						board.getBoardCode(),
						board.getBoardName(),
						board.getDescription()
				))
				.toList();
	}

	@Override
	public List<CommunityKeywordResponse> getKeywords() {
		return keywordRepository.findByIsActiveTrueOrderBySortOrderAsc()
				.stream()
				.map(keyword -> new CommunityKeywordResponse(
						keyword.getKeywordId(),
						keyword.getKeywordCode(),
						keyword.getKeywordName()
				))
				.toList();
	}

	@Override
	public List<CommunityPostResponse> getPosts(Integer boardId, Integer keywordId, boolean sameMombtiOnly, Integer userId) {
		String mombtiResultType = null;
		if (sameMombtiOnly) {
			if (userId == null) {
				throw new InvalidRequestException("userId is required when sameMombtiOnly is true");
			}
			getUser(userId);
			mombtiResultType = findLatestCompletedMombtiResultType(userId);
			if (mombtiResultType == null) {
				return List.of();
			}
		}

		if (boardId != null) {
			getBoard(boardId);
		}
		if (keywordId != null) {
			getKeyword(keywordId);
		}

		List<CommunityPost> posts = postRepository.findPublishedPosts(boardId, keywordId, mombtiResultType);
		Map<Integer, Board> boards = boardRepository.findAllById(
				posts.stream().map(CommunityPost::getBoardId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(Board::getBoardId, Function.identity()));
		Map<Integer, CommunityKeyword> keywords = keywordRepository.findAllById(
				posts.stream().map(CommunityPost::getKeywordId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(CommunityKeyword::getKeywordId, Function.identity()));

		return posts.stream()
				.map(post -> toPostResponse(post, boards.get(post.getBoardId()), keywords.get(post.getKeywordId()), userId))
				.toList();
	}

	@Override
	@Transactional
	public CommunityPostResponse getPost(Integer postId, Integer userId) {
		CommunityPost post = getActivePost(postId);
		post.incrementViewCount();
		return toPostResponse(post, getBoard(post.getBoardId()), getKeyword(post.getKeywordId()), userId);
	}

	@Override
	@Transactional
	public CommunityPostResponse createPost(CommunityPostCreateRequest request) {
		AppUser author = getUser(request.authorUserId());
		Board board = getBoard(request.boardId());
		CommunityKeyword keyword = getKeyword(request.keywordId());
		String latestMombti = findLatestCompletedMombtiResultType(author.getUserId());

		CommunityPost post = new CommunityPost(
				board.getBoardId(),
				keyword.getKeywordId(),
				author.getUserId(),
				latestMombti,
				request.title(),
				request.content(),
				request.isAnonymous()
		);

		return toPostResponse(postRepository.save(post), board, keyword, author.getUserId());
	}

	@Override
	@Transactional
	public CommunityPostResponse patchPost(Integer postId, CommunityPostPatchRequest request) {
		CommunityPost post = getActivePost(postId);
		assertAuthor(post.getAuthorUserId(), request.authorUserId());
		Board board = request.boardId() == null ? getBoard(post.getBoardId()) : getBoard(request.boardId());
		CommunityKeyword keyword = request.keywordId() == null ? getKeyword(post.getKeywordId()) : getKeyword(request.keywordId());
		post.patch(request.boardId(), request.keywordId(), request.title(), request.content(), request.isAnonymous());
		return toPostResponse(post, board, keyword, request.authorUserId());
	}

	@Override
	@Transactional
	public void deletePost(Integer postId, Integer authorUserId) {
		CommunityPost post = getActivePost(postId);
		assertAuthor(post.getAuthorUserId(), authorUserId);
		post.softDelete(LocalDateTime.now());
	}

	@Override
	public List<CommunityCommentResponse> getComments(Integer postId) {
		getActivePost(postId);
		List<CommunityComment> comments = commentRepository.findByPostIdAndStatusOrderByCreatedAtAsc(postId, PUBLISHED);
		Map<Integer, AppUser> users = userRepository.findAllById(
				comments.stream().map(CommunityComment::getAuthorUserId).collect(Collectors.toSet())
		).stream().collect(Collectors.toMap(AppUser::getUserId, Function.identity()));

		return comments.stream()
				.map(comment -> toCommentResponse(comment, users.get(comment.getAuthorUserId())))
				.toList();
	}

	@Override
	@Transactional
	public CommunityCommentResponse createComment(Integer postId, CommunityCommentCreateRequest request) {
		CommunityPost post = getActivePost(postId);
		AppUser author = getUser(request.authorUserId());
		CommunityComment saved = commentRepository.save(new CommunityComment(postId, author.getUserId(), request.content()));
		post.updateCommentCount((int) commentRepository.countByPostIdAndStatus(postId, PUBLISHED));
		return toCommentResponse(saved, author);
	}

	@Override
	@Transactional
	public CommunityCommentResponse patchComment(Integer commentId, CommunityCommentPatchRequest request) {
		CommunityComment comment = getActiveComment(commentId);
		assertAuthor(comment.getAuthorUserId(), request.authorUserId());
		comment.patch(request.content());
		return toCommentResponse(comment, getUser(comment.getAuthorUserId()));
	}

	@Override
	@Transactional
	public void deleteComment(Integer commentId, Integer authorUserId) {
		CommunityComment comment = getActiveComment(commentId);
		assertAuthor(comment.getAuthorUserId(), authorUserId);
		comment.softDelete(LocalDateTime.now());
		CommunityPost post = getActivePost(comment.getPostId());
		post.updateCommentCount((int) commentRepository.countByPostIdAndStatus(comment.getPostId(), PUBLISHED));
	}

	@Override
	@Transactional
	public CommunityPostResponse likePost(Integer postId, Integer userId) {
		CommunityPost post = getActivePost(postId);
		getUser(userId);
		postLikeRepository.findByPostIdAndUserId(postId, userId)
				.orElseGet(() -> postLikeRepository.save(new CommunityPostLike(postId, userId)));
		post.updateLikeCount((int) postLikeRepository.countByPostId(postId));
		return toPostResponse(post, getBoard(post.getBoardId()), getKeyword(post.getKeywordId()), userId);
	}

	@Override
	@Transactional
	public CommunityPostResponse unlikePost(Integer postId, Integer userId) {
		CommunityPost post = getActivePost(postId);
		getUser(userId);
		postLikeRepository.findByPostIdAndUserId(postId, userId)
				.ifPresent(postLikeRepository::delete);
		post.updateLikeCount((int) postLikeRepository.countByPostId(postId));
		return toPostResponse(post, getBoard(post.getBoardId()), getKeyword(post.getKeywordId()), userId);
	}

	private AppUser getUser(Integer userId) {
		return userRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("User not found. userId=" + userId));
	}

	private Board getBoard(Integer boardId) {
		Board board = boardRepository.findById(boardId)
				.orElseThrow(() -> new ResourceNotFoundException("Board not found. boardId=" + boardId));
		if (!Boolean.TRUE.equals(board.getIsActive())) {
			throw new InvalidRequestException("Board is inactive. boardId=" + boardId);
		}
		return board;
	}

	private CommunityKeyword getKeyword(Integer keywordId) {
		CommunityKeyword keyword = keywordRepository.findById(keywordId)
				.orElseThrow(() -> new ResourceNotFoundException("Keyword not found. keywordId=" + keywordId));
		if (!Boolean.TRUE.equals(keyword.getIsActive())) {
			throw new InvalidRequestException("Keyword is inactive. keywordId=" + keywordId);
		}
		return keyword;
	}

	private CommunityPost getActivePost(Integer postId) {
		return postRepository.findByPostIdAndStatusNot(postId, DELETED)
				.orElseThrow(() -> new ResourceNotFoundException("Community post not found. postId=" + postId));
	}

	private CommunityComment getActiveComment(Integer commentId) {
		return commentRepository.findByCommentIdAndStatusNot(commentId, DELETED)
				.orElseThrow(() -> new ResourceNotFoundException("Community comment not found. commentId=" + commentId));
	}

	private void assertAuthor(Integer savedAuthorUserId, Integer requestAuthorUserId) {
		if (!savedAuthorUserId.equals(requestAuthorUserId)) {
			throw new InvalidRequestException("Only the author can modify this resource.");
		}
	}

	private String findLatestCompletedMombtiResultType(Integer userId) {
		return momBtiTestAttemptRepository
				.findFirstByUserIdAndStatusOrderByCompletedAtDescCreatedAtDesc(userId, COMPLETED)
				.map(MomBtiTestAttempt::getResultType)
				.orElse(null);
	}

	private CommunityPostResponse toPostResponse(CommunityPost post, Board board, CommunityKeyword keyword, Integer currentUserId) {
		Boolean likedByMe = currentUserId != null
				? postLikeRepository.findByPostIdAndUserId(post.getPostId(), currentUserId).isPresent()
				: null;

		return new CommunityPostResponse(
				post.getPostId(),
				post.getBoardId(),
				board == null ? null : board.getBoardCode(),
				board == null ? null : board.getBoardName(),
				post.getKeywordId(),
				keyword == null ? null : keyword.getKeywordCode(),
				keyword == null ? null : keyword.getKeywordName(),
				post.getAuthorUserId(),
				post.getAuthorMombtiResultType(),
				post.getTitle(),
				post.getContent(),
				buildPreview(post.getContent()),
				post.getLikeCount(),
				post.getCommentCount(),
				post.getViewCount(),
				post.getIsAnonymous(),
				likedByMe,
				post.getStatus(),
				formatElapsedTime(post.getCreatedAt()),
				post.getCreatedAt(),
				post.getUpdatedAt(),
				post.getDeletedAt()
		);
	}

	private CommunityCommentResponse toCommentResponse(CommunityComment comment, AppUser user) {
		return new CommunityCommentResponse(
				comment.getCommentId(),
				comment.getPostId(),
				comment.getAuthorUserId(),
				user == null ? null : user.getUsername(),
				comment.getContent(),
				comment.getStatus(),
				formatElapsedTime(comment.getCreatedAt()),
				comment.getCreatedAt(),
				comment.getUpdatedAt(),
				comment.getDeletedAt()
		);
	}

	private String buildPreview(String content) {
		if (content == null || content.isBlank()) {
			return content;
		}
		return content.length() <= 80 ? content : content.substring(0, 80) + "...";
	}

	private String formatElapsedTime(LocalDateTime createdAt) {
		if (createdAt == null) {
			return null;
		}
		Duration duration = Duration.between(createdAt, LocalDateTime.now());
		long minutes = Math.max(duration.toMinutes(), 0);
		if (minutes < 1) {
			return "방금 전";
		}
		if (minutes < 60) {
			return minutes + "분 전";
		}
		long hours = duration.toHours();
		if (hours < 24) {
			return hours + "시간 전";
		}
		long days = duration.toDays();
		if (days < 30) {
			return days + "일 전";
		}
		long months = days / 30;
		if (months < 12) {
			return months + "개월 전";
		}
		return (days / 365) + "년 전";
	}
}
