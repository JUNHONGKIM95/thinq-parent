import { useEffect, useRef, useState } from 'react'
import './App.css'
import addHomeImage from '@shared-assets/addhome.png'
import anomalyImage from '@shared-assets/check.png'
import clockImage from '@shared-assets/clock.png'
import newHomeImage from '@shared-assets/homeplus.png'
import laundryBannerImage from '@shared-assets/home_laundry.png'
import home3dImage from '@shared-assets/image2.png'
import playBannerImage from '@shared-assets/image4.png'
import floatingInnerImage from '@shared-assets/image5.png'
import lifeAgentImage from '@shared-assets/lifeagent.png'
import lookDiaryImage from '@shared-assets/lookdiary.png'
import plusImage from '@shared-assets/plus.png'
import userHomeIcon from '@shared-assets/srg/change.png'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import messageOpenIcon from '@shared-assets/srg/Message_open_light.svg'
import sendLightIcon from '@shared-assets/srg/Send_light.svg'
import heartIcon from '@shared-assets/srg/heart.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeBabyIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import whiteHomeIcon from '@shared-assets/srg/whitehome.svg'
import whiteBabyIcon from '@shared-assets/srg/whiteelec.svg'
import whiteCommunityIcon from '@shared-assets/srg/whitecommunity.svg'
import whiteMyIcon from '@shared-assets/srg/whitemy.svg'
import chatFloatingIcon from '@shared-assets/srg/chat_floating.svg'
import sendDuotoneIcon from '@shared-assets/srg/Send_duotone_line.svg'
import bellIcon from '@shared-assets/icons/a_button.svg'
import plusButtonIcon from '@shared-assets/icons/button_plus.svg'
import careIcon from '@shared-assets/assets/icons/care.svg'
import deviceIcon from '@shared-assets/assets/icons/device.svg'
import homeIcon from '@shared-assets/assets/icons/home.svg'
import homeMoreIcon from '@shared-assets/icons/home_more.svg'
import menuIcon from '@shared-assets/assets/icons/menu.svg'
import headerMenuIcon from '@shared-assets/srg/Menu.svg'
import moreButtonIcon from '@shared-assets/icons/more_button.svg'
import smartGoIcon from '@shared-assets/icons/smart_go.svg'
import { API_BASE_URL } from './config/api'
import { mockChildProfile } from './data/mockChildProfile'
import { mockParentSchedule } from './data/mockParentSchedule'
import { mockMyPage } from './data/mockMyPage'
import { mockMombtiMeta, mockMombtiRow } from './data/mockMombti'
import CommunityScreen from './features/community/CommunityScreen'
import CommunityWriteScreen from './features/community/CommunityWriteScreen'
import PregnancyDiaryScreen from './features/diary/PregnancyDiaryScreen'
import PregnancyDiaryWriteScreen from './features/diary/PregnancyDiaryWriteScreen'
import ChildProfileScreen from './features/my/ChildProfileScreen'
import MombtiDetailScreen from './features/mombti/MombtiDetailScreen'
import MombtiMenuScreen from './features/mombti/MombtiMenuScreen'
import MombtiTestScreen from './features/mombti/MombtiTestScreen'
import ParentDeviceScreen from './features/parent/ParentDeviceScreen'
import ParentDeviceRoutineScreen from './features/parent/ParentDeviceRoutineScreen'
import ParentScheduleScreen from './features/parent/ParentScheduleScreen'
import MyScreen from './features/my/MyScreen'
import { buildMombtiViewModel } from './features/mombti/mombtiMapper'

const HOME_NAME = '사용자 홈'

const navItems = [
  { key: 'home', label: '홈', icon: homeIcon },
  { key: 'device', label: '디바이스', icon: deviceIcon },
  { key: 'care', label: '케어', icon: careIcon },
  { key: 'menu', label: '메뉴', icon: menuIcon },
]

const settingCards = [
  {
    title: '새로운 홈 만들기',
    description: '새로운 홈을 추가해보세요.',
    image: newHomeImage,
    className: 'square',
  },
  {
    title: '다른 홈 초대받기',
    description: 'QR 스캔을 통해 새로운 홈\n멤버가 되어보세요.',
    image: addHomeImage,
    className: 'square',
  },
  {
    title: '라이프 에이전트',
    description: '생활 속에서 가전의 도움을 받아보세요.',
    image: lifeAgentImage,
    className: 'wide',
  },
]

const DEFAULT_PREGNANCY_SUMMARY = {
  babyNickname: '틔움이',
  daysUntilDueDate: 102,
  dueDate: mockMyPage.dueDate,
  role: '',
}
const DEFAULT_CHEER_MESSAGE = ''
const DAILY_SCHEDULE_CACHE_PREFIX = 'parent-daily-schedules'
const DEFAULT_CURRENT_USER_ID = 3
const CHATBOT_API_URL = 'https://chatbot-api-338378601376.asia-northeast3.run.app/ask'
const DEFAULT_CHATBOT_GREETING = '안녕하세요, 틔움이 어머니를 위한 전문가 챗봇입니다.'

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDayOfWeekLabel(date) {
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  return labels[date.getDay()]
}

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long' }).toUpperCase()
}

