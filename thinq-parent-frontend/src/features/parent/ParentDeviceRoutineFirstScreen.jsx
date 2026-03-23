import backIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import firstRoutineImage from '@shared-assets/srg/firstroutine.svg'

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

function ParentDeviceRoutineFirstScreen({ onBack, onOpenHome, onOpenMy, onOpenCommunity, onStartRoutine, navIcons }) {
  return (
    <div className="parent-device-routine-detail-screen">
      <header className="parent-device-routine-header parent-device-routine-detail-header">
        <button type="button" className="parent-device-icon-button" onClick={onBack} aria-label="뒤로가기">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <h1>가전제품 루틴</h1>
        <button type="button" className="parent-device-icon-button" aria-label="메뉴">
          <img src={menuIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="parent-device-routine-detail-content">
        <div className="parent-device-routine-detail-copy">
          <h2>임신 초기 루틴</h2>
          <p>수면 방해 차단 ‘올 무음’ 루틴</p>
        </div>

        <div className="parent-device-routine-detail-card">
          <img
            src={firstRoutineImage}
            alt="세탁기, 건조기, 청소기, 공기청정기를 묶은 임신 초기 루틴 일러스트"
            className="parent-device-routine-detail-image"
          />
        </div>

        <div className="parent-device-routine-detail-description">
          <strong>편안한 휴식이 더 중요한 시기입니다.</strong>
          <p>공기청정기 소음·불빛을 끄고,</p>
          <p>로봇청소기와 세탁 종료 알림을 잠시 멈춥니다.</p>
        </div>

        <button type="button" className="parent-device-routine-detail-start-button" onClick={onStartRoutine}>
          <span>시작하기</span>
        </button>
      </div>

      <div className="parent-device-routine-bottom-bar" />

      <nav className="parent-mode-bottom-nav parent-device-routine-bottom-nav" aria-label="부모 모드 메뉴">
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

export default ParentDeviceRoutineFirstScreen
