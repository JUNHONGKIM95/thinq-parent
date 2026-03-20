import { useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import keywordActiveBackground from '@shared-assets/srg/bold.svg'
import { API_BASE_URL } from '../../config/api'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function DownIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="m3 6 5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MediaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7 3.8h4.1l1 1.8H17A3.2 3.2 0 0 1 20.2 8v8A3.2 3.2 0 0 1 17 19.2H7A3.2 3.2 0 0 1 3.8 16V8A3.2 3.2 0 0 1 7 4.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5 18 9 14l3 3 4-5 3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

const BOARD_OPTIONS = [
  { id: 1, label: '임신 수다' },
  { id: 2, label: '정보/고민' },
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

const COMMUNITY_RULES = [
  {
    title: '1. 서로를 존중해주세요',
    bullets: [
      '모든 회원이 안전하게 이야기할 수 있도록 따뜻한 말투로 소통해주세요.',
      '비난, 조롱, 공격적인 표현은 금지됩니다.',
    ],
  },
  {
    title: '2. 민감한 주제를 배려해주세요',
    bullets: [
      '임신과 출산은 개인차가 큰 만큼 서로의 상황을 비교하거나 단정하지 말아주세요.',
      '다른 사람에게 불안감을 과하게 주는 표현은 지양해주세요.',
    ],
  },
  {
    title: '3. 개인정보를 보호해주세요',
    bullets: [
      '이름, 연락처, 병원 정보 등 민감한 개인정보는 공유하지 말아주세요.',
      '타인의 사연이나 사진을 동의 없이 올리는 행위는 금지됩니다.',
    ],
  },
]

function CommunityWriteScreen({ userId, onBack, onSuccess }) {
  const [openMenu, setOpenMenu] = useState(null)
  const [selectedBoardId, setSelectedBoardId] = useState(null)
  const [selectedKeywordId, setSelectedKeywordId] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const selectedBoard = BOARD_OPTIONS.find((item) => item.id === selectedBoardId) ?? null
  const selectedKeyword = KEYWORD_OPTIONS.find((item) => item.id === selectedKeywordId) ?? null

  const selectOption = (type, value) => {
    if (type === 'board') {
      setSelectedBoardId(value)
    }

    if (type === 'keyword') {
      setSelectedKeywordId(value)
    }

    setOpenMenu(null)
  }

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    if (selectedBoardId === null || selectedKeywordId === null || !title.trim() || !content.trim()) {
      window.alert('게시판, 키워드, 제목, 내용을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`${API_BASE_URL}/api/v1/community/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorUserId: userId,
          boardId: selectedBoardId,
          keywordId: selectedKeywordId,
          title: title.trim(),
          content: content.trim(),
          isAnonymous: false,
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const errorMessage = errorPayload?.message ?? `Failed to create community post: ${response.status}`
        throw new Error(errorMessage)
      }

      onSuccess?.()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '게시글 저장 중 문제가 생겼어요. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="community-write-screen">
      <header className="community-write-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>

        <div className="community-write-header-actions">
          <div className="community-write-select">
            <button
              type="button"
              className="community-search-trigger community-write-select-trigger"
              onClick={() => setOpenMenu((current) => (current === 'board' ? null : 'board'))}
              aria-expanded={openMenu === 'board'}
              aria-haspopup="listbox"
            >
              <span>{selectedBoard?.label || '게시판'}</span>
              <DownIcon />
            </button>

            {openMenu === 'board' ? (
              <div className="community-keyword-menu community-write-dropdown" role="listbox" aria-label="게시판 선택">
                {BOARD_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selectedBoardId === item.id}
                    className={`community-keyword-item ${selectedBoardId === item.id ? 'is-active' : ''}`}
                    onClick={() => selectOption('board', item.id)}
                  >
                    {selectedBoardId === item.id ? (
                      <img src={keywordActiveBackground} alt="" className="community-keyword-item-bg" aria-hidden="true" />
                    ) : null}
                    <span className="community-keyword-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="community-write-select">
            <button
              type="button"
              className="community-search-trigger community-write-select-trigger"
              onClick={() => setOpenMenu((current) => (current === 'keyword' ? null : 'keyword'))}
              aria-expanded={openMenu === 'keyword'}
              aria-haspopup="listbox"
            >
              <span>{selectedKeyword?.label || '키워드'}</span>
              <DownIcon />
            </button>

            {openMenu === 'keyword' ? (
              <div className="community-keyword-menu community-write-dropdown" role="listbox" aria-label="키워드 선택">
                {KEYWORD_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={selectedKeywordId === item.id}
                    className={`community-keyword-item ${selectedKeywordId === item.id ? 'is-active' : ''}`}
                    onClick={() => selectOption('keyword', item.id)}
                  >
                    {selectedKeywordId === item.id ? (
                      <img src={keywordActiveBackground} alt="" className="community-keyword-item-bg" aria-hidden="true" />
                    ) : null}
                    <span className="community-keyword-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <button
            type="button"
            className="community-write-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중' : '글쓰기'}
          </button>
        </div>
      </header>

      {openMenu ? (
        <button
          type="button"
          className="community-write-overlay"
          aria-label="드롭다운 닫기"
          onClick={() => setOpenMenu(null)}
        />
      ) : null}

      <div className="community-write-content">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="community-write-title-input"
          placeholder="제목을 입력하세요"
          aria-label="제목 입력"
        />

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="community-write-body-input"
          placeholder="자유로운 이야기를 나눠보세요"
          aria-label="본문 입력"
        />

        <section className="community-write-rules" aria-label="커뮤니티 이용 규칙">
          <p className="community-write-rules-heading">임신 게시판 커뮤니티 이용규칙</p>
          <p className="community-write-rules-intro">
            안전하고 편안한 소통을 위해 아래 이용규칙을 꼭 지켜주세요.
          </p>

          {COMMUNITY_RULES.map((rule) => (
            <div key={rule.title} className="community-write-rule-block">
              <p className="community-write-rule-title">{rule.title}</p>
              {rule.bullets.map((bullet) => (
                <p key={bullet} className="community-write-rule-bullet">
                  {`• ${bullet}`}
                </p>
              ))}
            </div>
          ))}
        </section>
      </div>

      <footer className="community-write-footer">
        <button type="button" className="community-write-media-button" aria-label="이미지 추가">
          <MediaIcon />
        </button>

        <button type="button" className="community-write-cancel-button" onClick={onBack}>
          취소
        </button>
      </footer>
    </div>
  )
}

export default CommunityWriteScreen