function calculateDaysUntilDueDate(dueDate) {
  if (!dueDate) {
    return DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueDateValue = new Date(`${dueDate}T00:00:00`)

  if (Number.isNaN(dueDateValue.getTime())) {
    return DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate
  }

  return Math.max(0, Math.ceil((dueDateValue.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)))
}

function formatDueDateLabel(dueDate) {
  if (!dueDate) {
    return DEFAULT_PREGNANCY_SUMMARY.dueDate
  }

  const matchedDate = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (matchedDate) {
    const [, year, month, day] = matchedDate
    return `${year.slice(-2)}.${month}.${day}`
  }

  const parsedDate = new Date(`${dueDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return dueDate
  }

  return `${String(parsedDate.getFullYear()).slice(-2)}.${String(parsedDate.getMonth() + 1).padStart(2, '0')}.${String(parsedDate.getDate()).padStart(2, '0')}`
}

function formatDaysUntilDueDateLabel(daysUntilDueDate) {
  return `- ${daysUntilDueDate}일 전`
}

function getDailyScheduleCacheKey(userId, date) {
  return `${DAILY_SCHEDULE_CACHE_PREFIX}:${userId}:${getDateKey(date)}`
}

function readDailyScheduleCache(userId, date) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const cachedValue = window.localStorage.getItem(getDailyScheduleCacheKey(userId, date))
    const parsedValue = cachedValue ? JSON.parse(cachedValue) : []

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function writeDailyScheduleCache(userId, date, items) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(getDailyScheduleCacheKey(userId, date), JSON.stringify(items))
  } catch {
    // Ignore storage failures and continue with live data.
  }
}

function getMeetingName(summary) {
  if (summary?.babyNickname) {
    return summary.babyNickname
  }

  if (summary?.meetingTitle) {
    return summary.meetingTitle.replace(/\s*만나기$/, '')
  }

  return DEFAULT_PREGNANCY_SUMMARY.babyNickname
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

async function fetchPregnancySummary(userId = 3) {
  const url = `${API_BASE_URL}/api/v1/users/${userId}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return DEFAULT_PREGNANCY_SUMMARY
    }

    const payload = await response.json()
    const userData = getUserPayload(payload)

    if (userData) {
      const dueDate = userData.dueDate
      const daysUntilDueDate = calculateDaysUntilDueDate(dueDate)

      return {
        ...userData,
        daysUntilDueDate,
      }
    }
  } catch {
    return DEFAULT_PREGNANCY_SUMMARY
  }

  return DEFAULT_PREGNANCY_SUMMARY
}

async function fetchLatestCheerMessage(userId = 3) {
  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!userResponse.ok) {
      return ''
    }

    const userPayload = await userResponse.json()
    const groupId = getUserPayload(userPayload)?.groupId

    if (!groupId) {
      return ''
    }

    const cheerResponse = await fetch(`${API_BASE_URL}/api/v1/cheer-messages/groups/${groupId}/latest`)

    if (!cheerResponse.ok) {
      return ''
    }

    const cheerPayload = await cheerResponse.json()
    const content = cheerPayload?.data?.content
    const senderId = cheerPayload?.data?.senderId

    if (!content?.trim()) {
      return ''
    }

    if (!senderId) {
      return content
    }

    const senderResponse = await fetch(`${API_BASE_URL}/api/v1/users/${senderId}`)

    if (!senderResponse.ok) {
      return content
    }

    const senderPayload = await senderResponse.json()
    const senderUsername = getUserPayload(senderPayload)?.username

    if (!senderUsername?.trim()) {
      return content
    }

    return `${content} - ${senderUsername}`
  } catch {
    return ''
  }
}

