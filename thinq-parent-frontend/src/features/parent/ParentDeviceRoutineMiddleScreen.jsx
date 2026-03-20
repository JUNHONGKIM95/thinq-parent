import backIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import middleRoutineImage from '@shared-assets/srg/middleroutine.svg'

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

function ParentDeviceRoutineMiddleScreen({ onBack, onOpenHome, onOpenMy, onOpenCommunity, navIcons }) {
  return (
    <div className="parent-device-routine-detail-screen parent-device-routine-detail-screen--middle">
      <header className="parent-device-routine-header parent-device-routine-detail-header">
        <button type="button" className="parent-device-icon-button" onClick={onBack} aria-label="뒤로가기">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <h1>가전제품 루틴</h1>
        <button type="button" className="parent-device-icon-button" aria-label="메뉴">
          <img src={menuIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="parent-device-routine-detail-content parent-device-routine-detail-content--middle">
        <div className="parent-device-routine-detail-copy parent-device-routine-detail-copy--middle">
          <h2>임신 중기 루틴</h2>
          <p>허리 굽힘 제로 ‘노터치’ 세탁 루틴</p>
        </div>

        <div className="parent-device-routine-detail-card parent-device-routine-detail-card--middle">
          <img
            src={middleRoutineImage}
            alt="세탁기와 건조기를 묶은 임신 중기 루틴 일러스트"
            className="parent-device-routine-detail-image"
          />
        </div>

        <div className="parent-device-routine-detail-description parent-device-routine-detail-description--middle">
          <strong>무거운 배로 오래 서 있기 힘든 시기입니다.</strong>
          <p>세탁기에서 빨래를 꺼내 건조기로 옮기는 과정은</p>
          <p>임산부에게 큰 부담이 됩니다.</p>
          <p>세탁 후 건조가 자동으로 이어져,</p>
          <p>허리를 굽히고 오래 조작하는 부담을 덜어줍니다.</p>
        </div>

        <button type="button" className="parent-device-routine-detail-start-button parent-device-routine-detail-start-button--middle">
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

export default ParentDeviceRoutineMiddleScreen
