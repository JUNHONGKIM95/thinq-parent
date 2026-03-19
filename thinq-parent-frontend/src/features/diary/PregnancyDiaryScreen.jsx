import { useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import diaryExampleImage from '@shared-assets/srg/diary_example.svg'
import diaryEditActionIcon from '@shared-assets/srg/fi-rr-pencil.svg'
import diaryDeleteActionIcon from '@shared-assets/srg/fi-rr-trash.svg'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function PencilIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
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

function PaginationIcon({ direction, double = false }) {
  const path = direction === 'left' ? 'M14 7 9 12l5 5' : 'M10 7l5 5-5 5'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {double ? (
        <path
          d={direction === 'left' ? 'M9 7 4 12l5 5' : 'M15 7l5 5-5 5'}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}
    </svg>
  )
}

const DIARY_ITEMS = Array.from({ length: 5 }, (_, index) => ({
  id: `pregnancy-diary-${index + 1}`,
  image: diaryExampleImage,
  date: '2026/03/28',
  author: '요정이맘',
  title: '일기제목이철구',
}))

function PregnancyDiaryScreen({ onBack, onOpenWrite }) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 5

  return (
    <div className="pregnancy-diary-screen">
      <header className="pregnancy-diary-header">
        <button type="button" className="my-icon-button" aria-label="뒤로가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>임신 일기</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="pregnancy-diary-content">
        <div className="pregnancy-diary-list">
          {DIARY_ITEMS.map((item) => (
            <article key={item.id} className="pregnancy-diary-card">
              <div className="pregnancy-diary-image-frame">
                <img src={item.image} alt="" className="pregnancy-diary-image" />
              </div>

              <div className="pregnancy-diary-meta-row">
                <span className="pregnancy-diary-date">{item.date}</span>
                <span className="pregnancy-diary-author">{item.author}</span>
              </div>

              <div className="pregnancy-diary-title-row">
                <h2>{item.title}</h2>
                <div className="pregnancy-diary-actions">
                  <button type="button" className="pregnancy-diary-action pregnancy-diary-action--edit" aria-label="일기 수정">
                    <img src={diaryEditActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                  </button>
                  <button type="button" className="pregnancy-diary-action pregnancy-diary-action--delete" aria-label="일기 삭제">
                    <img src={diaryDeleteActionIcon} alt="" className="pregnancy-diary-action-icon" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="pregnancy-diary-pagination">
          <button type="button" className="pregnancy-diary-pagination-button" aria-label="첫 페이지" onClick={() => setCurrentPage(1)}>
            <PaginationIcon direction="left" double />
          </button>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="이전 페이지"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          >
            <PaginationIcon direction="left" />
          </button>
          <span className="pregnancy-diary-pagination-current">{currentPage}</span>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="다음 페이지"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
          >
            <PaginationIcon direction="right" />
          </button>
          <button
            type="button"
            className="pregnancy-diary-pagination-button"
            aria-label="마지막 페이지"
            onClick={() => setCurrentPage(totalPages)}
          >
            <PaginationIcon direction="right" double />
          </button>
        </div>
      </div>

      <div className="pregnancy-diary-bottom-bar">
        <button type="button" className="pregnancy-diary-write-button" aria-label="일기 쓰기" onClick={onOpenWrite}>
          <PencilIcon className="pregnancy-diary-write-icon" />
        </button>
      </div>
    </div>
  )
}

export default PregnancyDiaryScreen
