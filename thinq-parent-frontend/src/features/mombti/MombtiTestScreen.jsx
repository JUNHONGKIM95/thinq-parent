import { useEffect, useRef, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import nextArrowIcon from '@shared-assets/srg/Transfer_right_light.svg'
import { API_BASE_URL } from '../../config/api'
import { MOMB_TI_OPTIONS, mockMombtiQuestions } from '../../data/mockMombtiQuestions'

const QUESTIONS_PER_PAGE = 6

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

function chunkQuestions(questions, size) {
  const chunks = []

  for (let index = 0; index < questions.length; index += size) {
    chunks.push(questions.slice(index, index + size))
  }

  return chunks
}

function getChoiceId(questionId, choiceValue) {
  return (questionId - 1) * 5 + choiceValue
}

async function submitMombtiAnswers(attemptId, answers) {
  const response = await fetch(`${API_BASE_URL}/api/v1/mombti/attempts/${attemptId}/answers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      answers,
    }),
  })

  return response.ok
}

async function completeMombtiAttempt(attemptId) {
  const response = await fetch(`${API_BASE_URL}/api/v1/mombti/attempts/${attemptId}/complete`, {
    method: 'POST',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
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

function MombtiTestScreen({
  onBack,
  onOpenMombtiMenu,
  onComplete,
  attemptId = null,
  onEnsureAttemptId,
}) {
  const [currentPage, setCurrentPage] = useState(0)
  const [answers, setAnswers] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const contentRef = useRef(null)

  const pages = chunkQuestions(mockMombtiQuestions, QUESTIONS_PER_PAGE)
  const currentQuestions = pages[currentPage] ?? []
  const isFirstPage = currentPage === 0
  const isLastPage = currentPage === pages.length - 1
  const isCurrentPageComplete = currentQuestions.every((question) => Number.isFinite(answers[question.id]))

  useEffect(() => {
    contentRef.current?.scrollTo({
      top: 0,
      behavior: 'auto',
    })
  }, [currentPage])

  const handleSelect = (questionId, value) => {
    setAnswers((current) => ({
      ...current,
      [questionId]: value,
    }))
  }

  const handleNext = async () => {
    if (isSubmitting) {
      return
    }

    if (!isCurrentPageComplete) {
      window.alert('현재 페이지 문항에 모두 답해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const resolvedAttemptId = attemptId ?? (await onEnsureAttemptId?.())

      if (!resolvedAttemptId) {
        window.alert('검사 정보를 준비하지 못했어요. 다시 시도해주세요.')
        return
      }

      const answersPayload = mockMombtiQuestions
        .filter((question) => Number.isFinite(answers[question.id]))
        .map((question) => ({
        questionId: question.id,
        choiceId: getChoiceId(question.id, answers[question.id]),
        }))

      const isSaved = await submitMombtiAnswers(resolvedAttemptId, answersPayload)

      if (!isSaved) {
        throw new Error(`Failed to submit answers for page ${currentPage + 1}`)
      }

      if (isLastPage) {
        const completedAttempt = await completeMombtiAttempt(resolvedAttemptId)

        if (!completedAttempt) {
          throw new Error(`Failed to complete attempt ${resolvedAttemptId}`)
        }

        onComplete?.(completedAttempt)
        return
      }

      setCurrentPage((page) => page + 1)
    } catch (error) {
      console.error(error)
      window.alert('답변 저장 중 문제가 생겼어요. 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mombti-test-shell">
      <header className="mombti-header">
        <button type="button" className="mombti-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>MomBTI</h1>
        <button type="button" className="mombti-icon-button" aria-label="메뉴 열기" onClick={onOpenMombtiMenu}>
          <img src={menuIcon} alt="" className="mombti-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="mombti-test-content" ref={contentRef}>
        {isFirstPage ? (
          <section className="mombti-test-intro">
            <div className="mombti-test-intro-title">
              <strong>검사 시작하기</strong>
              <span aria-hidden="true">:</span>
            </div>
            <p>질문을 읽고, 가장 먼저 떠오르는 정도를 표시해 주세요.</p>
            <p>(1은 매우 아니다, 5는 매우 그렇다)</p>
            <p>총 24문항이고, 예상 소요 시간은 약 10분입니다.</p>
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

        <button
          type="button"
          className={`mombti-test-next ${isLastPage ? 'is-submit' : ''}`}
          onClick={handleNext}
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? '저장 중...' : isLastPage ? '검사 제출하기' : '다음 페이지'}</span>
          {isLastPage ? null : <img src={nextArrowIcon} alt="" className="mombti-test-next-icon" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}

export default MombtiTestScreen
