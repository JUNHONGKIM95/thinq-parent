import { useEffect, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import commentReactionIcon from '@shared-assets/srg/fi-rr-comment.svg'
import heartReactionIcon from '@shared-assets/srg/fi-rr-heart.svg'
import searchIcon from '@shared-assets/srg/fi-rr-search.svg'
import toggleOffIcon from '@shared-assets/srg/buttonoff.svg'
import toggleOnIcon from '@shared-assets/srg/buttonon.svg'
import keywordActiveBackground from '@shared-assets/srg/bold.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import plusIcon from '@shared-assets/srg/plusiconwhite.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import { API_BASE_URL } from '../../config/api'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function SearchIcon() {
  return <img src={searchIcon} alt="" aria-hidden="true" />
}

function PlusIcon() {
  return <img src={plusIcon} alt="" aria-hidden="true" />
}

function HeartIcon() {
  return <img src={heartReactionIcon} alt="" aria-hidden="true" />
}

function CommentIcon() {
  return <img src={commentReactionIcon} alt="" aria-hidden="true" />
}

function PaginationDoubleIcon({ direction = 'left' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={direction === 'right' ? 'is-right' : ''}>
      <path
        d="m14.5 6-6 6 6 6M19 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PaginationSingleIcon({ direction = 'left' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={direction === 'right' ? 'is-right' : ''}>
      <path
        d="m15 6-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: parentModeHomeIcon },
  { key: 'device', label: '가전육아', icon: parentModeDeviceIcon },
  { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon },
  { key: 'my', label: 'MY', icon: parentModeMyIcon },
]

const TAB_ITEMS = [
  { key: 'all', label: '전체', boardId: null },
  { key: 'pregnancy-talk', label: '임신 수다', boardId: 1 },
  { key: 'info-concern', label: '정보/고민', boardId: 2 },
]

const KEYWORD_OPTIONS = [
  { id: 1, label: '증상기록' },
  { id: 2, label: '아기상태' },
  { id: 3, label: '진료정보' },
  { id: 4, label: '건강관리' },
  { id: 5, label: '출산준비' },
  { id: 6, label: '사회지원' },
  { id: 7, label: '감정기록' },
]

const POSTS_PER_PAGE = 5

function normalizeString(value) {
  return String(value ?? '').trim()
}

function normalizeNumber(value) {
  const parsedValue = Number.parseInt(String(value ?? '').trim(), 10)
  return Number.isFinite(parsedValue) ? parsedValue : null
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

function getCommunityPostsPayload(payload) {
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

function getBoardLabel(post) {
  const boardId = normalizeNumber(post?.boardId ?? post?.board_id)

  if (boardId === 1) {
    return '임신 수다'
  }

  if (boardId === 2) {
    return '정보/고민'
  }

  return normalizeString(post?.boardName ?? post?.board_name) || '임신 수다'
}

function getMombtiLabel(post) {
  return normalizeString(post?.authorMombtiResultType ?? post?.author_mombti_result_type) || 'MBTI'
}

function mapCommunityPost(post, index) {
  const postId = post?.postId ?? post?.post_id ?? index
  const title = normalizeString(post?.title)
  const content =
    normalizeString(post?.contentPreview ?? post?.content_preview) || normalizeString(post?.content)

  return {
    key: `community-post-${postId}`,
    postId,
    authorUserId: normalizeNumber(post?.authorUserId ?? post?.author_user_id),
    authorUsername: normalizeString(post?.authorUsername ?? post?.author_username) || '',
    mbtiLabel: getMombtiLabel(post),
    boardLabel: getBoardLabel(post),
    title,
    content,
    likeCount: normalizeNumber(post?.likeCount ?? post?.like_count) ?? 0,
    commentCount: normalizeNumber(post?.commentCount ?? post?.comment_count) ?? 0,
    elapsedTimeText: normalizeString(post?.elapsedTimeText ?? post?.elapsed_time_text),
  }
}

async function fetchCommunityPosts({ boardId, keywordId, sameMombtiOnly, userId }) {
  const query = new URLSearchParams()

  if (boardId !== null && boardId !== undefined) {
    query.set('boardId', String(boardId))
  }

  if (keywordId !== null && keywordId !== undefined) {
    query.set('keywordId', String(keywordId))
  }

  if (sameMombtiOnly) {
    query.set('sameMombtiOnly', 'true')

    if (userId !== null && userId !== undefined) {
      query.set('userId', String(userId))
    }
  }

  const queryString = query.toString()
  const url = `${API_BASE_URL}/api/v1/community/posts${queryString ? `?${queryString}` : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch community posts: ${response.status}`)
  }

  const payload = await response.json()
  const mappedPosts = getCommunityPostsPayload(payload).map(mapCommunityPost)

  const uniqueAuthorIds = [...new Set(mappedPosts.map((post) => post.authorUserId).filter(Boolean))]
  const authorEntries = await Promise.all(
    uniqueAuthorIds.map(async (authorId) => {
      try {
        const authorResponse = await fetch(`${API_BASE_URL}/api/v1/users/${authorId}`)

        if (!authorResponse.ok) {
          return [authorId, '']
        }

        const authorPayload = await authorResponse.json()
        return [authorId, normalizeString(getUserPayload(authorPayload)?.username)]
      } catch {
        return [authorId, '']
      }
    })
  )
  const authorMap = new Map(authorEntries)

  return mappedPosts.map((post) => ({
    ...post,
    authorUsername: post.authorUsername || authorMap.get(post.authorUserId) || '익명',
  }))
}

function CommunityScreen({ userId, onBack, onOpenHome, onOpenDevice, onOpenMy, onOpenWrite, onOpenPost, canWrite = true }) {
  const [selectedTab, setSelectedTab] = useState('all')
  const [isMomBtiOnly, setIsMomBtiOnly] = useState(false)
  const [selectedKeywordId, setSelectedKeywordId] = useState(null)
  const [isKeywordMenuOpen, setIsKeywordMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [posts, setPosts] = useState([])
  const [isLoadingPosts, setIsLoadingPosts] = useState(false)

  const selectedKeywordOption = KEYWORD_OPTIONS.find((item) => item.id === selectedKeywordId) ?? null
  const selectedBoardId = TAB_ITEMS.find((item) => item.key === selectedTab)?.boardId ?? null

  useEffect(() => {
    let isMounted = true

    setIsLoadingPosts(true)

    fetchCommunityPosts({
      boardId: selectedBoardId,
      keywordId: selectedKeywordId,
      sameMombtiOnly: isMomBtiOnly,
      userId,
    })
      .then((nextPosts) => {
        if (!isMounted) {
          return
        }

        setPosts(nextPosts)
      })
      .catch((error) => {
        console.error(error)

        if (!isMounted) {
          return
        }

        setPosts([])
      })
      .finally(() => {
        if (!isMounted) {
          return
        }

        setIsLoadingPosts(false)
      })

    return () => {
      isMounted = false
    }
  }, [isMomBtiOnly, selectedBoardId, selectedKeywordId, userId])

  useEffect(() => {
    setCurrentPage(1)
  }, [isMomBtiOnly, selectedKeywordId, selectedTab])

  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE))
  const pagedPosts = posts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="community-screen">
      <header className="community-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>커뮤니티</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="community-content">
        <div className="community-controls">
          <div className="community-tab-row" role="tablist" aria-label="커뮤니티 분류">
            {TAB_ITEMS.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={selectedTab === item.key}
                className={`community-tab-button ${selectedTab === item.key ? 'is-active' : ''}`}
                onClick={() => {
                  setSelectedTab(item.key)
                  setIsKeywordMenuOpen(false)
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="community-filter-row">
            <div className="community-search-wrap">
              <button
                type="button"
                className="community-search-trigger"
                onClick={() => setIsKeywordMenuOpen((prev) => !prev)}
                aria-expanded={isKeywordMenuOpen}
                aria-haspopup="listbox"
              >
                <span>{selectedKeywordOption?.label || '검색 키워드'}</span>
                <SearchIcon />
              </button>

              {isKeywordMenuOpen ? (
                <div className="community-keyword-menu" role="listbox" aria-label="검색 키워드 선택">
                  {KEYWORD_OPTIONS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      aria-selected={selectedKeywordId === item.id}
                      className={`community-keyword-item ${selectedKeywordId === item.id ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedKeywordId((currentKeywordId) => (currentKeywordId === item.id ? null : item.id))
                        setIsKeywordMenuOpen(false)
                      }}
                    >
                      {selectedKeywordId === item.id ? (
                        <img
                          src={keywordActiveBackground}
                          alt=""
                          className="community-keyword-item-bg"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="community-keyword-item-label">{item.label}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              className={`community-mombti-toggle ${isMomBtiOnly ? 'is-active' : ''}`}
              aria-pressed={isMomBtiOnly}
              onClick={() => setIsMomBtiOnly((prev) => !prev)}
            >
              <span>같은 MomBTI만</span>
              <img
                src={isMomBtiOnly ? toggleOnIcon : toggleOffIcon}
                alt=""
                className="community-toggle-icon"
                aria-hidden="true"
              />
            </button>

            {!isKeywordMenuOpen && canWrite ? (
              <button type="button" className="community-write-button" onClick={onOpenWrite}>
                <span>글쓰기</span>
                <PlusIcon />
              </button>
            ) : null}
          </div>
        </div>

        {isKeywordMenuOpen ? (
          <button
            type="button"
            className="community-filter-overlay"
            aria-label="검색 키워드 메뉴 닫기"
            onClick={() => setIsKeywordMenuOpen(false)}
          />
        ) : null}

        <div className="community-post-list">
          {isLoadingPosts ? (
            <div className="community-empty-state">
              <strong>게시글을 불러오는 중이에요.</strong>
            </div>
          ) : pagedPosts.length ? (
            pagedPosts.map((post) => (
              <button
                type="button"
                className="community-post-card community-post-card--button"
                key={post.key}
                data-post-id={post.postId}
                onClick={() => onOpenPost?.(post.postId)}
              >
                <div className="community-post-topline">
                  <div className="community-post-tags">
                    <span className="community-tag community-tag--mbti">{post.mbtiLabel}</span>
                    <span className="community-tag community-tag--board">{post.boardLabel}</span>
                  </div>
                  <span className="community-post-author">{post.authorUsername || '??'}</span>
                </div>

                <h2>{post.title}</h2>
                <p>{post.content}</p>

                <div className="community-post-meta">
                  <div className="community-post-reactions">
                    <span>
                      <HeartIcon />
                      {post.likeCount}
                    </span>
                    <span>
                      <CommentIcon />
                      {post.commentCount}
                    </span>
                  </div>
                  <span>{post.elapsedTimeText}</span>
                </div>
              </button>
            ))
          ) : (
            <div className="community-empty-state">
              <strong>조건에 맞는 게시글이 아직 없어요.</strong>
              <p>필터를 조금만 바꾸면 더 많은 게시글을 볼 수 있어요.</p>
            </div>
          )}
        </div>

        <nav className="community-pagination" aria-label="커뮤니티 페이지 이동">
          <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage === 1} aria-label="첫 페이지">
            <PaginationDoubleIcon />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            aria-label="이전 페이지"
          >
            <PaginationSingleIcon />
          </button>

          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={currentPage === pageNumber ? 'is-active' : ''}
              onClick={() => setCurrentPage(pageNumber)}
              aria-current={currentPage === pageNumber ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            aria-label="다음 페이지"
          >
            <PaginationSingleIcon direction="right" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="마지막 페이지"
          >
            <PaginationDoubleIcon direction="right" />
          </button>
        </nav>
      </div>

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
    </div>
  )
}

export default CommunityScreen
