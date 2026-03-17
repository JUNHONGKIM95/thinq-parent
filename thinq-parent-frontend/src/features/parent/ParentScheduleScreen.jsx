import { useMemo, useState } from 'react'
import menuIcon from '@shared-assets/srg/Menu.svg'

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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m6 5 12 4-3.5 3.5 2 4-1.5 1.5-4-2L7.5 20 6 18.5l3.5-3.5-2-4z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckIcon({ checked }) {
  return (
    <span className={`parent-schedule-check ${checked ? 'is-checked' : 'is-unchecked'}`} aria-hidden="true">
      {checked ? (
        <svg viewBox="0 0 16 16">
          <path
            d="m4 8.2 2.1 2.1L12 4.6"
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
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

function getDayOfWeekLabel(dateKey) {
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  return labels[new Date(dateKey).getDay()]
}

function ParentScheduleScreen({ data, onBack, onOpenMy, navIcons }) {
  const [selectedDateKey, setSelectedDateKey] = useState(null)

  const selectedDetail = useMemo(() => {
    if (!selectedDateKey) {
      return null
    }

    const flatDays = data.weeks.flat()
    const selectedDay = flatDays.find((day) => day.key === selectedDateKey)
    const detail = data.details[selectedDateKey]

    if (detail) {
      return detail
    }

    return {
      day: selectedDay?.label ?? '',
      dayOfWeek: getDayOfWeekLabel(selectedDateKey),
      items: [],
    }
  }, [data.details, data.weeks, selectedDateKey])

  return (
    <div className="parent-schedule-screen">
      <header className="parent-schedule-header">
        <button type="button" className="parent-schedule-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>일정 관리</h1>
        <button type="button" className="parent-schedule-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="parent-schedule-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="parent-schedule-content">
        <section className="parent-schedule-calendar-card">
          <h2>{data.monthLabel}</h2>

          <div className="parent-schedule-weekdays">
            {data.weekdays.map((weekday) => (
              <span
                key={weekday.key}
                className={`parent-schedule-weekday ${
                  weekday.tone === 'sun'
                    ? 'is-sunday'
                    : weekday.tone === 'sat'
                      ? 'is-saturday'
                      : ''
                }`}
              >
                {weekday.label}
              </span>
            ))}
          </div>

          <div className="parent-schedule-grid">
            {data.weeks.map((week, weekIndex) => (
              <div className="parent-schedule-week" key={`week-${weekIndex}`}>
                {week.map((day) => {
                  const isSelected = day.key === selectedDateKey

                  return (
                    <button
                      key={day.key}
                      type="button"
                      className={`parent-schedule-day ${!day.inMonth ? 'is-muted' : ''} ${
                        isSelected ? 'is-selected' : ''
                      }`}
                      onClick={() => setSelectedDateKey((prev) => (prev === day.key ? null : day.key))}
                    >
                      <span className="parent-schedule-day-number">{day.label}</span>
                      {day.markers?.length ? (
                        <span className="parent-schedule-markers">
                          {day.markers.map((marker) => (
                            <span
                              key={marker.key}
                              className={`parent-schedule-marker ${
                                marker.tone === 'primary' ? 'is-primary' : 'is-secondary'
                              }`}
                            >
                              {marker.label}
                            </span>
                          ))}
                        </span>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </section>

        {selectedDetail ? (
          <section className="parent-schedule-detail-card">
            <div className="parent-schedule-detail-date">
              <strong>{selectedDetail.day}</strong>
              <span>{selectedDetail.dayOfWeek}</span>
            </div>

            {selectedDetail.items.length ? (
              <div className="parent-schedule-detail-list">
                {selectedDetail.items.map((item) => (
                  <article className="parent-schedule-detail-item" key={item.key}>
                    <span
                      className={`parent-schedule-detail-badge ${item.tone === 'primary' ? 'is-primary' : 'is-secondary'}`}
                    />
                    <div className="parent-schedule-detail-copy">
                      <p className="parent-schedule-detail-title">{item.title}</p>
                      <p className="parent-schedule-detail-line">
                        <strong>{item.time}</strong>
                        <span>{item.location}</span>
                      </p>
                      <p className="parent-schedule-detail-note">{item.note}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="parent-schedule-empty">선택한 날짜에는 등록된 일정이 없어요.</p>
            )}
          </section>
        ) : null}

        <section className="parent-schedule-todo-card">
          <div className="parent-schedule-todo-head">
            <div className="parent-schedule-todo-title">
              <strong>TO DO</strong>
              <span>{data.todo.weekLabel}</span>
            </div>

            <button type="button" className="parent-schedule-todo-add" aria-label="할 일 추가">
              <PlusIcon />
            </button>
          </div>

          <div className="parent-schedule-todo-section">
            <p className="parent-schedule-todo-section-title">추천</p>
            <div className="parent-schedule-todo-list">
              {data.todo.recommended.map((item) => (
                <div className="parent-schedule-todo-item" key={item.key}>
                  <CheckIcon checked={item.checked} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="parent-schedule-todo-section">
            <p className="parent-schedule-todo-section-title with-icon">
              <PinIcon />
              <span>MY LIST</span>
            </p>
            <div className="parent-schedule-todo-list">
              {data.todo.myList.map((item) => (
                <div className="parent-schedule-todo-item" key={item.key}>
                  <CheckIcon checked={item.checked} />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="parent-mode-bottom-bar" />

      <nav className="parent-mode-bottom-nav" aria-label="부모 모드 메뉴">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`parent-mode-nav-item ${item.key === 'device' ? 'parent-mode-nav-item--active' : ''}`}
            aria-current={item.key === 'device' ? 'page' : undefined}
            onClick={item.key === 'my' ? onOpenMy : undefined}
          >
            <span className="parent-mode-nav-icon-frame" aria-hidden="true">
              <img src={navIcons[item.key]} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
            </span>
            <span className="parent-mode-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default ParentScheduleScreen
