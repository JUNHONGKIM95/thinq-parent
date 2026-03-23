import { useEffect, useMemo, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import heartIcon from '@shared-assets/srg/heart.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import messageOpenIcon from '@shared-assets/srg/Message_open_light.svg'
import sendLightIcon from '@shared-assets/srg/Send_light.svg'
import { API_BASE_URL } from '../../config/api'

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

function HeartOutlineIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 20.2 4.8 13.5A4.7 4.7 0 0 1 12 7.2a4.7 4.7 0 0 1 7.2 6.3L12 20.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function formatCheerMessagePreview(responseData) {
  const content = String(responseData?.content ?? '').trim()
  const senderUsername = String(responseData?.senderUsername ?? '').trim()

  if (!content) {
    return ''
  }

  return senderUsername ? `${content} - ${senderUsername}` : content
}

function CheerMessageScreen({
  userId,
  groupId,
  onBack,
  onOpenHome,
  onOpenDevice,
  onOpenCommunity,
  onOpenMy,
  onSubmitSuccess,
  navIcons,
}) {
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inputStatusIndex, setInputStatusIndex] = useState(0)
  const [animatedCount, setAnimatedCount] = useState(0)

  const trimmedMessage = message.trim()
  const progressWidth = useMemo(() => `${Math.max(0, Math.min(animatedCount, 100))}%`, [animatedCount])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setInputStatusIndex((prev) => (prev + 1) % 3)
    }, 700)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setAnimatedCount((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 40)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    if (!trimmedMessage) {
      window.alert('응원메세지를 입력해주세요.')
      return
    }

    if (!groupId) {
      window.alert('가족 그룹 정보를 확인하지 못했어요.')
      return
    }

    try {
      setIsSubmitting(true)

      const response = await fetch(`${API_BASE_URL}/api/v1/cheer-messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId,
          senderId: userId,
          content: trimmedMessage,
          reactionEmoji: 'heart',
        }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        const errorMessage = errorPayload?.message ?? `Failed to create cheer message: ${response.status}`
        throw new Error(errorMessage)
      }

      const payload = await response.json().catch(() => null)
      onSubmitSuccess?.(formatCheerMessagePreview(payload?.data), payload?.data)
      setMessage('')
      onBack?.()
    } catch (error) {
      console.error(error)
      window.alert(error instanceof Error ? error.message : '응원메세지 전송 중 문제가 생겼어요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="cheer-message-screen">
      <header className="cheer-message-header">
        <button type="button" className="parent-device-icon-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>응원메세지</h1>
        <button type="button" className="parent-device-icon-button" aria-label="메뉴">
          <img src={menuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="cheer-message-content">
        <div className="cheer-message-status-row" aria-hidden="true">
          <img src={messageOpenIcon} alt="" className="cheer-message-status-icon" />
          <span className="cheer-message-status-arrows">
            <img
              src={sendLightIcon}
              alt=""
              className={`cheer-message-status-icon cheer-message-status-motion ${
                inputStatusIndex === 0 ? 'is-visible' : ''
              }`}
            />
            <img
              src={sendLightIcon}
              alt=""
              className={`cheer-message-status-icon cheer-message-status-icon--rotate cheer-message-status-motion ${
                inputStatusIndex === 1 ? 'is-visible' : ''
              }`}
            />
          </span>
          <img
            src={heartIcon}
            alt=""
            className={`cheer-message-status-heart cheer-message-status-motion ${
              inputStatusIndex === 2 ? 'is-visible' : ''
            }`}
          />
        </div>

        <section className="cheer-message-card">
          <div className="cheer-message-card-title-row">
            <h2>사랑 보내는 중 ..</h2>
            <span className="cheer-message-card-heart" aria-hidden="true">
              <HeartOutlineIcon />
            </span>
          </div>

          <div className="cheer-message-progress">
            <div className="cheer-message-progress-track" aria-hidden="true">
              <div className="cheer-message-progress-fill" style={{ width: progressWidth }} />
            </div>
            <p className="cheer-message-progress-label">{`${animatedCount}/100`}</p>
          </div>

          <div className="cheer-message-input-box">
            <textarea
              value={message}
              maxLength={100}
              onChange={(event) => setMessage(event.target.value)}
              className="cheer-message-textarea"
              placeholder="응원메세지를 입력하세요."
              aria-label="응원메세지 입력"
            />
          </div>

          <button
            type="button"
            className="cheer-message-submit-button"
            onClick={handleSubmit}
            disabled={isSubmitting || !trimmedMessage}
          >
            {isSubmitting ? '보내는 중' : '응원 보내기'}
          </button>
        </section>
      </div>

      <div className="parent-mode-bottom-bar" />

      <nav className="parent-mode-bottom-nav" aria-label="부모 모드 메뉴">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === 'home'
          const handleClick =
            item.key === 'home'
              ? onOpenHome
              : item.key === 'device'
                ? onOpenDevice
                : item.key === 'community'
                  ? onOpenCommunity
                  : item.key === 'my'
                    ? onOpenMy
                    : undefined

          return (
            <button
              key={item.key}
              type="button"
              className={`parent-mode-nav-item ${isActive ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
              onClick={handleClick}
            >
              <span className="parent-mode-nav-icon-frame" aria-hidden="true">
                <img src={navIcons[item.key]} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
              </span>
              <span className="parent-mode-nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default CheerMessageScreen
