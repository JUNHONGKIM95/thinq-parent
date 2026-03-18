import { useState } from 'react'
import menuIcon from '@shared-assets/srg/Menu.svg'
import plusScheduleIcon from '@shared-assets/srg/plus_schedule.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import ScheduleInputSheet, { DEFAULT_SCHEDULE_FORM } from '../parent/ScheduleInputSheet'

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

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 20 4.2-.8L19 8.4a1.4 1.4 0 0 0 0-2l-1.4-1.4a1.4 1.4 0 0 0-2 0L4.8 15.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m13.5 6.5 4 4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m9 5 7 7-7 7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 6v12M6 12h12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon({ checked }) {
  return (
    <span className={`my-todo-check ${checked ? 'is-checked' : 'is-unchecked'}`} aria-hidden="true">
      {checked ? (
        <svg viewBox="0 0 16 16">
          <path
            d="m4 8.3 2.2 2.2L12 4.8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  )
}

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: parentModeHomeIcon },
  { key: 'device', label: '가전육아', icon: parentModeDeviceIcon },
  { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon },
  { key: 'my', label: 'MY', icon: parentModeMyIcon },
]

function MyScreen({ data, onBack, onOpenHome, onOpenDevice, onOpenMombti, onOpenChildProfile, onOpenSchedule }) {
  const hasScheduleItems = data.schedule.items.length > 0
  const [isScheduleInputSheetOpen, setIsScheduleInputSheetOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM)

  const handleOpenScheduleInput = () => {
    setScheduleForm(DEFAULT_SCHEDULE_FORM)
    setIsScheduleInputSheetOpen(true)
  }

  const handleSaveSchedule = () => {
    if (!scheduleForm.title.trim()) {
      return
    }

    setScheduleForm(DEFAULT_SCHEDULE_FORM)
    setIsScheduleInputSheetOpen(false)
  }

  return (
    <div className="my-screen-shell">
      <header className="my-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>MY</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="my-content">
        <section className="my-profile-section">
          <button type="button" className="my-profile-card" aria-label="아이 사진 추가">
            <span className="my-profile-plus" aria-hidden="true">
              <PlusIcon />
            </span>
          </button>

          <div className="my-name-row">
            <h2>{data.childName}</h2>
            <button type="button" className="my-name-edit" aria-label="아이 이름 수정">
              <PencilIcon />
            </button>
          </div>
        </section>

        <section className="my-section my-section--baby">
          <div className="my-section-header">
            <span className="my-section-accent" aria-hidden="true" />
            <h3>우리 아이</h3>
            <button
              type="button"
              className="my-section-arrow"
              aria-label="우리 아이 상세 보기"
              onClick={onOpenChildProfile}
            >
              <ChevronIcon />
            </button>
          </div>

          <div className="my-baby-card">
            <div className="my-baby-info">
              <span className="my-baby-label">D-DAY</span>
              <strong>{data.dDay}</strong>
            </div>
            <span className="my-baby-divider" aria-hidden="true" />
            <div className="my-baby-info">
              <span className="my-baby-label">출산예정일</span>
              <strong>{data.dueDate}</strong>
            </div>
          </div>
        </section>

        <section className="my-section my-section--mombti">
          <div className="my-section-header">
            <span className="my-section-accent" aria-hidden="true" />
            <h3>{data.mombti.title}</h3>
          </div>

          <button type="button" className="my-mombti-card" onClick={onOpenMombti}>
            <img src={data.mombti.previewImage} alt="" className="my-mombti-image" />
            <div className="my-mombti-copy">
              <p>{data.mombti.description}</p>
              <span className="my-mombti-link">
                {data.mombti.ctaLabel}
                <ChevronIcon />
              </span>
            </div>
          </button>
        </section>

        <section className="my-section my-section--diary">
          <div className="my-section-header">
            <span className="my-section-accent" aria-hidden="true" />
            <h3>일기</h3>
          </div>

          <div className="my-diary-grid">
            {data.diaryCards.map((card) => (
              <button type="button" className={`my-diary-card my-diary-card--${card.key}`} key={card.key}>
                <img src={card.image} alt="" className="my-diary-image" />
                <span className="my-diary-label">{card.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="my-section my-section--schedule">
          <div className="my-section-header">
            <span className="my-section-accent" aria-hidden="true" />
            <h3>일정 관리</h3>
          </div>

          <div className="my-schedule-card">
            <div className="my-schedule-top-row">
              <button
                type="button"
                className="my-schedule-date-button"
                onClick={() => onOpenSchedule(false)}
                aria-label="캘린더 열기"
              >
                <div className="my-schedule-month">{data.schedule.monthLabel}</div>
                <div className="my-schedule-date">
                  <span className="my-schedule-day">{data.schedule.day}</span>
                  <span className="my-schedule-weekday">{data.schedule.dayOfWeek}</span>
                </div>
              </button>

              {!hasScheduleItems ? (
                <button
                  type="button"
                  className="my-schedule-add-button"
                  onClick={handleOpenScheduleInput}
                  aria-label="일정 추가"
                >
                  <img src={plusScheduleIcon} alt="" className="my-schedule-add-icon" aria-hidden="true" />
                </button>
              ) : null}
            </div>

            {hasScheduleItems ? (
              <button
                type="button"
                className="my-schedule-detail-button"
                onClick={() => onOpenSchedule(true)}
                aria-label="일정 상세 열기"
              >
                <div className="my-schedule-list">
                  {data.schedule.items.map((item) => (
                    <div
                      key={item.key}
                      className={`my-schedule-item ${item.tone === 'primary' ? 'is-primary' : item.tone === 'secondary' ? 'is-secondary' : ''}`}
                      style={
                        item.boxStyle
                          ? {
                              background: item.boxStyle.background,
                              color: item.boxStyle.color,
                              opacity: 0.8,
                            }
                          : undefined
                      }
                    >
                      <span>{item.title}</span>
                      <strong>{item.time}</strong>
                    </div>
                  ))}
                </div>
              </button>
            ) : null}
          </div>
        </section>

        <section className="my-section my-section--todo">
          <div className="my-todo-card">
            <div className="my-todo-head">
              <strong>TO DO</strong>
              <span>{data.todo.weekLabel}</span>
            </div>

            <div className="my-todo-list">
              {data.todo.items.map((item) => (
                <div key={item.key} className="my-todo-item">
                  <CheckIcon checked={item.checked} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <ScheduleInputSheet
        open={isScheduleInputSheetOpen}
        form={scheduleForm}
        onFormChange={setScheduleForm}
        onClose={() => setIsScheduleInputSheetOpen(false)}
        onSave={handleSaveSchedule}
      />

      <nav className="my-bottom-nav" aria-label="MY 하단 메뉴">
        {NAV_ITEMS.map((item) => {
          const handleClick = item.key === 'home' ? onOpenHome : item.key === 'device' ? onOpenDevice : undefined

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

export default MyScreen
