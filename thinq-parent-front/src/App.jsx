import { useState } from 'react'
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
import plusImage from '@shared-assets/plus.png'
import bellIcon from '@shared-assets/icons/a_button.svg'
import plusButtonIcon from '@shared-assets/icons/button_plus.svg'
import careIcon from '@shared-assets/icons/care.svg'
import deviceIcon from '@shared-assets/icons/device.svg'
import homeIcon from '@shared-assets/icons/home.svg'
import homeMoreIcon from '@shared-assets/icons/home_more.svg'
import menuIcon from '@shared-assets/icons/menu.svg'
import moreButtonIcon from '@shared-assets/icons/more_button.svg'
import smartGoIcon from '@shared-assets/icons/smart_go.svg'

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
                size={34}
                className={`bottom-nav-icon ${activeTab === index ? 'active-nav-icon' : ''}`}
              />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}

function SettingCard({ title, description, image, className }) {
  return (
    <button type="button" className={`setting-card ${className}`}>
      <div className="setting-card-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <img src={image} alt="" className={`setting-card-image ${className}`} />
    </button>
  )
}

function HomeSettingsScreen({ onBack }) {
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
          />
        </section>
      </div>
    </>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [isHomeSheetOpen, setIsHomeSheetOpen] = useState(false)

  const openSettings = () => {
    setIsHomeSheetOpen(false)
    setCurrentScreen('settings')
  }

  return (
    <main className="app-shell">
      <section className={`phone-shell ${currentScreen === 'home' ? 'home-mode' : 'settings-mode'}`}>
        {currentScreen === 'home' ? (
          <HomeScreen
            activeTab={activeTab}
            onChangeTab={setActiveTab}
            onOpenSheet={() => setIsHomeSheetOpen(true)}
            isHomeSheetOpen={isHomeSheetOpen}
          />
        ) : (
          <HomeSettingsScreen onBack={() => setCurrentScreen('home')} />
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
