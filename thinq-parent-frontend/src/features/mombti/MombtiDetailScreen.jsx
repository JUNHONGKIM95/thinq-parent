import menuIcon from '@shared-assets/assets/icons/menu.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M15 5 8 12l7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV_ICONS = {
  home: parentModeHomeIcon,
  device: parentModeDeviceIcon,
  community: parentModeCommunityIcon,
  my: parentModeMyIcon,
}

function highlightText(text, target) {
  if (!target || !text.includes(target)) {
    return text
  }

  const [before, after] = text.split(target)

  return (
    <>
      {before}
      <span className="mombti-highlight">{target}</span>
      {after}
    </>
  )
}

function MombtiDetailScreen({ data, onBack }) {
  return (
    <div className="mombti-screen-shell">
      <header className="mombti-header">
        <button type="button" className="mombti-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>MomBTI</h1>
        <button type="button" className="mombti-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="mombti-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="mombti-content">
        <section className="mombti-panel">
          <div className="mombti-hero">
            <div className="mombti-copy">
              <span className="mombti-copy-accent" aria-hidden="true" />
              <div>
                <p className="mombti-type">{data.type}</p>
                <p className="mombti-title">{data.title}</p>
                <p className="mombti-subtitle">
                  {highlightText(data.subtitle, data.subtitleHighlight)}
                </p>
              </div>
            </div>

            <img src={data.image} alt={`${data.type} 유형 이미지`} className="mombti-hero-image" />
          </div>

          <section className="mombti-summary-box" aria-label="MomBTI 요약">
            <p>{data.summary}</p>
          </section>

          <section className="mombti-bars" aria-label="MomBTI 성향 점수">
            {data.scorePairs.map((pair) => (
              <div className="mombti-bar-group" key={pair.leftKey}>
                <div className="mombti-bar-labels">
                  <span>{pair.leftLabel}</span>
                  <span>{pair.rightLabel}</span>
                </div>
                <div
                  className="mombti-bar-track"
                  aria-label={`${pair.leftLabel} ${pair.leftValue}, ${pair.rightLabel} ${pair.rightValue}`}
                >
                  <div className="mombti-bar-fill" style={{ width: `${pair.activePercent}%` }} />
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

          return (
            <button
              key={item.key}
              type="button"
              className={`parent-mode-nav-item ${isActive ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
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
