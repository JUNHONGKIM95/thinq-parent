import { useState } from 'react'
import menuIcon from '@shared-assets/srg/Menu.svg'
import { MOMB_TI_OPTIONS, mockMombtiQuestions } from '../../data/mockMombtiQuestions'

const QUESTIONS_PER_PAGE = 5

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function NextPageIcon() {
  return (
    <svg viewBox="0 0 26 23" aria-hidden="true">
      <path
        d="M1.8 11.5h16.6M13.6 2.3 24 11.5 13.6 20.7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function chunkQuestions(questions, size) {
  const chunks = []

  for (let index = 0; index < questions.length; index += size) {
    chunks.push(questions.slice(index, index + size))
  }

  return chunks
}

function MombtiQuestionCard({ question, selectedValue, onSelect }) {
  return (
    <article className={`mombti-test-card ${question.text.length > 42 ? 'is-tall' : ''}`}>
      <h2>{question.number} .</h2>
      <p>{question.text}</p>

      <div className="mombti-test-scale" role="radiogroup" aria-label={`${question.number}번 문항 응답`}>
        {MOMB_TI_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`mombti-scale-option is-${option.side} is-${option.size} ${
              selectedValue === option.value ? 'is-selected' : ''
            }`}
            aria-pressed={selectedValue === option.value}
            onClick={() => onSelect(question.id, option.value)}
          >
            <span className="mombti-scale-circle" aria-hidden="true" />
            {option.shortLabel ? <span className="mombti-scale-label">{option.shortLabel}</span> : null}
          </button>
        ))}
      </div>
    </article>
  )
}

function MombtiTestScreen({ onBack, onComplete }) {
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})

  const pages = chunkQuestions(mockMombtiQuestions, QUESTIONS_PER_PAGE)
  const currentQuestions = pages[currentPage] ?? []
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage === pages.length - 1

  const handleSelect = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  const handleNext = () => {
    if (isLastPage) {
      onComplete?.(answers)
      return
    }

    setCurrentPage((page) => page + 1)
  }

  return (
    <div className="mombti-test-shell">
      <header className="mombti-header">
        <button type="button" className="mombti-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>MomBTI</h1>
        <button type="button" className="mombti-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="mombti-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="mombti-test-content">
        {isFirstPage ? (
          <section className="mombti-test-intro">
            <div className="mombti-test-intro-title">
              <strong>검사 시작하기</strong>
              <span aria-hidden="true">→</span>
            </div>
            <p>질문을 읽고, 가장 먼저 떠오르는 정도에 표시해 주세요.</p>
            <p>(1점: 매우 아니다 ~ 5점: 매우 그렇다)</p>
            <p>총 20문항이며, 예상 소요 시간은 약 10분입니다.</p>
          </section>
        ) : null}

        <section className="mombti-test-list">
          {currentQuestions.map((question) => (
            <MombtiQuestionCard
              key={question.id}
              question={question}
              selectedValue={answers[question.id]}
              onSelect={handleSelect}
            />
          ))}
        </section>

        <button type="button" className="mombti-test-next" onClick={handleNext}>
          <span>{isLastPage ? '결과 보기' : '다음 페이지'}</span>
          <NextPageIcon />
        </button>
      </div>
    </div>
  )
}

export default MombtiTestScreen
