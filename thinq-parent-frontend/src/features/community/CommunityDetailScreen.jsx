import { useEffect, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import commentReactionIcon from '@shared-assets/srg/fi-rr-comment2.svg'
import heartReactionIcon from '@shared-assets/srg/fi-rr-heart2.svg'
import heartReactionActiveIcon from '@shared-assets/srg/heart.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import commentEditActionIcon from '@shared-assets/srg/fi-rr-pencil.svg'
import commentDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import { API_BASE_URL } from '../../config/api'
import {
  readCachedCommunityDetail,
  removeCachedCommunityDetail,
  removeCommunityPostFromCachedLists,
  upsertCommunityPostInCachedLists,
  writeCachedCommunityDetail,
} from './communityCache'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function HeartIcon({ isActive = false }) {
  return <img src={isActive ? heartReactionActiveIcon : heartReactionIcon} alt="" aria-hidden="true" />
}

function CommentIcon() {
  return <img src={commentReactionIcon} alt="" aria-hidden="true" />
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 20 4.2-.8L19 8.4a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m13.5 6.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: parentModeHomeIcon },
  { key: 'device', label: '가전육아', icon: parentModeDeviceIcon },
  { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon },
  { key: 'my', label: 'MY', icon: parentModeMyIcon },
]

function normalizeString(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value) {
  const parsedValue = Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function normalizeBoolean(value) {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  const normalizedValue = String(value ?? '').trim().toLowerCase()

  if (!normalizedValue) {
    return false
  }

  return normalizedValue === 'true' || normalizedValue === '1' || normalizedValue === 'y' || normalizedValue === 'yes'
}

function normalizeOptionalBoolean(value) {
  if (value === undefined || value === null || value === '') {
    return null
  }

  return normalizeBoolean(value)
}

function normalizeMombtiAttemptStatus(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getMombtiAttemptCompletedAt(attempt) {
  return attempt?.completedAt ?? attempt?.completed_at ?? null
}

function getLatestMombtiAttemptFromPayload(payload) {
  const rawValue = payload?.data ?? payload
  const attempts = Array.isArray(rawValue)
    ? rawValue
    : Array.isArray(rawValue?.items)
      ? rawValue.items
      : Array.isArray(rawValue?.attempts)
        ? rawValue.attempts
        : rawValue
          ? [rawValue]
          : []

  return attempts
    .sort((first, second) => {
      const firstCompletedTime = new Date(getMombtiAttemptCompletedAt(first) ?? 0).getTime()
      const secondCompletedTime = new Date(getMombtiAttemptCompletedAt(second) ?? 0).getTime()

      if (firstCompletedTime !== secondCompletedTime) {
        return secondCompletedTime - firstCompletedTime
      }

      const firstId = Number(first?.attemptId ?? first?.attempt_id ?? first?.id ?? 0)
      const secondId = Number(second?.attemptId ?? second?.attempt_id ?? second?.id ?? 0)
      return secondId - firstId
    })[0] ?? null
}

function isCompletedMombtiAttempt(attempt) {
  return normalizeMombtiAttemptStatus(attempt?.status) === 'COMPLETED'
}

function getLatestCompletedMombtiAttemptFromPayload(payload) {
  const rawValue = payload?.data ?? payload
  const attempts = Array.isArray(rawValue)
    ? rawValue
    : Array.isArray(rawValue?.items)
      ? rawValue.items
      : Array.isArray(rawValue?.attempts)
        ? rawValue.attempts
        : rawValue
          ? [rawValue]
          : []

  return attempts
    .filter(isCompletedMombtiAttempt)
    .sort((first, second) => {
      const firstCompletedTime = new Date(getMombtiAttemptCompletedAt(first) ?? 0).getTime()
      const secondCompletedTime = new Date(getMombtiAttemptCompletedAt(second) ?? 0).getTime()

      if (firstCompletedTime !== secondCompletedTime) {
        return secondCompletedTime - firstCompletedTime
      }

      const firstId = Number(first?.attemptId ?? first?.attempt_id ?? first?.id ?? 0)
      const secondId = Number(second?.attemptId ?? second?.attempt_id ?? second?.id ?? 0)
      return secondId - firstId
    })[0] ?? null
}

function getMombtiResultType(attempt) {
  return normalizeString(
    attempt?.resultType ??
      attempt?.result_type ??
      attempt?.profile?.resultType ??
      attempt?.profile?.result_type
  )
}

function getObjectPayload(payload) {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload
  }

  return null
}

function getUserPayload(payload) {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  if (payload?.user && typeof payload.user === 'object') {
    return payload.user
  }

  return null
}

function getArrayPayload(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items
  }

  return []
}

