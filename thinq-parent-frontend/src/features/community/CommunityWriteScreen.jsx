import { useEffect, useState } from 'react'
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

const COMMUNITY_RULE_SECTIONS = [
  {
    title: '1. 서로를 존중해주세요',
    bullets: [
      '모든 회원은 서로를 존중하는 말투로 소통해주세요.',
      '비난, 조롱, 공격적 표현, 반말 강요, 혐오 발언은 금지합니다.',
      '임신 주수, 출산 방식, 육아 방식, 가족 형태, 건강 상태에 대한 평가와 비교는 삼가주세요.',
    ],
  },
  {
    title: '2. 민감한 주제는 더욱 배려해주세요',
    bullets: [
      '유산, 난임, 조산, 임신 합병증, 산후 우울 등 민감한 경험이 포함된 글은 배려 있는 표현을 사용해주세요.',
      '자극적이거나 불안감을 과도하게 유발하는 표현은 지양해주세요.',
      '필요 시 제목에 말머리나 주의 문구를 함께 표시해주세요.',
    ],
  },
  {
    title: '3. 의료 정보는 개인 경험과 전문 정보로 구분해주세요',
    bullets: [
      '본인의 경험 공유는 가능하지만, 의료적 판단을 단정적으로 표현하지 말아주세요.',
      '약 복용, 검사 결과, 응급 증상, 치료 방법과 관련된 내용은 반드시 전문의 상담이 우선입니다.',
      '검증되지 않은 민간요법, 치료법, 허위 의학정보, 과장된 건강정보 게시를 금지합니다.',
    ],
  },
  {
    title: '4. 개인정보를 보호해주세요',
    bullets: [
      '본인 또는 타인의 실명, 연락처, 병원 정보, 주소, 초음파 사진 속 개인정보 등 민감한 정보는 노출하지 말아주세요.',
      '타인의 사연, 가족 이야기, 병원 상담 내용 등을 동의 없이 공유하는 행위는 금지합니다.',
    ],
  },
  {
    title: '5. 분쟁을 유발하는 글은 제한됩니다',
    bullets: [
      '특정 회원을 저격하거나 공개적으로 비난하는 글은 금지합니다.',
      '정치, 종교, 성별 갈등, 지역 갈등 등 게시판 목적과 무관한 논쟁성 주제는 제한될 수 있습니다.',
      '반복적인 시비, 도발, 감정싸움은 관리자 판단에 따라 제재될 수 있습니다.',
    ],
  },
  {
    title: '6. 홍보와 상업성 게시물은 금지합니다',
    bullets: [
      '병원, 조리원, 제품, 영양제, 보험, 클래스, 공동구매 등 상업적 홍보 목적의 글은 사전 허용 없이 게시할 수 없습니다.',
      '체험단 모집, 제휴 링크, 할인코드 공유, 판매 유도 게시물은 삭제될 수 있습니다.',
    ],
  },
  {
    title: '7. 게시판 주제에 맞게 작성해주세요',
    bullets: [
      '게시글은 말머리에 맞는 게시판에 작성해주세요.',
      '같은 내용의 반복 게시, 도배, 의미 없는 글, 과도한 이모지나 자극적 제목은 제한될 수 있습니다.',
      '질문글 작성 시 상황을 구체적으로 적어주시면 더 도움이 되는 답변을 받을 수 있습니다.',
    ],
  },
  {
    title: '8. 사진 및 이미지 업로드 시 주의해주세요',
    bullets: [
      '혐오감이나 불편함을 줄 수 있는 사진은 주의 표시 후 업로드해주세요.',
      '초음파 사진, 병원 기록지, 검사 결과지 등은 개인정보가 보이지 않도록 확인 후 올려주세요.',
      '타인의 사진이나 온라인 이미지는 무단 도용하지 말아주세요.',
    ],
  },
  {
    title: '9. 신고 및 제재 안내',
    bullets: [
      '이용규칙 위반 게시물이나 댓글은 관리자에 의해 수정, 이동, 삭제될 수 있습니다.',
      '반복 위반 시 경고, 일정 기간 이용 제한, 강제 탈퇴 등의 조치가 이루어질 수 있습니다.',
      '회원 간 문제가 발생할 경우 공개 다툼보다 신고 기능 또는 관리자 문의를 이용해주세요.',
    ],
  },
  {
    title: '10. 이 공간의 목적',
    bullets: [
      '이 게시판은 임신과 출산을 준비하거나 경험하는 분들이 정보를 나누고, 위로받고, 서로에게 힘이 되는 공간입니다.',
      '정확한 정보만큼이나 따뜻한 태도가 중요합니다. 모두가 안심하고 머물 수 있는 커뮤니티를 함께 만들어주세요.',
    ],
  },
]