function formatDailyScheduleTime(rawTime, startDate) {
  if (rawTime?.trim()) {
    return rawTime.slice(0, 5)
  }

  if (!startDate) {
    return ''
  }

  const scheduleDate = new Date(startDate)

  if (Number.isNaN(scheduleDate.getTime())) {
    return ''
  }

  return scheduleDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getParentModeScheduleTypeStyle(scheduleType, index) {
  const normalizedType = String(scheduleType ?? '').trim().toLowerCase()
  const styleMap = {
    baby: { background: '#ff3b3b', color: '#ffffff' },
    family: { background: '#8fbc69', color: '#ffffff' },
    work: { background: '#7478a8', color: '#ffffff' },
    personal: { background: '#fef19f', color: '#000000' },
    important: { background: '#2e2e2e', color: '#ffffff' },
    etc: { background: '#b285bb', color: '#ffffff' },
    아기: { background: '#ff3b3b', color: '#ffffff' },
    가족: { background: '#8fbc69', color: '#ffffff' },
    일: { background: '#7478a8', color: '#ffffff' },
    개인: { background: '#fef19f', color: '#000000' },
    중요: { background: '#2e2e2e', color: '#ffffff' },
    기타: { background: '#b285bb', color: '#ffffff' },
  }

  return (
    styleMap[normalizedType] ??
    styleMap[String(scheduleType ?? '').trim()] ?? {
      background: index === 0 ? '#ff0000' : '#ffef88',
      color: index === 0 ? '#ffffff' : '#000000',
    }
  )
}

async function fetchDailySchedules(userId = 3, date = new Date()) {
  const dateKey = getDateKey(date)

  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!userResponse.ok) {
      return []
    }

    const userPayload = await userResponse.json()
    const groupId = getUserPayload(userPayload)?.groupId

    if (!groupId) {
      return []
    }

    const query = new URLSearchParams({
      groupId: String(groupId),
      date: dateKey,
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/daily?${query.toString()}`)

    if (!response.ok) {
      return []
    }

    const payload = await response.json()
    const schedules = Array.isArray(payload?.data) ? payload.data : []

    const items = schedules.slice(0, 2).map((schedule, index) => ({
      key: schedule.scheduleId ?? `${schedule.title}-${schedule.scheduleDate}-${schedule.time}-${index}`,
      title: schedule.title ?? '',
      time: formatDailyScheduleTime(schedule.time, schedule.startDate),
      boxStyle: getParentModeScheduleTypeStyle(schedule.scheduleType, index),
    }))

    writeDailyScheduleCache(userId, date, items)
    return items
  } catch {
    return []
  }
}

function AssetIcon({ src, alt = '', className = '', size = 20 }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`asset-icon ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  )
}

function HeaderAction({ icon, label, size = 17 }) {
  return (
    <button type="button" className="header-action" aria-label={label}>
      <AssetIcon src={icon} size={size} />
    </button>
  )
}

function removeChatMarkdown(text) {
  return String(text ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/(?<!\n)(\n?)(\d+\.)/g, '\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function HomeSelectionSheet({ onClose, onOpenSettings }) {
  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <section
        className="home-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="홈 선택"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="sheet-handle" aria-hidden="true" />
        <h2>홈 선택</h2>
        <button type="button" className="sheet-home-option">
          <span className="sheet-check" aria-hidden="true">
            ✓
          </span>
          <span>{HOME_NAME}</span>
        </button>
        <button type="button" className="sheet-settings-link" onClick={onOpenSettings}>
          홈 설정
          <span aria-hidden="true">›</span>
        </button>
      </section>
    </div>
  )
}

function HomeScreen({ activeTab, onChangeTab, onOpenSheet, isHomeSheetOpen }) {
  return (
    <>
      <header className="home-header">
        <button type="button" className="home-selector" onClick={onOpenSheet} aria-label="홈 선택">
          <strong>{HOME_NAME}</strong>
          <AssetIcon src={homeMoreIcon} size={16} />
        </button>

        <div className="header-actions">
          <HeaderAction icon={plusButtonIcon} label="추가" />
          <HeaderAction icon={bellIcon} label="알림" />
          <HeaderAction icon={moreButtonIcon} label="더보기" size={14} />
        </div>
      </header>

      <div className="home-content">
        <section className="hero-card">
          <img src={anomalyImage} alt="" className="hero-card-icon" />
          <div className="hero-copy">
            <p>제품에 이상 징후가 발견되면 전문 상담사가</p>
            <p>알려드려요.</p>
            <button type="button" className="primary-pill">
              지금 알아보기
            </button>
          </div>
        </section>

        <section className="hero-card second">
          <img src={home3dImage} alt="" className="hero-card-icon map" />
          <div className="hero-copy">
            <p>3D 홈뷰로 우리집과 제품의 실시간 상태를</p>
            <p>한눈에 확인해보세요.</p>
            <button type="button" className="primary-pill">
              3D 홈뷰 만들기
            </button>
          </div>
        </section>

        <section className="section-block">
          <h2>즐겨 찾는 제품</h2>
          <div className="favorite-panel">
            <p>제품을 추가하고 즐겨 찾는 제품으로 배치하면 홈 화면에서 바로</p>
            <p>사용할 수 있어요.</p>
            <button type="button" className="favorite-button">
              <img src={plusImage} alt="" />
              <span>제품 추가</span>
            </button>
          </div>
        </section>

        <section className="section-block">
          <img src={playBannerImage} alt="ThinQ PLAY 배너" className="play-banner" />
        </section>

        <section className="section-block">
          <div className="section-row">
            <h2>스마트 루틴</h2>
            <AssetIcon src={smartGoIcon} size={18} />
          </div>

          <button type="button" className="routine-button">
            <img src={clockImage} alt="" />
            <span>루틴 알아보기</span>
          </button>
        </section>

        <section className="section-block thinq-section">
          <h2>ThinQ 활용하기</h2>
          <img src={laundryBannerImage} alt="ThinQ 활용 배너" className="laundry-banner" />
        </section>
      </div>

      {!isHomeSheetOpen ? (
        <button type="button" className="floating-button" aria-label="ThinQ 도우미">
          <img src={floatingInnerImage} alt="" />
        </button>
      ) : null}

      <nav className="bottom-nav" aria-label="주요 메뉴">
        {navItems.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item ${activeTab === index ? 'active' : ''}`}
            aria-current={activeTab === index ? 'page' : undefined}
            onClick={() => onChangeTab(index)}
          >
            <span className="bottom-nav-icon-frame" aria-hidden="true">
              <AssetIcon
                src={item.icon}
                size={24}
                className={`bottom-nav-icon ${activeTab === index ? 'active-nav-icon' : ''}`}
              />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

function SettingCard({ title, description, image, className, onClick }) {
  return (
    <button type="button" className={`setting-card ${className}`} onClick={onClick}>
      <div className="setting-card-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <img src={image} alt="" className={`setting-card-image ${className}`} />
    </button>
  )
}

function HomeSettingsScreen({ onBack, onOpenLifeAgent }) {
  return (
    <>
      <header className="settings-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>홈 설정</h1>
        <button type="button" className="settings-plus-button" aria-label="홈 추가">
          <AssetIcon src={plusButtonIcon} size={17} />
        </button>
      </header>

      <div className="settings-content">
        <button type="button" className="current-home-card">
          <span className="current-home-preview" aria-hidden="true" />
          <strong>{HOME_NAME}</strong>
          <span className="current-home-state">현재 홈</span>
          <span className="current-home-arrow" aria-hidden="true" />
        </button>

        <section className="settings-section">
          <h2>홈 추가하기</h2>
          <div className="settings-grid">
            {settingCards.slice(0, 2).map((card) => (
              <SettingCard
                key={card.title}
                title={card.title}
                description={card.description}
                image={card.image}
                className={card.className}
              />
            ))}
          </div>
          <SettingCard
            title={settingCards[2].title}
            description={settingCards[2].description}
            image={settingCards[2].image}
            className={settingCards[2].className}
            onClick={onOpenLifeAgent}
          />
        </section>
      </div>
    </>
  )
}

function LifeAgentScreen({ onBack, onOpenParentMode }) {
  return (
    <>
      <header className="settings-header life-agent-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>라이프 에이전트</h1>
        <button type="button" className="life-agent-more-button" aria-label="더보기">
          <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="settings-content life-agent-content">
        <section className="life-agent-card-list">
          <button type="button" className="life-agent-card life-agent-card--holomode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">홀로 모드</p>
              <p className="life-agent-card-subtitle">혼자서도 충분한 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--petmode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">펫 모드</p>
              <p className="life-agent-card-subtitle">작은 동반자를 찾은 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--babymode" onClick={onOpenParentMode}>
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">부모 모드</p>
              <p className="life-agent-card-subtitle">새 생명이 처음인 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--couplemode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">부부 모드</p>
              <p className="life-agent-card-subtitle">사랑하고 있는 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--oldmode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">슬로우 모드</p>
              <p className="life-agent-card-subtitle">인생의 여유를 찾은 당신을 위해</p>
            </div>
          </button>
        </section>
      </div>
    </>
  )
}

function ChatExpertScreen({ onBack }) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([{ role: 'bot', text: DEFAULT_CHATBOT_GREETING }])
  const [isSending, setIsSending] = useState(false)
  const messagesRef = useRef(null)
  const sessionIdRef = useRef(`user-${Date.now()}`)

  useEffect(() => {
    if (!messagesRef.current) {
      return
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, isSending])

  const sendMessage = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isSending) {
      return
    }

    setMessages((prev) => [...prev, { role: 'user', text: trimmedMessage }])
    setMessage('')
    setIsSending(true)

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmedMessage,
          session_id: sessionIdRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`)
      }

      const payload = await response.json()
      const answer = removeChatMarkdown(payload?.answer)

      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: answer || '응답을 받아오지 못했어요. 잠시 후 다시 시도해주세요.',
        },
      ])
    } catch (error) {
      console.error(error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '서버와 연결되지 않았어요. 잠시 후 다시 시도해주세요.',
        },
      ])
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="chat-expert-shell">
      <header className="settings-header chat-expert-page-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>챗태피티 전문가</h1>
        <button type="button" className="life-agent-more-button chat-expert-menu-button" aria-label="메뉴">
          <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="chat-expert-content">
        <div className="chat-expert-card">
          <div className="chat-expert-messages" ref={messagesRef}>
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}-${item.text}`}
                className={`chat-expert-bubble ${
                  item.role === 'user' ? 'chat-expert-bubble-user' : 'chat-expert-bubble-bot'
                }`}
              >
                <span className="chat-expert-bubble-shape" aria-hidden="true" />
                <p>{item.text}</p>
              </div>
            ))}
            {isSending ? <p className="chat-expert-loading">답변을 생성 중입니다...</p> : null}
          </div>

          <div className="chat-expert-input-area">
            <input
              type="text"
              placeholder="메세지를 입력하세요."
              aria-label="메세지를 입력하세요."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  sendMessage()
                }
              }}
            />
            <button
              type="button"
              className="chat-expert-send-btn"
              aria-label="전송"
              onClick={sendMessage}
              disabled={isSending}
            >
              <img src={sendDuotoneIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ParentModeScreen({
  onBack,
  onOpenChat,
  onOpenHome,
  onOpenDevice,
  onOpenCommunity,
  onOpenMy,
  onOpenDiary,
  onOpenSchedule,
  onOpenAccountSwitch,
  onCloseAccountSwitch,
  onSelectMomAccount,
  onSelectDadAccount,
  isAccountSwitchPopupOpen,
  pregnancySummary,
  cheerMessageText,
  dailyScheduleItems,
}) {
  const [inputStatusIndex, setInputStatusIndex] = useState(0)
  const today = new Date()
  const todayKey = getDateKey(today)
  const todayTodoGroup =
    mockParentSchedule.todo?.byDate?.[todayKey] ??
    mockParentSchedule.todo?.default ?? {
      recommended: [],
      myList: [],
    }
  const todayTodoItems = [...(todayTodoGroup.recommended ?? []), ...(todayTodoGroup.myList ?? [])].slice(0, 2)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setInputStatusIndex((prev) => (prev + 1) % 3)
    }, 700)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <>
      <header className="parent-mode-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>부모 모드</h1>
        <div className="parent-mode-header-actions">
          <button
            type="button"
            className="parent-mode-account-switch-button"
            aria-label="계정 전환"
            onClick={onOpenAccountSwitch}
          >
            <img src={userHomeIcon} alt="" className="parent-mode-account-switch-icon" aria-hidden="true" />
          </button>
          <button type="button" className="life-agent-more-button" aria-label="더보기">
            <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="parent-mode-body">
        <div className="parent-mode-content">
          <section className="parent-mode-meet">
            <h2 className="parent-mode-meet-title">{`${getMeetingName(pregnancySummary)} 만나기`}</h2>
            <p className="parent-mode-meet-meta">
              <img src={heartIcon} alt="" className="parent-mode-heart" aria-hidden="true" />
              {`- ${pregnancySummary.daysUntilDueDate}일 전`}
            </p>
          </section>

          <div className="parent-mode-input-row">
            {pregnancySummary.role === 'FAMILY' ? (
              <button type="button" className="parent-mode-input-icon-button" aria-label="응원 글쓰기">
                <img src={messageOpenIcon} alt="" className="parent-mode-input-icon" aria-hidden="true" />
              </button>
            ) : (
              <img src={messageOpenIcon} alt="" className="parent-mode-input-icon" aria-hidden="true" />
            )}
            <span className="parent-mode-input-arrows" aria-hidden="true">
              <img
                src={sendLightIcon}
                alt=""
                className={`parent-mode-input-icon parent-mode-input-motion ${inputStatusIndex === 0 ? 'is-visible' : ''
                  }`}
                aria-hidden="true"
              />
              <img
                src={sendLightIcon}
                alt=""
                className={`parent-mode-input-icon parent-mode-input-icon--rotate parent-mode-input-motion ${inputStatusIndex === 1 ? 'is-visible' : ''
                  }`}
                aria-hidden="true"
              />
            </span>
            <img
              src={heartIcon}
              alt=""
              className={`parent-mode-input-heart parent-mode-input-motion ${inputStatusIndex === 2 ? 'is-visible' : ''
                }`}
              aria-hidden="true"
            />
            <p className="parent-mode-input-text">{cheerMessageText}</p>
          </div>

          <div className="parent-mode-cards-row">
            <button
              type="button"
              className="parent-mode-card parent-mode-calendar parent-mode-card-button"
            >
              <h3 onClick={() => onOpenSchedule(false)}>캘린더</h3>
              <p className="parent-mode-date-line" onClick={() => onOpenSchedule(true)}>
                <span className="parent-mode-date">{today.getDate()}</span>
                <span className="parent-mode-day">{getDayOfWeekLabel(today)}</span>
              </p>
              <div className="parent-mode-events" onClick={() => onOpenSchedule(true)}>
                {dailyScheduleItems.map((item) => (
                  <div
                    key={item.key}
                    className="parent-mode-event-box"
                    style={{
                      background: item.boxStyle.background,
                      color: item.boxStyle.color,
                      opacity: 0.8,
                    }}
                  >
                    <span className="parent-mode-event-label">{item.title}</span>
                    <span className="parent-mode-event-time" style={{ color: item.boxStyle.color }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </button>
            <section className="parent-mode-card parent-mode-todo">
              <div
                className="parent-mode-todo-head"
                onClick={() => onOpenSchedule(false)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    onOpenSchedule(false)
                  }
                }}
              >
                <h3>TO DO</h3>
              </div>
              {todayTodoItems.map((item) => (
                <label key={item.key} className="parent-mode-todo-item">
                  <input
                    type="checkbox"
                    className="parent-mode-todo-checkbox"
                    defaultChecked={Boolean(item.checked)}
                  />
                  <span className="parent-mode-todo-check" aria-hidden="true" />
                  <span>{item.text}</span>
                </label>
              ))}
            </section>
          </div>

          <button type="button" className="parent-mode-diary parent-mode-diary-button" onClick={onOpenDiary}>
            <span className="parent-mode-diary-copy">
              <h3>임신 일기</h3>
              <p className="parent-mode-diary-desc">소중한 매일의 순간을 기록해보세요.</p>
            </span>
            <span className="parent-mode-diary-image-wrap">
              <img src={lookDiaryImage} alt="일기 보기" />
            </span>
          </button>

          <section className="parent-mode-widget">
            <h3>위젯 추가하기</h3>
            <div className="parent-mode-widget-box">
              <p>즐겨 찾는 기능을 한 눈에 볼 수 있도록 홈 화면에 배치해보세요.</p>
              <button type="button" className="parent-mode-widget-btn">위젯 추가</button>
            </div>
          </section>
        </div>

        <div className="parent-mode-bottom-bar" />

        <nav className="parent-mode-bottom-nav" aria-label="부모 모드 메뉴">
          <button type="button" className="parent-mode-nav-item" aria-label="홈" onClick={onOpenHome}>
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={parentModeHomeIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">홈</span>
          </button>
          <button
            type="button"
            className="parent-mode-nav-item parent-mode-nav-item--active"
            aria-label="가전육아"
            onClick={onOpenDevice}
          >
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={parentModeBabyIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">가전육아</span>
          </button>
          <button type="button" className="parent-mode-nav-item" aria-label="커뮤니티" onClick={onOpenCommunity}>
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={parentModeCommunityIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">커뮤니티</span>
          </button>
          <button type="button" className="parent-mode-nav-item" aria-label="MY" onClick={onOpenMy}>
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={parentModeMyIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">MY</span>
          </button>
        </nav>

        <button type="button" className="parent-mode-fab" aria-label="채팅" onClick={onOpenChat}>
          <img src={chatFloatingIcon} alt="" className="parent-mode-fab-icon" aria-hidden="true" />
        </button>

        {isAccountSwitchPopupOpen ? (
          <div className="parent-mode-account-switch-overlay" onClick={onCloseAccountSwitch} role="presentation">
            <section
              className="parent-mode-account-switch-popup"
              role="dialog"
              aria-modal="true"
              aria-label="계정 전환"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="parent-mode-account-switch-option is-mom" onClick={onSelectMomAccount}>
                엄마
              </button>
              <button type="button" className="parent-mode-account-switch-option is-dad" onClick={onSelectDadAccount}>
                아빠
              </button>
            </section>
          </div>
        ) : null}
      </div>
    </>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_CURRENT_USER_ID)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [screenHistory, setScreenHistory] = useState([])
  const [isHomeSheetOpen, setIsHomeSheetOpen] = useState(false)
  const [isScheduleDetailInitiallyOpen, setIsScheduleDetailInitiallyOpen] = useState(true)
  const [isScheduleInputInitiallyOpen, setIsScheduleInputInitiallyOpen] = useState(false)
  const [isAccountSwitchPopupOpen, setIsAccountSwitchPopupOpen] = useState(false)
  const [pregnancySummary, setPregnancySummary] = useState(DEFAULT_PREGNANCY_SUMMARY)
  const [cheerMessageText, setCheerMessageText] = useState(DEFAULT_CHEER_MESSAGE)
  const [dailyScheduleItems, setDailyScheduleItems] = useState(() =>
    readDailyScheduleCache(DEFAULT_CURRENT_USER_ID, new Date())
  )
  const [childProfile, setChildProfile] = useState(mockChildProfile)
  const today = new Date()
  const myPage = {
    ...mockMyPage,
    childName: pregnancySummary.babyNickname ?? mockMyPage.childName,
    dDay: formatDaysUntilDueDateLabel(pregnancySummary.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate),
    dueDate: formatDueDateLabel(pregnancySummary.dueDate),
    schedule: {
      ...mockMyPage.schedule,
      monthLabel: getMonthLabel(today),
      day: String(today.getDate()),
      dayOfWeek: getDayOfWeekLabel(today),
      items: dailyScheduleItems,
    },
  }
  const parentSchedule = mockParentSchedule
  const mombti = buildMombtiViewModel(mockMombtiRow, mockMombtiMeta)

  useEffect(() => {
    let isMounted = true

    setPregnancySummary(DEFAULT_PREGNANCY_SUMMARY)
    setChildProfile(mockChildProfile)
    setCheerMessageText(DEFAULT_CHEER_MESSAGE)
    setDailyScheduleItems(readDailyScheduleCache(currentUserId, new Date()))

    fetchPregnancySummary(currentUserId).then((data) => {
      if (!isMounted || !data) {
        return
      }

      setPregnancySummary({
        babyNickname:
          data.babyNickname ??
          data.meetingTitle?.replace(/\s*만나기$/, '') ??
          DEFAULT_PREGNANCY_SUMMARY.babyNickname,
        meetingTitle: data.meetingTitle,
        daysUntilDueDate: data.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate,
        dueDate: data.dueDate ?? DEFAULT_PREGNANCY_SUMMARY.dueDate,
        role: data.role ?? DEFAULT_PREGNANCY_SUMMARY.role,
      })

      if (data.dueDate) {
        setChildProfile((prev) => ({
          ...prev,
          selectedDate: data.dueDate,
        }))
      }

      if (data.babyNickname) {
        setChildProfile((prev) => ({
          ...prev,
          childName: data.babyNickname,
        }))
      }
    })

    fetchLatestCheerMessage(currentUserId).then((content) => {
      if (!isMounted || !content) {
        return
      }

      setCheerMessageText(content)
    })

    fetchDailySchedules(currentUserId, new Date()).then((items) => {
      if (!isMounted) {
        return
      }

      setDailyScheduleItems(items)
    })

    return () => {
      isMounted = false
    }
  }, [currentUserId])

  const navigateToScreen = (nextScreen) => {
    setCurrentScreen((prevScreen) => {
      if (prevScreen === nextScreen) {
        return prevScreen
      }

      setScreenHistory((prevHistory) => [...prevHistory, prevScreen])
      return nextScreen
    })
  }

  const goBack = () => {
    setScreenHistory((prevHistory) => {
      if (!prevHistory.length) {
        return prevHistory
      }

      const nextHistory = prevHistory.slice(0, -1)
      const previousScreen = prevHistory[prevHistory.length - 1]

      setCurrentScreen(previousScreen)
      return nextHistory
    })
  }

  const openSettings = () => {
    setIsHomeSheetOpen(false)
    navigateToScreen('settings')
  }

  const openLifeAgent = () => {
    navigateToScreen('life-agent')
  }

  const openParentMode = () => {
    navigateToScreen('parent-mode')
  }

  const openParentModeChat = () => {
    navigateToScreen('parent-mode-chat')
  }

  const openParentDevice = () => {
    navigateToScreen('parent-mode-device')
  }

  const openParentDeviceRoutine = () => {
    navigateToScreen('parent-mode-device-routine')
  }

  const openMyScreen = () => {
    navigateToScreen('my')
  }

  const openCommunity = () => {
    navigateToScreen('community')
  }

  const openCommunityWrite = () => {
    if (pregnancySummary.role !== 'USER') {
      return
    }

    navigateToScreen('community-write')
  }

  const openPregnancyDiary = () => {
    navigateToScreen('pregnancy-diary')
  }

  const openPregnancyDiaryWrite = () => {
    navigateToScreen('pregnancy-diary-write')
  }

  const handleOpenAccountSwitch = () => {
    setIsAccountSwitchPopupOpen(true)
  }

  const handleCloseAccountSwitch = () => {
    setIsAccountSwitchPopupOpen(false)
  }

  const handleSelectAccount = (nextUserId) => {
    setCurrentUserId(nextUserId)
    setIsAccountSwitchPopupOpen(false)
  }

  const openParentSchedule = (shouldOpenDetail = true, shouldOpenScheduleInput = false) => {
    setIsScheduleDetailInitiallyOpen(shouldOpenDetail)
    setIsScheduleInputInitiallyOpen(shouldOpenScheduleInput)
    navigateToScreen('parent-mode-schedule')
  }

  const openChildProfile = () => {
    navigateToScreen('child-profile')
  }

  const openMombti = () => {
    navigateToScreen('mombti-menu')
  }

  const openMombtiResult = () => {
    navigateToScreen('mombti')
  }

  const openMombtiTest = () => {
    navigateToScreen('mombti-test')
  }

  const handleSaveChildDueDate = (dueDate) => {
    setChildProfile((prev) => ({
      ...prev,
      selectedDate: dueDate,
    }))

    setPregnancySummary((prev) => ({
      ...prev,
      dueDate,
      daysUntilDueDate: calculateDaysUntilDueDate(dueDate),
    }))
  }

  const handleSaveBabyNickname = (babyNickname) => {
    setPregnancySummary((prev) => ({
      ...prev,
      babyNickname,
    }))

    setChildProfile((prev) => ({
      ...prev,
      childName: babyNickname,
    }))
  }

  const phoneShellClass =
    currentScreen === 'home'
      ? 'home-mode'
      : currentScreen === 'parent-mode' ||
        currentScreen === 'parent-mode-device' ||
        currentScreen === 'parent-mode-device-routine' ||
        currentScreen === 'parent-mode-chat' ||
        currentScreen === 'parent-mode-schedule'
        ? 'parent-mode'
        : currentScreen === 'community'
          ? 'community-mode'
        : currentScreen === 'community-write'
          ? 'community-write-mode'
        : currentScreen === 'pregnancy-diary' || currentScreen === 'pregnancy-diary-write'
          ? 'diary-mode'
        : currentScreen === 'my' || currentScreen === 'child-profile'
          ? 'my-mode'
          : currentScreen === 'mombti' || currentScreen === 'mombti-menu' || currentScreen === 'mombti-test'
            ? 'mombti-mode'
            : 'settings-mode'

  return (
    <main className="app-shell">
      <section className={`phone-shell ${phoneShellClass}`}>
        {currentScreen === 'home' && (
          <HomeScreen
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenSheet={() => setIsHomeSheetOpen(true)}
            isHomeSheetOpen={isHomeSheetOpen}
          />
        )}

        {currentScreen === 'settings' && (
          <HomeSettingsScreen onBack={goBack} onOpenLifeAgent={openLifeAgent} />
        )}

        {currentScreen === 'life-agent' && (
          <LifeAgentScreen
            onBack={goBack}
            onOpenParentMode={openParentMode}
          />
        )}

        {currentScreen === 'parent-mode' && (
          <ParentModeScreen
            onBack={goBack}
            onOpenChat={openParentModeChat}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
            onOpenMy={openMyScreen}
            onOpenDiary={openPregnancyDiary}
            onOpenSchedule={openParentSchedule}
            onOpenAccountSwitch={handleOpenAccountSwitch}
            onCloseAccountSwitch={handleCloseAccountSwitch}
            onSelectMomAccount={() => handleSelectAccount(3)}
            onSelectDadAccount={() => handleSelectAccount(4)}
            isAccountSwitchPopupOpen={isAccountSwitchPopupOpen}
            pregnancySummary={pregnancySummary}
            cheerMessageText={cheerMessageText}
            dailyScheduleItems={dailyScheduleItems}
          />
        )}

        {currentScreen === 'parent-mode-device' && (
          <ParentDeviceScreen
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenMy={openMyScreen}
            onOpenCommunity={openCommunity}
            onOpenRoutine={openParentDeviceRoutine}
            navIcons={{
              home: parentModeHomeIcon,
              device: parentModeBabyIcon,
              community: parentModeCommunityIcon,
              my: parentModeMyIcon,
            }}
          />
        )}

        {currentScreen === 'parent-mode-device-routine' && (
          <ParentDeviceRoutineScreen
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenMy={openMyScreen}
            onOpenCommunity={openCommunity}
            navIcons={{
              home: whiteHomeIcon,
              device: whiteBabyIcon,
              community: whiteCommunityIcon,
              my: whiteMyIcon,
            }}
          />
        )}

        {currentScreen === 'parent-mode-chat' && (
          <ChatExpertScreen onBack={goBack} />
        )}

        {currentScreen === 'parent-mode-schedule' && (
          <ParentScheduleScreen
            data={parentSchedule}
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
            onOpenMy={openMyScreen}
            initialDetailOpen={isScheduleDetailInitiallyOpen}
            initialScheduleInputOpen={isScheduleInputInitiallyOpen}
            userId={currentUserId}
            navIcons={{
              home: parentModeHomeIcon,
              device: parentModeBabyIcon,
              community: parentModeCommunityIcon,
              my: parentModeMyIcon,
            }}
          />
        )}

        {currentScreen === 'my' && (
          <MyScreen
            data={myPage}
            userId={currentUserId}
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
            onOpenChildProfile={openChildProfile}
            onOpenMombti={openMombti}
            onOpenDiary={openPregnancyDiary}
            onOpenDiaryWrite={openPregnancyDiaryWrite}
            onOpenSchedule={openParentSchedule}
            onSaveBabyNickname={handleSaveBabyNickname}
          />
        )}

        {currentScreen === 'child-profile' && (
          <ChildProfileScreen
            data={childProfile}
            userId={currentUserId}
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
            onSaveDueDate={handleSaveChildDueDate}
          />
        )}

        {currentScreen === 'community' && (
          <CommunityScreen
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenMy={openMyScreen}
            onOpenWrite={openCommunityWrite}
            canWrite={pregnancySummary.role === 'USER'}
          />
        )}

        {currentScreen === 'community-write' && (
          <CommunityWriteScreen onBack={goBack} />
        )}

        {currentScreen === 'pregnancy-diary' && (
          <PregnancyDiaryScreen onBack={goBack} onOpenWrite={openPregnancyDiaryWrite} />
        )}

        {currentScreen === 'pregnancy-diary-write' && (
          <PregnancyDiaryWriteScreen onBack={goBack} babyNickname={pregnancySummary.babyNickname} />
        )}

        {currentScreen === 'mombti-menu' && (
          <MombtiMenuScreen
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
            onOpenResult={openMombtiResult}
            onOpenTest={openMombtiTest}
          />
        )}

        {currentScreen === 'mombti-test' && (
          <MombtiTestScreen
            onBack={goBack}
            onComplete={() => navigateToScreen('mombti')}
          />
        )}

        {currentScreen === 'mombti' && (
          <MombtiDetailScreen
            data={mombti}
            onBack={goBack}
            onOpenHome={() => navigateToScreen('parent-mode')}
            onOpenDevice={openParentDevice}
            onOpenCommunity={openCommunity}
          />
        )}

        {currentScreen === 'home' && isHomeSheetOpen ? (
          <HomeSelectionSheet
            onClose={() => setIsHomeSheetOpen(false)}
            onOpenSettings={openSettings}
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