function mapCommunityDetail(post) {
  return {
    postId: post?.postId ?? post?.post_id ?? null,
    boardId: normalizeNumber(post?.boardId ?? post?.board_id),
    keywordId: normalizeNumber(post?.keywordId ?? post?.keyword_id),
    title: normalizeString(post?.title),
    content: normalizeString(post?.content),
    isAnonymous: typeof post?.isAnonymous === 'boolean' ? post.isAnonymous : Boolean(post?.is_anonymous),
    mbtiLabel: normalizeString(post?.authorMombtiResultType ?? post?.author_mombti_result_type) || 'MBTI',
    keywordLabel: normalizeString(post?.keywordName ?? post?.keyword_name) || '키워드',
    likeCount: normalizeNumber(post?.likeCount ?? post?.like_count) ?? 0,
    isLikedByCurrentUser: normalizeOptionalBoolean(
      post?.likedByMe ??
        post?.liked_by_me ??
        post?.isLikedByCurrentUser ??
        post?.is_liked_by_current_user ??
        post?.likedByCurrentUser ??
        post?.liked_by_current_user ??
        post?.isLiked ??
        post?.is_liked
    ),
    commentCount: normalizeNumber(post?.commentCount ?? post?.comment_count) ?? 0,
    elapsedTimeText: normalizeString(post?.elapsedTimeText ?? post?.elapsed_time_text),
    authorUserId: normalizeNumber(post?.authorUserId ?? post?.author_user_id),
    authorUsername: normalizeString(post?.authorUsername ?? post?.author_username) || '',
  }
}

function mapCommunityComment(comment) {
  return {
    commentId: comment?.commentId ?? comment?.comment_id ?? null,
    authorUserId: normalizeNumber(comment?.authorUserId ?? comment?.author_user_id),
    mbtiLabel:
      normalizeString(
        comment?.authorMombtiResultType ??
          comment?.author_mombti_result_type ??
          comment?.mombtiResultType ??
          comment?.mombti_result_type
      ) || 'MBTI',
    authorUsername: normalizeString(comment?.authorUsername ?? comment?.author_username) || '익명',
    content: normalizeString(comment?.content),
    elapsedTimeText: normalizeString(comment?.elapsedTimeText ?? comment?.elapsed_time_text),
  }
}

function buildCommunityListUpdate(detail, fallbackLikedByMe = false) {
  if (!detail?.postId) {
    return null
  }

  const resolvedLikedByMe =
    typeof detail.isLikedByCurrentUser === 'boolean' ? detail.isLikedByCurrentUser : fallbackLikedByMe

  return {
    postId: detail.postId,
    boardId: detail.boardId,
    keywordId: detail.keywordId,
    title: detail.title,
    content: detail.content,
    authorUserId: detail.authorUserId,
    authorUsername: detail.authorUsername,
    mbtiLabel: detail.mbtiLabel,
    likeCount: detail.likeCount,
    likedByMe: resolvedLikedByMe,
    isLikedByCurrentUser: resolvedLikedByMe,
    commentCount: detail.commentCount,
    elapsedTimeText: detail.elapsedTimeText,
  }
}

function buildCachedCommunityDetailValue(detail, comments, fallbackLikedByMe = false) {
  const resolvedLikedByMe =
    typeof detail?.isLikedByCurrentUser === 'boolean' ? detail.isLikedByCurrentUser : fallbackLikedByMe

  return {
    detail: {
      ...detail,
      isLikedByCurrentUser: resolvedLikedByMe,
    },
    comments,
  }
}

