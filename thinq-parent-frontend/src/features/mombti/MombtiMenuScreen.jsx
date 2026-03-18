import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: parentModeHomeIcon },
  { key: 'device', label: '가전육아', icon: parentModeDeviceIcon },
  { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon },
  { key: 'my', label: 'MY', icon: parentModeMyIcon },
]

function MombtiMenuScreen({ onBack, onOpenHome, onOpenDevice, onOpenCommunity, onOpenResult, onOpenTest }) {
  return (
    <div className="mombti-menu-shell">
      <header className="mombti-menu-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>MomBTI</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="mombti-menu-content">
        <button type="button" className="mombti-menu-card" onClick={onOpenResult}>
          <strong>결과 조회</strong>
          <p>상세한 분석 결과를 통해 나를 이해해보세요.</p>
        </button>

        <button type="button" className="mombti-menu-card" onClick={onOpenTest}>
          <strong>테스트하기</strong>
          <p>나의 유형을 알아보아요.</p>
        </button>
      </div>

      <nav className="my-bottom-nav" aria-label="MomBTI 하단 메뉴">
        {NAV_ITEMS.map((item) => {
          const handleClick =
            item.key === 'home'
              ? onOpenHome
              : item.key === 'device'
                ? onOpenDevice
                : item.key === 'community'
                  ? onOpenCommunity
                  : undefined

          return (
          <button
            key={item.key}
            type="button"
            className={`parent-mode-nav-item ${item.key === 'my' ? 'parent-mode-nav-item--active' : ''}`}
            aria-current={item.key === 'my' ? 'page' : undefined}
            onClick={handleClick}
          >
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={item.icon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">{item.label}</span>
          </button>
          )
        })}
      </nav>
    </div>
  )
}

export default MombtiMenuScreen
