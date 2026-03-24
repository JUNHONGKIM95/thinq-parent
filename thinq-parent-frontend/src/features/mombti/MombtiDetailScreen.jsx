import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
}

const NAV_ICONS = {
  home: parentModeHomeIcon,
  device: parentModeDeviceIcon,
  community: parentModeCommunityIcon,
  my: parentModeMyIcon,
}

function MombtiDetailScreen({ data, onBack, onOpenMombtiMenu, onOpenHome, onOpenDevice, onOpenCommunity }) {
  return (
    <div className="mombti-screen-shell">
      <header className="mombti-header">
        <button type="button" className="mombti-icon-button" aria-label="뒤로 가기" onClick={onOpenMombtiMenu}>
          <BackIcon />
        </button>
        <h1>MomBTI</h1>
        <button type="button" className="mombti-icon-button" aria-label="메뉴 열기" onClick={onOpenMombtiMenu}>
          <img src={menuIcon} alt="" className="mombti-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="mombti-content">
        <section className="mombti-panel">
          <div className="mombti-hero">
            <img src={data.copyImage || data.image} alt={`${data.type} 왼쪽 이미지`} className="mombti-side-image" />
            <img src={data.titleImage || data.image} alt={`${data.type} 결과 이미지`} className="mombti-hero-image" />
          </div>

          <section className="mombti-summary-box" aria-label="MomBTI 요약">
            <p>{data.summary}</p>
          </section>

          <section className="mombti-bars" aria-label="MomBTI 성향 점수">
            {data.scorePairs.map((pair) => (
              <div className="mombti-bar-group" key={pair.leftKey}>
                <div className="mombti-bar-labels">
                  <span>{pair.leftLabel}</span>
                  <span>{`${Math.round(pair.activePercent)}%`}</span>
                  <span>{pair.rightLabel}</span>
                </div>
                <div
                  className={`mombti-bar-track ${pair.activeSide === 'right' ? 'is-right' : 'is-left'}`}
                  aria-label={`${pair.leftLabel} ${pair.leftValue}, ${pair.rightLabel} ${pair.rightValue}`}
                >
                  <div className="mombti-bar-fill" style={{ width: `max(0px, calc(${pair.activePercent}% - 8px))` }} />
                </div>
              </div>
            ))}
          </section>

          <section className="mombti-details" aria-label="MomBTI 성향 설명">
            {data.details.map((detail) => (
              <article className={`mombti-detail-card ${detail.isSelected ? 'is-active' : ''}`} key={detail.key}>
                <h2>
                  {detail.key} ({detail.title})
                </h2>
                <p>{detail.desc}</p>
              </article>
            ))}
          </section>
        </section>
      </div>

      <nav className="mombti-bottom-nav" aria-label="MomBTI 하단 메뉴">
        {data.navigation.map((item) => {
          const iconSrc = NAV_ICONS[item.key] ?? parentModeHomeIcon
          const isActive = item.key === 'my'
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
              className={`parent-mode-nav-item ${isActive ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={handleClick}
            >
              <span className="parent-mode-nav-icon-frame" aria-hidden="true">
                <img src={iconSrc} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
              </span>
              <span className="parent-mode-nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default MombtiDetailScreen