async function fetchCommunityPostDetail(postId, userId) {
  const query = new URLSearchParams()

  if (userId !== null && userId !== undefined) {
    query.set('userId', String(userId))
  }

  const response = await fetch(
    `${API_BASE_URL}/api/v1/community/posts/${postId}${query.toString() ? `?${query.toString()}` : ''}`
  )

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to fetch community post: ${response.status}`
    throw new Error(errorMessage)
  }

  const payload = await response.json()
  const detail = getObjectPayload(payload)

  if (!detail) {
    throw new Error('게시글 데이터를 찾을 수 없어요.')
  }

  const mappedDetail = mapCommunityDetail(detail)

  if (!mappedDetail.authorUserId) {
    return mappedDetail
  }

  try {
    const authorResponse = await fetch(`${API_BASE_URL}/api/v1/users/${mappedDetail.authorUserId}`)

    if (!authorResponse.ok) {
      return mappedDetail
    }

    const authorPayload = await authorResponse.json()
    const authorUsername = normalizeString(getUserPayload(authorPayload)?.username)

    return {
      ...mappedDetail,
      authorUsername,
    }
  } catch {
    return mappedDetail
  }
}

async function fetchCommunityPostComments(postId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/community/posts/${postId}/comments`)

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to fetch community comments: ${response.status}`
    throw new Error(errorMessage)
  }

  const payload = await response.json()
  return getArrayPayload(payload).map(mapCommunityComment)
}

async function fetchUserCommentMombtiLabel(userId) {
  if (!userId) {
    return ''
  }

  try {
    const query = new URLSearchParams({
      userId: String(userId),
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/mombti/attempts/latest?${query.toString()}`)

    if (!response.ok) {
      return ''
    }

    const payload = await response.json()
    const latestCompletedAttempt = getLatestCompletedMombtiAttemptFromPayload(payload)
    return getMombtiResultType(latestCompletedAttempt)
  } catch {
    return ''
  }
}

async function enrichCommentMombtiLabels(comments) {
  const authorIds = [...new Set(comments.map((comment) => comment.authorUserId).filter(Boolean))]

  if (!authorIds.length) {
    return comments
  }

  const mbtiEntries = await Promise.all(
    authorIds.map(async (authorId) => [authorId, await fetchUserCommentMombtiLabel(authorId)])
  )
  const mbtiByAuthorId = new Map(mbtiEntries)

  return comments.map((comment) => ({
    ...comment,
    mbtiLabel: normalizeString(mbtiByAuthorId.get(comment.authorUserId)) || comment.mbtiLabel || 'MBTI',
  }))
}

async function createCommunityPostComment(postId, authorUserId, content) {
  const response = await fetch(`${API_BASE_URL}/api/v1/community/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authorUserId,
      content,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to create community comment: ${response.status}`
    throw new Error(errorMessage)
  }
}

async function updateCommunityComment(commentId, authorUserId, content) {
  const response = await fetch(`${API_BASE_URL}/api/v1/community/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      authorUserId,
      content,
    }),
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to update community comment: ${response.status}`
    throw new Error(errorMessage)
  }
}

async function deleteCommunityComment(commentId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/community/comments/${commentId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to delete community comment: ${response.status}`
    throw new Error(errorMessage)
  }
}

async function deleteCommunityPost(postId, authorUserId) {
  const query = new URLSearchParams({
    authorUserId: String(authorUserId),
  })
  const response = await fetch(`${API_BASE_URL}/api/v1/community/posts/${postId}?${query.toString()}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to delete community post: ${response.status}`
    throw new Error(errorMessage)
  }
}

async function createCommunityPostLike(postId, userId) {
  const query = new URLSearchParams({
    userId: String(userId),
  })
  const response = await fetch(`${API_BASE_URL}/api/v1/community/posts/${postId}/likes?${query.toString()}`, {
    method: 'POST',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to create community like: ${response.status}`
    throw new Error(errorMessage)
  }
}

