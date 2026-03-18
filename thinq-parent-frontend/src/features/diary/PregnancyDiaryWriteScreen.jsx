import { useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import diaryHeartIcon from '@shared-assets/srg/diary_heart.svg'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function MediaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 7.5A2 2 0 0 1 6.5 5.5h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="10" r="1.4" fill="currentColor" />
      <path
        d="m7.5 16 3.3-3 2.6 2.2 2.1-1.9 2 2.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatDiaryDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}년 ${month}월 ${day}일`
}

function PregnancyDiaryWriteScreen({ onBack, babyNickname }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const diaryOwnerLabel = `${babyNickname || '아기'} 엄마`

  return (
    <div className="pregnancy-diary-write-screen">
      <button type="button" className="pregnancy-diary-write-back" aria-label="뒤로가기" onClick={onBack}>
        <BackIcon />
      </button>

      <section className="pregnancy-diary-write-card">
        <div className="pregnancy-diary-write-top">
          <span className="pregnancy-diary-write-heart" aria-hidden="true">
            <img src={diaryHeartIcon} alt="" className="pregnancy-diary-write-heart-icon" />
          </span>
          <strong>{diaryOwnerLabel}</strong>
          <span className="pregnancy-diary-write-dot" aria-hidden="true" />
        </div>

        <div className="pregnancy-diary-write-media">
          <MediaIcon />
        </div>

        <div className="pregnancy-diary-write-copy">
          <input
            type="text"
            className="pregnancy-diary-write-title-input"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="제목을 입력하세요"
            aria-label="일기 제목"
          />
          <span>{formatDiaryDate()}</span>
          <textarea
            className="pregnancy-diary-write-content-input"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder={'기록하고 싶은 오늘의 느낌은 무엇인가요?\n아기와 함께한 하루를 적어보세요.'}
            aria-label="일기 내용"
          />
        </div>

        <div className="pregnancy-diary-write-actions">
          <button type="button" className="pregnancy-diary-write-cancel" onClick={onBack}>
            작성취소
          </button>
          <button type="button" className="pregnancy-diary-write-submit">
            등록하기
          </button>
        </div>
      </section>
    </div>
  )
}

export default PregnancyDiaryWriteScreen
