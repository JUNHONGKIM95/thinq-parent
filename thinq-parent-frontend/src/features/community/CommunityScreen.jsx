import { useEffect, useMemo, useState } from 'react'
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
  { key: 'all', label: '전체' },
  { key: 'pregnancy-talk', label: '임신 수다' },
  { key: 'info-concern', label: '정보/고민' },
]

const KEYWORD_ITEMS = ['증상기록', '아기상태', '진료정보', '건강관리', '출산준비', '사회지원', '감정기록']

const BASE_POSTS = [
  {
    category: 'pregnancy-talk',
    boardName: '임신 수다',
    title: '입덧이 심한 날은 다들 어떻게 버티세요?',
    excerpt: '오늘은 유난히 속이 울렁거려서 쉬엄쉬엄 보내고 있어요.',
    keyword: '증상기록',
    isMomBtiMatch: true,
  },
  {
    category: 'pregnancy-talk',
    boardName: '임신 수다',
    title: '아기 태동 느껴진 날부터 기록하는 중이에요',
    excerpt: '비슷한 시기 분들은 언제부터 자주 느끼셨어요?',
    keyword: '아기상태',
    isMomBtiMatch: false,
  },
  {
    category: 'info-concern',
    boardName: '정보/고민',
    title: '정기 검진 전 준비하면 좋은 체크리스트 있을까요?',
    excerpt: '질문 메모해두면 진료실에서 덜 긴장되더라고요.',
    keyword: '진료정보',
    isMomBtiMatch: true,
  },
  {
    category: 'info-concern',
    boardName: '정보/고민',
    title: '철분제 먹는 시간대 다들 어떻게 잡으세요?',
    excerpt: '속 불편함이 덜한 루틴이 있으면 참고하고 싶어요.',
    keyword: '건강관리',
    isMomBtiMatch: true,
  },
  {
    category: 'info-concern',
    boardName: '정보/고민',
    title: '출산 가방은 몇 주차부터 챙기기 시작했나요?',
    excerpt: '빠뜨리기 쉬운 준비물이 있으면 같이 알려주세요.',
    keyword: '출산준비',
    isMomBtiMatch: false,
  },
]

const COMMUNITY_POSTS = Array.from({ length: 25 }, (_, index) => {
  const basePost = BASE_POSTS[index % BASE_POSTS.length]

  return {
    key: `community-post-${index + 1}`,
    ...basePost,
    likes: 3 + (index % 4),
    comments: index % 3,
    timeAgo: `${(index % 5) + 1}분전`,
  }
})

const POSTS_PER_PAGE = 5

function CommunityScreen({ onBack, onOpenHome, onOpenDevice, onOpenMy, onOpenWrite, canWrite = true }) {
  const [selectedTab, setSelectedTab] = useState('all')
  const [isMomBtiOnly, setIsMomBtiOnly] = useState(true)
  const [selectedKeyword, setSelectedKeyword] = useState('')
  const [isKeywordMenuOpen, setIsKeywordMenuOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPosts = useMemo(() => {
    return COMMUNITY_POSTS.filter((post) => {
      if (selectedTab !== 'all' && post.category !== selectedTab) {
        return false
      }

      if (isMomBtiOnly && !post.isMomBtiMatch) {
        return false
      }

      if (selectedTab === 'info-concern' && selectedKeyword && post.keyword !== selectedKeyword) {
        return false
      }

      return true
    })
  }, [isMomBtiOnly, selectedKeyword, selectedTab])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE))
  const pagedPosts = filteredPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE)

  useEffect(() => {
    setCurrentPage(1)
  }, [isMomBtiOnly, selectedKeyword, selectedTab])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

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
                <span>{selectedKeyword || '검색 키워드'}</span>
                <SearchIcon />
              </button>

              {isKeywordMenuOpen ? (
                <div className="community-keyword-menu" role="listbox" aria-label="검색 키워드 선택">
                  {KEYWORD_ITEMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={selectedKeyword === item}
                      className={`community-keyword-item ${selectedKeyword === item ? 'is-active' : ''}`}
                      onClick={() => {
                        setSelectedKeyword((currentKeyword) => (currentKeyword === item ? '' : item))
                        setIsKeywordMenuOpen(false)
                      }}
                    >
                      {selectedKeyword === item ? (
                        <img
                          src={keywordActiveBackground}
                          alt=""
                          className="community-keyword-item-bg"
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className="community-keyword-item-label">{item}</span>
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
              <span>내 MomBTI만</span>
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
          {pagedPosts.length ? (
            pagedPosts.map((post) => (
              <article className="community-post-card" key={post.key}>
                <div className="community-post-topline">
                  <div className="community-post-tags">
                    <span className="community-tag community-tag--mbti">MBTI</span>
                    <span className="community-tag community-tag--board">{post.boardName}</span>
                  </div>
                </div>

                <h2>{post.title}</h2>
                <p>{post.excerpt}</p>

                <div className="community-post-meta">
                  <div className="community-post-reactions">
                    <span>
                      <HeartIcon />
                      {post.likes}
                    </span>
                    <span>
                      <CommentIcon />
                      {post.comments}
                    </span>
                  </div>
                  <span>{post.timeAgo}</span>
                </div>
              </article>
            ))
          ) : (
            <div className="community-empty-state">
              <strong>조건에 맞는 글이 아직 없어요.</strong>
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
            item.key === 'home' ? onOpenHome : item.key === 'device' ? onOpenDevice : item.key === 'my' ? onOpenMy : undefined

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
