import backIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import airPurifierIcon from '@shared-assets/srg/airpurifer.svg'
import cleanerIcon from '@shared-assets/srg/cleaner.svg'
import dryerIcon from '@shared-assets/srg/dryer.svg'
import washingMachineIcon from '@shared-assets/srg/washingmachine.svg'

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

const ROUTINE_CARDS = [
  {
    key: 'first',
    title: '임신 초기 루틴',
    description: "수면 방해 차단 '올 무음' 루틴",
    devices: [
      { key: 'washing-machine', src: washingMachineIcon, label: '세탁기' },
      { key: 'dryer', src: dryerIcon, label: '건조기' },
      { key: 'cleaner', src: cleanerIcon, label: '청소기' },
      { key: 'air-purifier', src: airPurifierIcon, label: '공기청정기' },
    ],
  },
  {
    key: 'middle',
    title: '임신 중기 루틴',
    description: "허리 굽힘 제로 '노터치' 세탁 루틴",
    devices: [
      { key: 'washing-machine', src: washingMachineIcon, label: '세탁기' },
      { key: 'dryer', src: dryerIcon, label: '건조기' },
    ],
  },
  {
    key: 'final',
    title: '임신 후기 루틴',
    description: "막달 대비 '미세먼지 차단' 루틴",
    devices: [
      { key: 'dryer', src: dryerIcon, label: '건조기' },
      { key: 'air-purifier', src: airPurifierIcon, label: '공기청정기' },
    ],
  },
]

function ParentDeviceRoutineScreen({
  onBack,
  onOpenHome,
  onOpenMy,
  onOpenCommunity,
  onOpenFirstRoutine,
  onOpenMiddleRoutine,
  onOpenFinalRoutine,
  navIcons,
}) {
  return (
    <div className="parent-device-routine-screen">
      <header className="parent-device-routine-header">
        <button type="button" className="parent-device-icon-button" onClick={onBack} aria-label="뒤로가기">
          <img src={backIcon} alt="" aria-hidden="true" />
        </button>
        <h1>가전제품 루틴</h1>
        <button type="button" className="parent-device-icon-button" aria-label="메뉴">
          <img src={menuIcon} alt="" aria-hidden="true" />
        </button>
      </header>

      <div className="parent-device-routine-content">
        <div className="parent-device-routine-list">
          {ROUTINE_CARDS.map((card) => {
            const isButtonCard = card.key === 'first' || card.key === 'middle' || card.key === 'final'
            const CardTag = isButtonCard ? 'button' : 'article'
            const handleClick =
              card.key === 'first'
                ? onOpenFirstRoutine
                : card.key === 'middle'
                  ? onOpenMiddleRoutine
                  : card.key === 'final'
                    ? onOpenFinalRoutine
                    : undefined

            return (
              <CardTag
                key={card.key}
                type={isButtonCard ? 'button' : undefined}
                className={`parent-device-routine-card parent-device-routine-card--${card.key} ${
                  isButtonCard ? 'parent-device-routine-card--button' : ''
                }`}
                onClick={handleClick}
              >
                <h2>{card.title}</h2>
                <div className="parent-device-routine-card-image-wrap" aria-hidden="true">
                  {card.devices.map((device) => (
                    <span
                      key={device.key}
                      className={`parent-device-routine-device-badge parent-device-routine-device-badge--${device.key}`}
                    >
                      <img src={device.src} alt="" className="parent-device-routine-device-image" />
                    </span>
                  ))}
                </div>
                <p>{card.description}</p>
              </CardTag>
            )
          })}
        </div>
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

export default ParentDeviceRoutineScreen
