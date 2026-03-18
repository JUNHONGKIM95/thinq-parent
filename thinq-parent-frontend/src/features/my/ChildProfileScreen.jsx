import { useEffect, useMemo, useState } from 'react'
import menuIcon from '@shared-assets/srg/Menu.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeDeviceIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import { API_BASE_URL } from '../../config/api'

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

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m5 8 7 7 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CalendarArrowIcon({ direction = 'left' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={direction === 'right' ? 'calendar-arrow-icon--right' : ''}
    >
      <path
        d="m14 6-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'home', label: '홈', icon: parentModeHomeIcon },
  { key: 'device', label: '가전육아', icon: parentModeDeviceIcon },
  { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon },
  { key: 'my', label: 'MY', icon: parentModeMyIcon },
]

const WEEKDAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

function parseIsoDate(isoDate) {
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function formatIsoDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function formatMonthLabel(date) {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function buildCalendarDays(viewDate) {
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1
    const date = new Date(year, month, day)
    const isoDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    return {
      day,
      isoDate,
      date,
    }
  })
}

function ChildProfileScreen({ data, userId, onBack, onOpenHome, onOpenDevice, onSaveDueDate }) {
  const initialSelectedDate = useMemo(() => parseIsoDate(data.selectedDate), [data.selectedDate])
  const [selectedDate, setSelectedDate] = useState(initialSelectedDate)
  const [viewDate, setViewDate] = useState(
    new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1)
  )
  const [isSaving, setIsSaving] = useState(false)

  const calendarDays = useMemo(() => buildCalendarDays(viewDate), [viewDate])

  useEffect(() => {
    setSelectedDate(initialSelectedDate)
    setViewDate(new Date(initialSelectedDate.getFullYear(), initialSelectedDate.getMonth(), 1))
  }, [initialSelectedDate])

  const handlePreviousMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))
  }

  const handleSelectDate = (isoDate) => {
    setSelectedDate(parseIsoDate(isoDate))
  }

  const handleSave = async () => {
    if (isSaving) {
      return
    }

    const dueDate = formatIsoDate(selectedDate)

    try {
      setIsSaving(true)

      const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}/due-date`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dueDate }),
      })

      if (!response.ok) {
        throw new Error(`Failed to save due date: ${response.status}`)
      }

      onSaveDueDate?.(dueDate)
    } catch (error) {
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="child-screen-shell">
      <header className="child-header">
        <button type="button" className="my-icon-button" aria-label="뒤로 가기" onClick={onBack}>
          <BackIcon />
        </button>
        <h1>우리 아이</h1>
        <button type="button" className="my-icon-button" aria-label="메뉴 열기">
          <img src={menuIcon} alt="" className="my-header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="child-content">
        <button type="button" className="child-method-card" aria-label="계산 방법 선택">
          <span className="child-method-label">계산 방법</span>
          <span className="child-method-divider" aria-hidden="true" />
          <span className="child-method-value">{data.calculationMethod}</span>
          <span className="child-method-icon" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </button>

        <section className="child-calendar-section">
          <div className="my-section-header">
            <span className="my-section-accent" aria-hidden="true" />
            <h3>날짜 선택하기</h3>
          </div>

          <div className="child-calendar-card">
            <div className="child-calendar-topbar">
              <button type="button" className="child-calendar-nav" aria-label="이전 달" onClick={handlePreviousMonth}>
                <CalendarArrowIcon />
              </button>
              <strong>{formatMonthLabel(viewDate)}</strong>
              <button type="button" className="child-calendar-nav" aria-label="다음 달" onClick={handleNextMonth}>
                <CalendarArrowIcon direction="right" />
              </button>
            </div>

            <div className="child-calendar-weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>

            <div className="child-calendar-grid">
              {calendarDays.map((day) => {
                const isSelected =
                  day.date.getFullYear() === selectedDate.getFullYear() &&
                  day.date.getMonth() === selectedDate.getMonth() &&
                  day.date.getDate() === selectedDate.getDate()

                return (
                  <button
                    key={day.isoDate}
                    type="button"
                    className={`child-calendar-day ${isSelected ? 'child-calendar-day--selected' : ''}`}
                    onClick={() => handleSelectDate(day.isoDate)}
                    aria-pressed={isSelected}
                  >
                    {day.day}
                  </button>
                )
              })}
            </div>
          </div>

          <button type="button" className="child-save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </section>
      </div>

      <nav className="my-bottom-nav" aria-label="우리 아이 하단 메뉴">
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

export default ChildProfileScreen
