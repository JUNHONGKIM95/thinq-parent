import { useEffect, useState } from 'react'
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
import messageOpenIcon from '@shared-assets/srg/Message_open_light.svg'
import sendLightIcon from '@shared-assets/srg/Send_light.svg'
import heartIcon from '@shared-assets/srg/heart.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeBabyIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import chatFloatingIcon from '@shared-assets/srg/chat_floating.svg'
import sendDuotoneIcon from '@shared-assets/srg/Send_duotone_line.svg'
import sendMessageBubble from '@shared-assets/srg/send_message.svg'
import takeMessageBubble from '@shared-assets/srg/take_message.svg'
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
import ChildProfileScreen from './features/my/ChildProfileScreen'
import MombtiDetailScreen from './features/mombti/MombtiDetailScreen'
import MombtiMenuScreen from './features/mombti/MombtiMenuScreen'
import MombtiTestScreen from './features/mombti/MombtiTestScreen'
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
  meetingTitle: '틔움이 만나기',
  daysUntilDueDate: 102,
  daysUntilDueDateText: '102일 전',
}

async function fetchPregnancySummary(userId = 3) {
  const candidates = [
    `${API_BASE_URL}/api/pregnancy/summary?userId=${userId}`,
    `${API_BASE_URL}/pregnancy/summary?userId=${userId}`,
    `${API_BASE_URL}/api/pregnancy-summary?userId=${userId}`,
  ]

  for (const url of candidates) {
    try {
      const response = await fetch(url)

      if (!response.ok) {
        continue
      }

      const payload = await response.json()

      if (payload?.data) {
        return payload.data
      }
    } catch {
      // Try the next candidate endpoint.
    }
  }

  return DEFAULT_PREGNANCY_SUMMARY
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

function HeaderAction({ icon, label, compact = false }) {
  return (
    <button type="button" className="header-action" aria-label={label}>
      <AssetIcon src={icon} size={compact ? 14 : 22} />
    </button>
  )
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
          <HeaderAction icon={moreButtonIcon} label="더보기" compact />
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
          <span />
        </button>
        <h1>홈 설정</h1>
        <button type="button" className="settings-plus-button" aria-label="홈 추가">
          +
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
          <span />
        </button>
        <h1>라이프 에이전트</h1>
        <button type="button" className="life-agent-more-button" aria-label="더보기">
          <span />
          <span />
          <span />
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

  return (
    <div className="chat-expert-shell">
      <div className="chat-expert-card" aria-hidden="true" />
      <span className="chat-expert-status-time" aria-hidden="true">
        2:54
      </span>
      <span className="chat-expert-status-island" aria-hidden="true" />

      <header className="chat-expert-header">
        <button type="button" className="chat-expert-back" onClick={onBack} aria-label="뒤로가기">
          <span />
        </button>
        <span className="chat-expert-title-bold">챗태피티</span>
        <span className="chat-expert-title-regular">전문가</span>
        <button type="button" className="chat-expert-menu" aria-label="메뉴">
          <img src={headerMenuIcon} alt="" className="chat-expert-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="chat-expert-messages">
        <div className="chat-expert-bubble chat-expert-bubble-bot">
          <img src={takeMessageBubble} alt="" className="chat-expert-bubble-shape" aria-hidden="true" />
          <p>안녕하세요, 틔움이 어머니를 위한 전문가 챗봇입니다.</p>
        </div>
        <div className="chat-expert-bubble chat-expert-bubble-user">
          <img src={sendMessageBubble} alt="" className="chat-expert-bubble-shape" aria-hidden="true" />
          <p>질문내용</p>
        </div>
      </div>

      <div className="chat-expert-input-area">
        <input
          type="text"
          placeholder="메세지를 입력하세요."
          aria-label="메세지를 입력하세요."
          value={message}
          onChange={(event) => setMessage(event.target.value)}
        />
        <button type="button" className="chat-expert-send-btn" aria-label="전송">
          <img src={sendDuotoneIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

function ParentModeScreen({ onBack, onOpenChat, onOpenMy, onOpenSchedule, pregnancySummary }) {
  const [inputStatusIndex, setInputStatusIndex] = useState(0)

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
          <span />
        </button>
        <h1>부모 모드</h1>
        <button type="button" className="life-agent-more-button" aria-label="더보기">
          <span />
          <span />
          <span />
        </button>
      </header>

      <div className="parent-mode-body">
      <div className="parent-mode-content">
        <section className="parent-mode-meet">
          <h2 className="parent-mode-meet-title">{pregnancySummary.meetingTitle}</h2>
          <p className="parent-mode-meet-meta">
            <img src={heartIcon} alt="" className="parent-mode-heart" aria-hidden="true" />
            {`- ${pregnancySummary.daysUntilDueDate}일 전`}
          </p>
        </section>

        <div className="parent-mode-input-row">
          <img src={messageOpenIcon} alt="" className="parent-mode-input-icon" aria-hidden="true" />
          <span className="parent-mode-input-arrows" aria-hidden="true">
            <img
              src={sendLightIcon}
              alt=""
              className={`parent-mode-input-icon parent-mode-input-motion ${
                inputStatusIndex === 0 ? 'is-visible' : ''
              }`}
              aria-hidden="true"
            />
            <img
              src={sendLightIcon}
              alt=""
              className={`parent-mode-input-icon parent-mode-input-icon--rotate parent-mode-input-motion ${
                inputStatusIndex === 1 ? 'is-visible' : ''
              }`}
              aria-hidden="true"
            />
          </span>
          <img
            src={heartIcon}
            alt=""
            className={`parent-mode-input-heart parent-mode-input-motion ${
              inputStatusIndex === 2 ? 'is-visible' : ''
            }`}
            aria-hidden="true"
          />
          <p className="parent-mode-input-text">당신도 틔움이도 너무 사랑해 -틔움아빠</p>
        </div>

        <div className="parent-mode-cards-row">
          <button
            type="button"
            className="parent-mode-card parent-mode-calendar parent-mode-card-button"
            onClick={(event) => {
              if (event.target.closest('h3')) {
                onOpenSchedule()
              }
            }}
          >
            <h3>캘린더</h3>
            <p className="parent-mode-date-line">
              <span className="parent-mode-date">27</span>
              <span className="parent-mode-day">금</span>
            </p>
            <div className="parent-mode-events">
              <div className="parent-mode-event-box parent-mode-event-box--red">
                <span className="parent-mode-event-label">산부인과</span>
                <span className="parent-mode-event-time">15:00</span>
              </div>
              <div className="parent-mode-event-box parent-mode-event-box--yellow">
                <span className="parent-mode-event-label">당근</span>
                <span className="parent-mode-event-time">21:30</span>
              </div>
            </div>
          </button>
          <section className="parent-mode-card parent-mode-todo">
            <div className="parent-mode-todo-head">
              <h3>TO DO</h3>
              <span className="parent-mode-week">25주차</span>
            </div>
            <label className="parent-mode-todo-item">
              <input type="checkbox" className="parent-mode-todo-checkbox" defaultChecked />
              <span className="parent-mode-todo-check" aria-hidden="true" />
              <span>임신성 당뇨 선별검사 받기</span>
            </label>
            <label className="parent-mode-todo-item">
              <input type="checkbox" className="parent-mode-todo-checkbox" />
              <span className="parent-mode-todo-check" aria-hidden="true" />
              <span>골반저근 운동</span>
            </label>
          </section>
        </div>

        <section className="parent-mode-diary">
          <h3>임신 일기</h3>
          <p className="parent-mode-diary-desc">소중한 매일의 순간을 기록해보세요.</p>
          <button type="button" className="parent-mode-diary-image-wrap">
            <img src={lookDiaryImage} alt="일기 보기" />
          </button>
        </section>

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
        <button type="button" className="parent-mode-nav-item" aria-label="홈">
          <span className="parent-mode-nav-icon-frame" aria-hidden="true">
            <img src={parentModeHomeIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
          </span>
          <span className="parent-mode-nav-label">홈</span>
        </button>
        <button type="button" className="parent-mode-nav-item parent-mode-nav-item--active" aria-label="가전육아">
          <span className="parent-mode-nav-icon-frame" aria-hidden="true">
            <img src={parentModeBabyIcon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
          </span>
          <span className="parent-mode-nav-label">가전육아</span>
        </button>
        <button type="button" className="parent-mode-nav-item" aria-label="커뮤니티">
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
      </div>
    </>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isHomeSheetOpen, setIsHomeSheetOpen] = useState(false)
  const [pregnancySummary, setPregnancySummary] = useState(DEFAULT_PREGNANCY_SUMMARY)
  const myPage = mockMyPage
  const childProfile = mockChildProfile
  const parentSchedule = mockParentSchedule
  const mombti = buildMombtiViewModel(mockMombtiRow, mockMombtiMeta)

  useEffect(() => {
    let isMounted = true

    fetchPregnancySummary(3).then((data) => {
      if (!isMounted || !data) {
        return
      }

      setPregnancySummary({
        meetingTitle: data.meetingTitle ?? `${data.babyNickname ?? '틔움이'} 만나기`,
        daysUntilDueDate: data.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate,
        daysUntilDueDateText:
          data.daysUntilDueDateText ??
          `${data.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate}일 전`,
      })
    })

    return () => {
      isMounted = false
    }
  }, [])

  const openSettings = () => {
    setIsHomeSheetOpen(false)
    setCurrentScreen('settings')
  }

  const openLifeAgent = () => {
    setCurrentScreen('life-agent')
  }

  const openParentMode = () => {
    setCurrentScreen('parent-mode')
  }

  const openParentModeChat = () => {
    setCurrentScreen('parent-mode-chat')
  }

  const openMyScreen = () => {
    setCurrentScreen('my')
  }

  const openParentSchedule = () => {
    setCurrentScreen('parent-mode-schedule')
  }

  const openChildProfile = () => {
    setCurrentScreen('child-profile')
  }

  const openMombti = () => {
    setCurrentScreen('mombti-menu')
  }

  const openMombtiResult = () => {
    setCurrentScreen('mombti')
  }

  const openMombtiTest = () => {
    setCurrentScreen('mombti-test')
  }

  const phoneShellClass =
    currentScreen === 'home'
      ? 'home-mode'
      : currentScreen === 'parent-mode' ||
          currentScreen === 'parent-mode-chat' ||
          currentScreen === 'parent-mode-schedule'
        ? 'parent-mode'
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
          <HomeSettingsScreen onBack={() => setCurrentScreen('home')} onOpenLifeAgent={openLifeAgent} />
        )}

        {currentScreen === 'life-agent' && (
          <LifeAgentScreen
            onBack={() => setCurrentScreen('settings')}
            onOpenParentMode={openParentMode}
          />
        )}

        {currentScreen === 'parent-mode' && (
          <ParentModeScreen
            onBack={() => setCurrentScreen('life-agent')}
            onOpenChat={openParentModeChat}
            onOpenMy={openMyScreen}
            onOpenSchedule={openParentSchedule}
            pregnancySummary={pregnancySummary}
          />
        )}

        {currentScreen === 'parent-mode-chat' && (
          <ChatExpertScreen onBack={() => setCurrentScreen('parent-mode')} />
        )}

        {currentScreen === 'parent-mode-schedule' && (
          <ParentScheduleScreen
            data={parentSchedule}
            onBack={() => setCurrentScreen('parent-mode')}
            onOpenMy={openMyScreen}
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
            onBack={() => setCurrentScreen('parent-mode')}
            onOpenChildProfile={openChildProfile}
            onOpenMombti={openMombti}
          />
        )}

        {currentScreen === 'child-profile' && (
          <ChildProfileScreen data={childProfile} onBack={() => setCurrentScreen('my')} />
        )}

        {currentScreen === 'mombti-menu' && (
          <MombtiMenuScreen
            onBack={() => setCurrentScreen('my')}
            onOpenResult={openMombtiResult}
            onOpenTest={openMombtiTest}
          />
        )}

        {currentScreen === 'mombti-test' && (
          <MombtiTestScreen
            onBack={() => setCurrentScreen('mombti-menu')}
            onComplete={() => setCurrentScreen('mombti')}
          />
        )}

        {currentScreen === 'mombti' && (
          <MombtiDetailScreen data={mombti} onBack={() => setCurrentScreen('mombti-menu')} />
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
