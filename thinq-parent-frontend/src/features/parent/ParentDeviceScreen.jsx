import { useState } from 'react'
import backIcon from '@shared-assets/srg/Arrow_left.svg'
import rightIcon from '@shared-assets/srg/Arrow_right.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import autoOffIcon from '@shared-assets/srg/elecoff.svg'
import autoOnIcon from '@shared-assets/srg/elecon.svg'
import soundOffIcon from '@shared-assets/srg/soundoff.svg'
import soundOnIcon from '@shared-assets/srg/soundon.svg'

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

function ParentDeviceScreen({ onBack, onOpenHome, onOpenMy, navIcons }) {
  const [isAutoControlEnabled, setIsAutoControlEnabled] = useState(true)
  const [isSoundControlEnabled, setIsSoundControlEnabled] = useState(false)

  return (
    <div className="parent-device-screen">
      <header className="parent-device-header">
        <button type="button" className="parent-device-icon-button" onClick={onBack} aria-label="뒤로가기">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <h1>가전육아</h1>
        <button type="button" className="parent-device-icon-button" aria-label="메뉴">
          <img src={menuIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="parent-device-content">
        <button type="button" className="parent-device-add-card">
          <span className="parent-device-add-accent" aria-hidden="true" />
          <div className="parent-device-add-copy">
            <h2>가전제품 추가</h2>
            <p>라이프모드로 제어할 가전을 추가해주세요.</p>
          </div>
          <img src={rightIcon} alt="" className="parent-device-add-arrow" aria-hidden="true" />
        </button>

        <section className="parent-device-automation-card">
          <div className="parent-device-control-row">
            <div className="parent-device-control-copy">
              <h3>가전제품 자동제어</h3>
              <p>라이프모드가 최적 상태로 자동 제어해요.</p>
            </div>
            <button
              type="button"
              className="parent-device-toggle-button"
              aria-label="가전제품 자동제어 토글"
              aria-pressed={isAutoControlEnabled}
              onClick={() => setIsAutoControlEnabled((prev) => !prev)}
            >
              <img src={isAutoControlEnabled ? autoOnIcon : autoOffIcon} alt="" aria-hidden="true" />
            </button>
          </div>

          <div className="parent-device-control-divider" aria-hidden="true" />

          <div className="parent-device-control-row">
            <div className="parent-device-control-copy">
              <h3>가전 알림음 제어</h3>
              <p>민감한 사용자를 위해 가전 알림음을 조명으로 대신해요.</p>
            </div>
            <button
              type="button"
              className="parent-device-toggle-button"
              aria-label="가전 알림음 제어 토글"
              aria-pressed={isSoundControlEnabled}
              onClick={() => setIsSoundControlEnabled((prev) => !prev)}
            >
              <img src={isSoundControlEnabled ? soundOnIcon : soundOffIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </section>

        <button type="button" className="parent-device-info-card">
          <h3>가전제품 수동제어</h3>
          <p>가족을 위한 가전제품 어쩌구</p>
        </button>

        <button type="button" className="parent-device-info-card">
          <h3>가전제품 루틴</h3>
          <p>내 일상에 맞춰진 가전</p>
        </button>
      </div>

      <div className="parent-device-bottom-bar" />

      <nav className="parent-mode-bottom-nav parent-device-bottom-nav" aria-label="부모 모드 메뉴">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === 'device'
          const handleClick =
            item.key === 'home' ? onOpenHome : item.key === 'my' ? onOpenMy : undefined

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

export default ParentDeviceScreen
