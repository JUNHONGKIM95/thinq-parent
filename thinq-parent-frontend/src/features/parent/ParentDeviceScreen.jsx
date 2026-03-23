import backIcon from '@shared-assets/srg/Arrow_left.svg'
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

function ParentDeviceScreen({
  onBack,
  onOpenHome,
  onOpenMy,
  onOpenCommunity,
  onOpenRoutine,
  isAutoControlEnabled = false,
  isSoundControlEnabled = false,
  isAutoControlDisabled = false,
  isSoundControlDisabled = false,
  onToggleAutoControl,
  onToggleSoundControl,
  navIcons,
}) {
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
        <section className="parent-device-automation-card">
          <div className="parent-device-control-row">
            <div className="parent-device-control-copy">
              <div className="parent-device-control-header">
                <h3>가전제품 자동 제어</h3>
                <button
                  type="button"
                  className="parent-device-toggle-button parent-device-toggle-button--auto"
                  aria-label="가전제품 자동제어 토글"
                  aria-pressed={isAutoControlEnabled}
                  onClick={onToggleAutoControl}
                  disabled={isAutoControlDisabled}
                >
                  <span className="parent-device-toggle-visual parent-device-toggle-visual--auto" aria-hidden="true">
                    <img
                      src={autoOffIcon}
                      alt=""
                      className={`parent-device-toggle-image parent-device-toggle-image--auto-off ${
                        !isAutoControlEnabled ? 'is-visible' : ''
                      }`}
                    />
                    <img
                      src={autoOnIcon}
                      alt=""
                      className={`parent-device-toggle-image parent-device-toggle-image--auto-on ${
                        isAutoControlEnabled ? 'is-visible' : ''
                      }`}
                    />
                  </span>
                </button>
              </div>
              <p>와이파이모드가 최적 상태로 자동 제어해요.</p>
            </div>
          </div>

          <div className="parent-device-control-divider" aria-hidden="true" />

          <div className="parent-device-control-row">
            <div className="parent-device-control-copy">
              <div className="parent-device-control-header">
                <h3>가전 알림음 제어</h3>
                <button
                  type="button"
                  className="parent-device-toggle-button parent-device-toggle-button--sound"
                  aria-label="가전 알림음 제어 토글"
                  aria-pressed={isSoundControlEnabled}
                  onClick={onToggleSoundControl}
                  disabled={isSoundControlDisabled}
                >
                  <span className="parent-device-toggle-visual parent-device-toggle-visual--sound" aria-hidden="true">
                    <img
                      src={soundOffIcon}
                      alt=""
                      className={`parent-device-toggle-image parent-device-toggle-image--sound-off ${
                        !isSoundControlEnabled ? 'is-visible' : ''
                      }`}
                    />
                    <img
                      src={soundOnIcon}
                      alt=""
                      className={`parent-device-toggle-image parent-device-toggle-image--sound-on ${
                        isSoundControlEnabled ? 'is-visible' : ''
                      }`}
                    />
                  </span>
                </button>
              </div>
              <p>민감한 수면을 위해 가전 알림음을 조용한 상태로 바꿔줘요.</p>
            </div>
          </div>
        </section>

        <button type="button" className="parent-device-info-card" onClick={onOpenRoutine}>
          <h3>가전제품 루틴</h3>
          <p>임신 시기와 생활 패턴에 맞춘 추천 루틴을 확인해 보세요.</p>
        </button>
      </div>

      <div className="parent-device-bottom-bar" />

      <nav className="parent-mode-bottom-nav parent-device-bottom-nav" aria-label="부모 모드 메뉴">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === 'device'
          const handleClick =
            item.key === 'home'
              ? onOpenHome
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

export default ParentDeviceScreen