function CommunityWriteScreen({ userId, onBack, onSuccess, initialPost = null }) {
  const [openMenu, setOpenMenu] = useState(null)
  const [selectedBoardId, setSelectedBoardId] = useState(initialPost?.boardId ?? null)
  const [selectedKeywordId, setSelectedKeywordId] = useState(initialPost?.keywordId ?? null)
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [content, setContent] = useState(initialPost?.content ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = Boolean(initialPost?.postId)

  const selectedBoard = BOARD_OPTIONS.find((item) => item.id === selectedBoardId) ?? null
  const selectedKeyword = KEYWORD_OPTIONS.find((item) => item.id === selectedKeywordId) ?? null

  useEffect(() => {
    setOpenMenu(null)
    setSelectedBoardId(initialPost?.boardId ?? null)
    setSelectedKeywordId(initialPost?.keywordId ?? null)
    setTitle(initialPost?.title ?? '')
    setContent(initialPost?.content ?? '')
  }, [initialPost])

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
      window.alert('게시판, 말머리, 제목, 내용을 모두 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(
        isEditMode ? `${API_BASE_URL}/api/v1/community/posts/${initialPost.postId}` : `${API_BASE_URL}/api/v1/community/posts`,
        {
          method: isEditMode ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            authorUserId: userId,
            boardId: selectedBoardId,
            keywordId: selectedKeywordId,
            title: title.trim(),
            content: content.trim(),
            isAnonymous: initialPost?.isAnonymous ?? false,
          }),
        },
      )

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const errorMessage = errorPayload?.message ?? `${isEditMode ? 'Failed to update' : 'Failed to create'} community post: ${response.status}`
        throw new Error(errorMessage)
      }

      onSuccess?.({
        postId: initialPost?.postId ?? null,
        boardId: selectedBoardId,
        keywordId: selectedKeywordId,
        title: title.trim(),
        content: content.trim(),
        isAnonymous: initialPost?.isAnonymous ?? false,
      })
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
              <span>{selectedKeyword?.label || '말머리'}</span>
              <DownIcon />
            </button>

            {openMenu === 'keyword' ? (
              <div className="community-keyword-menu community-write-dropdown" role="listbox" aria-label="말머리 선택">
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
          placeholder="제목을 입력하세요."
          aria-label="제목 입력"
        />

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          className="community-write-body-input"
          placeholder="자유로운 수다를 나누어보세요."
          aria-label="본문 입력"
        />

        <section className="community-write-rules" aria-label="커뮤니티 이용 규칙">
          <p className="community-write-rules-heading">임신 게시판 커뮤니티 이용규칙</p>

          <div className="community-write-rule-block">
            <p className="community-write-rules-intro">
              안전하고 편안한 소통 공간을 위해 아래 이용규칙을 꼭 지켜주세요.
            </p>

            {COMMUNITY_RULE_SECTIONS.map((rule) => (
              <div key={rule.title} className="community-write-rule-section">
                <p className="community-write-rule-title">{rule.title}</p>
                {rule.bullets.map((bullet) => (
                  <p key={bullet} className="community-write-rule-bullet">
                    {`• ${bullet}`}
                  </p>
                ))}
              </div>
            ))}
          </div>
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