async function deleteCommunityPostLike(postId, userId) {
  const query = new URLSearchParams({
    userId: String(userId),
  })
  const response = await fetch(`${API_BASE_URL}/api/v1/community/posts/${postId}/likes?${query.toString()}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null)
    const errorMessage = errorPayload?.message ?? `Failed to delete community like: ${response.status}`
    throw new Error(errorMessage)
  }
}

function CommunityDetailScreen({ postId, userId, onBack, onOpenHome, onOpenDevice, onOpenMy, onEdit, onDeleted }) {
  const [detail, setDetail] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingCommentInput, setEditingCommentInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingComment, setIsUpdatingComment] = useState(false)
  const [deletingCommentId, setDeletingCommentId] = useState(null)
  const [isUpdatingLike, setIsUpdatingLike] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false)

  const refreshDetailData = async () => {
    if (!postId) {
      return
    }

    const [nextDetail, nextComments] = await Promise.all([
      fetchCommunityPostDetail(postId, userId),
      fetchCommunityPostComments(postId),
    ])

    const nextCommentsWithMombti = await enrichCommentMombtiLabels(nextComments)
    const resolvedLikedByMe =
      typeof nextDetail.isLikedByCurrentUser === 'boolean' ? nextDetail.isLikedByCurrentUser : isLiked

    setDetail({
      ...nextDetail,
      isLikedByCurrentUser: resolvedLikedByMe,
    })
    setIsLiked(resolvedLikedByMe)
    setComments(nextCommentsWithMombti)
    writeCachedCommunityDetail(postId, buildCachedCommunityDetailValue(nextDetail, nextCommentsWithMombti, resolvedLikedByMe))

    const listUpdate = buildCommunityListUpdate(nextDetail, resolvedLikedByMe)

    if (listUpdate) {
      upsertCommunityPostInCachedLists(listUpdate)
    }
  }

  useEffect(() => {
    if (!postId) {
      setDetail(null)
      setComments([])
      setErrorMessage('게시글을 찾을 수 없어요.')
      return
    }

    let isMounted = true
    const cachedValue = readCachedCommunityDetail(postId)

    if (cachedValue?.detail) {
      setDetail(cachedValue.detail)
      setIsLiked(Boolean(cachedValue.detail.isLikedByCurrentUser))
      setComments(Array.isArray(cachedValue.comments) ? cachedValue.comments : [])
      setErrorMessage('')
    }

    setIsLoading(!cachedValue?.detail)
    setErrorMessage('')
    setIsActionMenuOpen(false)
    setEditingCommentId(null)
    setEditingCommentInput('')

    Promise.all([fetchCommunityPostDetail(postId, userId), fetchCommunityPostComments(postId)])
      .then(async ([nextDetail, nextComments]) => {
        if (!isMounted) {
          return
        }

        const nextCommentsWithMombti = await enrichCommentMombtiLabels(nextComments)
        const resolvedLikedByMe =
          typeof nextDetail.isLikedByCurrentUser === 'boolean' ? nextDetail.isLikedByCurrentUser : isLiked

        if (!isMounted) {
          return
        }

        setDetail({
          ...nextDetail,
          isLikedByCurrentUser: resolvedLikedByMe,
        })
        setIsLiked(resolvedLikedByMe)
        setComments(nextCommentsWithMombti)
        writeCachedCommunityDetail(postId, buildCachedCommunityDetailValue(nextDetail, nextCommentsWithMombti, resolvedLikedByMe))

        const listUpdate = buildCommunityListUpdate(nextDetail, resolvedLikedByMe)

        if (listUpdate) {
          upsertCommunityPostInCachedLists(listUpdate)
        }
      })
      .catch((error) => {
        console.error(error)

        if (!isMounted) {
          return
        }

        if (!cachedValue?.detail) {
          setDetail(null)
          setComments([])
          setErrorMessage(error instanceof Error ? error.message : '게시글을 불러오지 못했어요.')
        }
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [postId])

  const isOwner = Boolean(detail && userId === detail.authorUserId)

  const handleSubmitComment = async () => {
    if (!postId || isSubmittingComment || !commentInput.trim()) {
      return
    }

    try {
      setIsSubmittingComment(true)
      await createCommunityPostComment(postId, userId, commentInput.trim())
      await refreshDetailData()
      setCommentInput('')
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '댓글 등록 중 문제가 생겼어요.')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStartCommentEdit = (comment) => {
    setEditingCommentId(comment.commentId)
    setEditingCommentInput(comment.content)
  }

  const handleCancelCommentEdit = () => {
    setEditingCommentId(null)
    setEditingCommentInput('')
  }

  const handleSaveCommentEdit = async () => {
    if (!editingCommentId || isUpdatingComment || !editingCommentInput.trim()) {
      return
    }

    try {
      setIsUpdatingComment(true)
      await updateCommunityComment(editingCommentId, userId, editingCommentInput.trim())
      await refreshDetailData()
      handleCancelCommentEdit()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '댓글 수정 중 문제가 생겼어요.')
    } finally {
      setIsUpdatingComment(false)
    }
  }

  const handleDeleteComment = async (commentId) => {
    if (!commentId || deletingCommentId) {
      return
    }

    try {
      setDeletingCommentId(commentId)
      await deleteCommunityComment(commentId)
      await refreshDetailData()

      if (editingCommentId === commentId) {
        handleCancelCommentEdit()
      }
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '댓글 삭제 중 문제가 생겼어요.')
    } finally {
      setDeletingCommentId(null)
    }
  }

  const handleEditPost = () => {
    if (!detail) {
      return
    }

    setIsActionMenuOpen(false)
    onEdit?.({
      postId: detail.postId,
      boardId: detail.boardId,
      keywordId: detail.keywordId,
      title: detail.title,
      content: detail.content,
      isAnonymous: detail.isAnonymous,
      authorUserId: detail.authorUserId,
    })
  }

  const handleDeletePost = async () => {
    if (!detail?.postId || !detail?.authorUserId) {
      return
    }

    const shouldDelete = window.confirm('게시글을 삭제할까요?')

    if (!shouldDelete) {
      return
    }

    try {
      await deleteCommunityPost(detail.postId, detail.authorUserId)
      removeCachedCommunityDetail(detail.postId)
      removeCommunityPostFromCachedLists(detail.postId)
      setIsActionMenuOpen(false)
      onDeleted?.()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '게시글 삭제 중 문제가 생겼어요.')
    }
  }

  const handleToggleLike = async () => {
    if (!detail?.postId || isUpdatingLike) {
      return
    }

    try {
      setIsUpdatingLike(true)
      const nextIsLiked = !isLiked
      const nextLikeCount = Math.max(0, (detail.likeCount ?? 0) + (nextIsLiked ? 1 : -1))
      const optimisticDetail = {
        ...detail,
        likeCount: nextLikeCount,
        isLikedByCurrentUser: nextIsLiked,
      }

      if (isLiked) {
        await deleteCommunityPostLike(detail.postId, userId)
      } else {
        await createCommunityPostLike(detail.postId, userId)
      }

      setDetail(optimisticDetail)
      setIsLiked(nextIsLiked)
      writeCachedCommunityDetail(
        detail.postId,
        buildCachedCommunityDetailValue(optimisticDetail, comments, nextIsLiked),
      )
      const optimisticListUpdate = buildCommunityListUpdate(optimisticDetail, nextIsLiked)

      if (optimisticListUpdate) {
        upsertCommunityPostInCachedLists(optimisticListUpdate)
      }

      await refreshDetailData()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '공감 처리 중 문제가 생겼어요.')
    } finally {
      setIsUpdatingLike(false)
    }
  }

  return (
    <div className="community-detail-screen">
      <header className="community-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>커뮤니티</h1>
        {isOwner ? (
          <button
            type="button"
            className="my-icon-button"
            aria-label="게시글 메뉴 열기"
            onClick={() => setIsActionMenuOpen(true)}
          >
            <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
          </button>
        ) : (
          <span className="community-detail-header-spacer" aria-hidden="true" />
        )}
      </header>

      <div className="community-content community-detail-content">
        {isLoading ? (
          <div className="community-empty-state">
            <strong>게시글을 불러오는 중이에요.</strong>
          </div>
        ) : errorMessage ? (
          <div className="community-empty-state">
            <strong>{errorMessage}</strong>
          </div>
        ) : detail ? (
          <>
            <section className="community-detail-card">
              <div className="community-detail-card-header">
                <h2>{detail.title || '제목'}</h2>
                <div className="community-detail-header-meta">
                  <div className="community-post-tags community-detail-tags">
                    <span className="community-tag community-tag--mbti">{detail.mbtiLabel}</span>
                    <span className="community-tag community-tag--board community-tag--keyword">{detail.keywordLabel}</span>
                  </div>
                  <span className="community-detail-author-name">{detail.authorUsername || '익명'}</span>
                </div>
              </div>

              <div className="community-detail-divider" />

              <div className="community-detail-body">
                <p>{detail.content || '내용이 없어요.'}</p>
              </div>

              <div className="community-detail-reaction-strip">
                <button
                  type="button"
                  className={`community-detail-reaction-item ${isLiked ? 'is-active' : ''}`}
                  onClick={handleToggleLike}
                  disabled={isUpdatingLike}
                >
                  <HeartIcon isActive={isLiked} />
                  <span>공감</span>
                  <strong>{detail.likeCount}</strong>
                </button>
                <div className="community-detail-reaction-divider" />
                <div className="community-detail-reaction-item">
                  <CommentIcon />
                  <span>댓글</span>
                  <strong>{detail.commentCount}</strong>
                </div>
              </div>
            </section>

            <div className="community-detail-comment-list">
              {comments.length ? (
                comments.map((comment) => {
                  const isCommentOwner = userId === comment.authorUserId
                  const isEditing = editingCommentId === comment.commentId

                  return (
                    <section key={comment.commentId ?? `${comment.authorUserId}-${comment.elapsedTimeText}`} className="community-detail-meta-card">
                      <div className="community-detail-meta-top">
                        <div className="community-detail-meta-author">
                          <span className="community-tag community-tag--outline">{comment.mbtiLabel || 'MBTI'}</span>
                          <strong>익명</strong>
                        </div>

                        <div className="community-detail-meta-right">
                          <span className="community-detail-time">{comment.elapsedTimeText || ''}</span>
                          {isCommentOwner ? (
                            <div className="pregnancy-diary-actions community-detail-comment-actions">
                              <button
                                type="button"
                                className="pregnancy-diary-action pregnancy-diary-action--edit"
                                aria-label="댓글 수정"
                                onClick={() => handleStartCommentEdit(comment)}
                                disabled={isUpdatingComment || Boolean(deletingCommentId)}
                              >
                                <img src={commentEditActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                              </button>
                              <button
                                type="button"
                                className="pregnancy-diary-action pregnancy-diary-action--delete"
                                aria-label="댓글 삭제"
                                onClick={() => handleDeleteComment(comment.commentId)}
                                disabled={deletingCommentId === comment.commentId || isUpdatingComment}
                              >
                                <img src={commentDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {isEditing ? (
                        <>
                          <textarea
                            value={editingCommentInput}
                            onChange={(event) => setEditingCommentInput(event.target.value)}
                            className="community-detail-comment-edit-input"
                            aria-label="댓글 수정 입력"
                          />
                          <div className="community-detail-comment-edit-actions">
                            <button
                              type="button"
                              className="community-detail-comment-edit-button is-secondary"
                              onClick={handleCancelCommentEdit}
                              disabled={isUpdatingComment}
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              className="community-detail-comment-edit-button is-primary"
                              onClick={handleSaveCommentEdit}
                              disabled={isUpdatingComment || !editingCommentInput.trim()}
                            >
                              {isUpdatingComment ? '저장중' : '저장'}
                            </button>
                          </div>
                        </>
                      ) : (
                        <p className="community-detail-meta-copy">{comment.content || '댓글 내용이 없어요.'}</p>
                      )}
                    </section>
                  )
                })
              ) : (
                <section className="community-detail-meta-card community-detail-comment-empty">
                  <p className="community-detail-meta-copy">아직 댓글이 없어요. 첫 댓글을 남겨보세요.</p>
                </section>
              )}
            </div>
          </>
        ) : null}
      </div>

      {!isLoading && !errorMessage && detail ? (
        <section className="community-detail-comment-form">
          <input
            type="text"
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            className="community-detail-comment-input"
            placeholder="댓글을 입력하세요"
            aria-label="댓글 입력"
          />
          <button
            type="button"
            className="my-name-edit community-detail-comment-submit"
            aria-label="댓글 등록"
            onClick={handleSubmitComment}
            disabled={isSubmittingComment}
          >
            <PencilIcon />
          </button>
        </section>
      ) : null}

      <div className="community-bottom-bar" />

      <nav className="parent-mode-bottom-nav community-bottom-nav" aria-label="커뮤니티 하단 메뉴">
        {NAV_ITEMS.map((item) => {
          const handleClick =
            item.key === 'home'
              ? onOpenHome
              : item.key === 'device'
                ? onOpenDevice
                : item.key === 'my'
                  ? onOpenMy
                  : undefined

          return (
            <button
              key={item.key}
              type="button"
              className={`parent-mode-nav-item ${item.key === 'community' ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={item.key === 'community' ? 'page' : undefined}
              onClick={handleClick}
            >
              <span className="parent-mode-nav-icon-frame" aria-hidden="true">
                <img src={item.icon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
              </span>
              <span className="parent-mode-nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {isOwner && isActionMenuOpen ? (
        <>
          <button
            type="button"
            className="community-detail-action-overlay"
            aria-label="게시글 메뉴 닫기"
            onClick={() => setIsActionMenuOpen(false)}
          />
          <section className="community-detail-action-sheet" role="dialog" aria-modal="true" aria-label="게시글 관리">
            <button type="button" className="community-detail-action-button" onClick={handleEditPost}>
              수정하기
            </button>
            <button type="button" className="community-detail-action-button" onClick={handleDeletePost}>
              삭제하기
            </button>
          </section>
        </>
      ) : null}
    </div>
  )
}

export default CommunityDetailScreen

