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

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m12 3.6 2.45 4.97 5.49.8-3.97 3.87.94 5.47L12 16.1l-4.91 2.58.94-5.47-3.97-3.87 5.49-.8L12 3.6Z"
        fill="#FFB700"
        stroke="#222222"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

const NAV_ITEMS = [
  { key: 'home', label: '홈' },
  { key: 'device', label: '가전육아' },
  { key: 'community', label: '커뮤니티' },
  { key: 'my', label: 'MY' },
]

const DEFAULT_ACTIVE_DATE_KEY = '2026-03-27'
const TODO_PRIORITY_OPTIONS = [
  { key: 'low', label: '낮음', toneClass: 'is-low' },
  { key: 'medium', label: '보통', toneClass: 'is-medium' },
  { key: 'high', label: '높음', toneClass: 'is-high' },
  { key: 'urgent', label: '우선', toneClass: 'is-urgent' },
]
const SCHEDULE_TYPE_OPTIONS = [
  { key: 'baby', label: '아기', color: '#ff3b3b', textColor: '#ffffff' },
  { key: 'family', label: '가족', color: '#8fbc69', textColor: '#ffffff' },
  { key: 'work', label: '일', color: '#7478a8', textColor: '#ffffff' },
  { key: 'personal', label: '개인', color: '#fef19f', textColor: '#000000' },
  { key: 'important', label: '중요', color: '#2e2e2e', textColor: '#ffffff' },
  { key: 'etc', label: '기타', color: '#b285bb', textColor: '#ffffff' },
]
const DEFAULT_SCHEDULE_FORM = {
  title: '',
  typeKey: 'baby',
  hour: '00',
  minute: '00',
  period: 'am',
  memo: '',
}

function getDayOfWeekLabel(dateKey) {
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  return labels[new Date(dateKey).getDay()]
}

function getLegacyColor(tone) {
  if (tone === 'secondary') {
    return { color: '#ffed8d', textColor: '#494949' }
  }

  return { color: '#ff3434', textColor: '#ffffff' }
}

function cloneTodoGroup(todoGroup) {
  return {
    weekLabel: todoGroup.weekLabel,
    recommended: todoGroup.recommended.map((item) => ({ ...item })),
    myList: todoGroup.myList.map((item) => ({ ...item })),
  }
}

function cloneWeeks(weeks) {
  return weeks.map((week) =>
    week.map((day) => ({
      ...day,
      markers: day.markers ? day.markers.map((marker) => ({ ...marker })) : undefined,
    }))
  )
}

function cloneDetails(details) {
  return Object.fromEntries(
    Object.entries(details).map(([dateKey, detail]) => [
      dateKey,
      {
        ...detail,
        items: detail.items.map((item) => ({ ...item })),
      },
    ])
  )
}

function buildTodoState(todoData) {
  const initialState = {
    default: cloneTodoGroup(todoData.default),
  }

  Object.entries(todoData.byDate ?? {}).forEach(([dateKey, todoGroup]) => {
    initialState[dateKey] = cloneTodoGroup(todoGroup)
  })

  return initialState
}

function createEmptyTodoGroup(baseGroup, dateLabel) {
  return {
    weekLabel: dateLabel,
    recommended: baseGroup.recommended.map((item) => ({ ...item })),
    myList: [],
  }
}

function getTypeOption(typeKey) {
  return SCHEDULE_TYPE_OPTIONS.find((option) => option.key === typeKey) ?? SCHEDULE_TYPE_OPTIONS[0]
}

function normalizeTimePart(rawValue, maxValue) {
  const digits = rawValue.replace(/\D/g, '').slice(0, 2)

  if (!digits) {
    return ''
  }

  return String(Math.min(Number(digits), maxValue)).padStart(2, '0')
}

function getScheduleVisual(item) {
  if (item.typeKey) {
    const option = getTypeOption(item.typeKey)

    return {
      color: option.color,
      textColor: option.textColor,
    }
  }

  if (item.color) {
    return {
      color: item.color,
      textColor: item.textColor ?? '#ffffff',
    }
  }

  return getLegacyColor(item.tone)
}

function ParentScheduleScreen({ data, onBack, onOpenMy, navIcons }) {
  const [activeDateKey, setActiveDateKey] = useState(DEFAULT_ACTIVE_DATE_KEY)
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const [isTodoActionSheetOpen, setIsTodoActionSheetOpen] = useState(false)
  const [isTodoInputSheetOpen, setIsTodoInputSheetOpen] = useState(false)
  const [isScheduleInputSheetOpen, setIsScheduleInputSheetOpen] = useState(false)
  const [isTodoDeleteSheetOpen, setIsTodoDeleteSheetOpen] = useState(false)
  const [todoInputValue, setTodoInputValue] = useState('')
  const [selectedPriority, setSelectedPriority] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM)
  const [deleteTargetKeys, setDeleteTargetKeys] = useState([])
  const [calendarWeeks, setCalendarWeeks] = useState(() => cloneWeeks(data.weeks))
  const [scheduleDetails, setScheduleDetails] = useState(() => cloneDetails(data.details))
  const [todosByDate, setTodosByDate] = useState(() => buildTodoState(data.todo))

  const selectedDetail = useMemo(() => {
    if (!activeDateKey) {
      return null
    }

    const flatDays = calendarWeeks.flat()
    const selectedDay = flatDays.find((day) => day.key === activeDateKey)
    const detail = scheduleDetails[activeDateKey]

    if (detail) {
      return detail
    }

    return {
      day: selectedDay?.label ?? '',
      dayOfWeek: getDayOfWeekLabel(activeDateKey),
      items: [],
    }
  }, [activeDateKey, calendarWeeks, scheduleDetails])

  const handleDayClick = (dayKey) => {
    setActiveDateKey(dayKey)
    setIsDetailOpen(true)
  }

  const activeTodoKey = activeDateKey && todosByDate[activeDateKey] ? activeDateKey : 'default'
  const activeTodoGroup = todosByDate[activeTodoKey]
  const todoDateLabel = activeDateKey
    ? `${selectedDetail?.day ?? new Date(activeDateKey).getDate()}일 ${selectedDetail?.dayOfWeek ?? getDayOfWeekLabel(activeDateKey)}`
    : '날짜 선택'

  const toggleTodo = (listType, todoKey) => {
    setTodosByDate((prev) => {
      const currentGroup = prev[activeTodoKey]

      return {
        ...prev,
        [activeTodoKey]: {
          ...currentGroup,
          [listType]: currentGroup[listType].map((item) =>
            item.key === todoKey ? { ...item, checked: !item.checked } : item
          ),
        },
      }
    })
  }

  const handleSaveSchedule = () => {
    const trimmedValue = scheduleForm.title.trim()

    if (!trimmedValue) {
      return
    }

    const targetKey = activeDateKey ?? 'default'
    const typeOption = getTypeOption(scheduleForm.typeKey)
    const targetDateLabel = activeDateKey
      ? `${selectedDetail?.day ?? new Date(activeDateKey).getDate()}일 ${selectedDetail?.dayOfWeek ?? getDayOfWeekLabel(activeDateKey)}`
      : '날짜 선택'
    const timeLabel = `${scheduleForm.period === 'am' ? '오전' : '오후'} ${scheduleForm.hour}:${scheduleForm.minute}`
    const newItem = {
      key: `schedule-${Date.now()}`,
      title: trimmedValue,
      time: timeLabel,
      note: scheduleForm.memo.trim(),
      color: typeOption.color,
      textColor: typeOption.textColor,
      typeKey: typeOption.key,
    }

    setScheduleDetails((prev) => {
      const currentDetail = prev[targetKey] ?? {
        day: selectedDetail?.day ?? new Date(targetKey).getDate().toString(),
        dayOfWeek: selectedDetail?.dayOfWeek ?? getDayOfWeekLabel(targetKey),
        items: [],
      }

      return {
        ...prev,
        [targetKey]: {
          ...currentDetail,
          items: [...currentDetail.items, newItem],
        },
      }
    })

    setCalendarWeeks((prev) =>
      prev.map((week) =>
        week.map((day) => {
          if (day.key !== targetKey) {
            return day
          }

          return {
            ...day,
            markers: [
              ...(day.markers ?? []),
              {
                key: newItem.key,
                label: newItem.title,
                color: newItem.color,
                textColor: newItem.textColor,
              },
            ],
          }
        })
      )
    )

    setScheduleForm(DEFAULT_SCHEDULE_FORM)
    setIsDetailOpen(true)
    setIsScheduleInputSheetOpen(false)
  }

  const handleSaveTodo = () => {
    const trimmedValue = todoInputValue.trim()

    if (!trimmedValue) {
      return
    }

    const targetKey = activeDateKey ?? 'default'
    const targetDateLabel = activeDateKey
      ? `${selectedDetail?.day ?? new Date(activeDateKey).getDate()}일 ${selectedDetail?.dayOfWeek ?? getDayOfWeekLabel(activeDateKey)}`
      : '날짜 선택'

    setTodosByDate((prev) => {
      const fallbackGroup = prev.default
      const currentGroup = prev[targetKey] ?? createEmptyTodoGroup(fallbackGroup, targetDateLabel)

      return {
        ...prev,
        [targetKey]: {
          ...currentGroup,
          weekLabel: targetDateLabel,
          myList: [
            ...currentGroup.myList,
            {
              key: `custom-${Date.now()}`,
              text: trimmedValue,
              checked: false,
              priority: selectedPriority,
            },
          ],
        },
      }
    })

    setTodoInputValue('')
    setSelectedPriority(null)
    setIsTodoInputSheetOpen(false)
  }

  const toggleDeleteTarget = (todoKey) => {
    setDeleteTargetKeys((prev) =>
      prev.includes(todoKey) ? prev.filter((key) => key !== todoKey) : [...prev, todoKey]
    )
  }

  const handleDeleteTodos = () => {
    if (!deleteTargetKeys.length) {
      return
    }

    setTodosByDate((prev) => {
      const currentGroup = prev[activeTodoKey]

      return {
        ...prev,
        [activeTodoKey]: {
          ...currentGroup,
          myList: currentGroup.myList.filter((item) => !deleteTargetKeys.includes(item.key)),
        },
      }
    })

    setDeleteTargetKeys([])
    setIsTodoDeleteSheetOpen(false)
  }

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
            {calendarWeeks.map((week, weekIndex) => (
              <div className="parent-schedule-week" key={`week-${weekIndex}`}>
                {week.map((day) => {
                  const isSelected = day.key === activeDateKey

                  return (
                    <button
                      key={day.key}
                      type="button"
                      className={`parent-schedule-day ${!day.inMonth ? 'is-muted' : ''} ${
                        isSelected ? 'is-selected' : ''
                      }`}
                      onClick={() => handleDayClick(day.key)}
                    >
                      <span className="parent-schedule-day-number">{day.label}</span>
                      {day.markers?.length ? (
                        <span className="parent-schedule-markers">
                          {day.markers.map((marker) => (
                            <span
                              key={marker.key}
                              className="parent-schedule-marker"
                              style={{
                                background: marker.color ?? getLegacyColor(marker.tone).color,
                                color: marker.textColor ?? getLegacyColor(marker.tone).textColor,
                              }}
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

          {selectedDetail && isDetailOpen ? (
            <div
              className="parent-schedule-popup-backdrop"
              role="presentation"
              onClick={() => setIsDetailOpen(false)}
            >
              <section
                className="parent-schedule-detail-card parent-schedule-detail-popup"
                role="dialog"
                aria-modal="true"
                aria-label={`${selectedDetail.day}일 일정`}
                onClick={(event) => event.stopPropagation()}
              >
                <div
                  className="parent-schedule-detail-date"
                  onClick={() => {
                    setScheduleForm(DEFAULT_SCHEDULE_FORM)
                    setIsScheduleInputSheetOpen(true)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setScheduleForm(DEFAULT_SCHEDULE_FORM)
                      setIsScheduleInputSheetOpen(true)
                    }
                  }}
                >
                  <strong>{selectedDetail.day}</strong>
                  <span>{selectedDetail.dayOfWeek}</span>
                </div>

                {selectedDetail.items.length ? (
                  <div className="parent-schedule-detail-list">
                    {selectedDetail.items.map((item) => (
                      <article className="parent-schedule-detail-item" key={item.key}>
                        <span
                          className="parent-schedule-detail-badge"
                          style={{ background: getScheduleVisual(item).color }}
                        />
                        <div className="parent-schedule-detail-copy">
                          <p className="parent-schedule-detail-title">{item.title}</p>
                          <p className="parent-schedule-detail-line">
                            <strong>{item.time}</strong>
                            {item.location ? <span>{item.location}</span> : null}
                          </p>
                          {item.note ? <p className="parent-schedule-detail-note">{item.note}</p> : null}
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="parent-schedule-empty">선택한 날짜에는 등록된 일정이 없어요.</p>
                )}
              </section>
            </div>
          ) : null}
        </section>

        <section className="parent-schedule-todo-card">
          <div className="parent-schedule-todo-head">
            <div className="parent-schedule-todo-title">
              <strong>TO DO</strong>
              <span>{todoDateLabel}</span>
            </div>

            <button
              type="button"
              className="parent-schedule-todo-add"
              aria-label="할 일 추가"
              onClick={() => setIsTodoActionSheetOpen(true)}
            >
              <PlusIcon />
            </button>
          </div>

          <div className="parent-schedule-todo-body">
            <div className="parent-schedule-todo-section">
              <p className="parent-schedule-todo-section-title with-icon is-recommended">
                <StarIcon />
                <span>추천</span>
              </p>
              <div className="parent-schedule-todo-list">
                {activeTodoGroup.recommended.map((item) => (
                  <label className="parent-schedule-todo-item" key={item.key}>
                    <input
                      type="checkbox"
                      className="parent-schedule-checkbox-input"
                      checked={item.checked}
                      onChange={() => toggleTodo('recommended', item.key)}
                    />
                    <span className="parent-schedule-check" aria-hidden="true" />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="parent-schedule-todo-section">
              <p className="parent-schedule-todo-section-title with-icon is-my-list">
                <PinIcon />
                <span>MY LIST</span>
              </p>
              <div className="parent-schedule-todo-list">
                {activeTodoGroup.myList.map((item) => (
                  <label className="parent-schedule-todo-item" key={item.key}>
                    <input
                      type="checkbox"
                      className="parent-schedule-checkbox-input"
                      checked={item.checked}
                      onChange={() => toggleTodo('myList', item.key)}
                    />
                    <span className="parent-schedule-check" aria-hidden="true" />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>
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

      {isTodoActionSheetOpen ? (
        <div
          className="parent-schedule-action-overlay"
          role="presentation"
          onClick={() => setIsTodoActionSheetOpen(false)}
        >
          <section
            className="parent-schedule-action-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="할 일 작업 선택"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="parent-schedule-action-button is-add"
              onClick={() => {
                setIsTodoActionSheetOpen(false)
                setTodoInputValue('')
                setSelectedPriority(null)
                setIsTodoInputSheetOpen(true)
              }}
            >
              추가하기
            </button>
            <button
              type="button"
              className="parent-schedule-action-button is-delete"
              onClick={() => {
                setIsTodoActionSheetOpen(false)
                setDeleteTargetKeys([])
                setIsTodoDeleteSheetOpen(true)
              }}
            >
              삭제하기
            </button>
          </section>
        </div>
      ) : null}

      {isTodoInputSheetOpen ? (
        <div
          className="parent-schedule-action-overlay"
          role="presentation"
          onClick={() => setIsTodoInputSheetOpen(false)}
        >
          <section
            className="parent-schedule-todo-input-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="할 일 입력"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="parent-schedule-todo-input-header">
              <label className="parent-schedule-todo-inline-input">
                <span className="sr-only">할 일 입력</span>
                <input
                  type="text"
                  value={todoInputValue}
                  onChange={(event) => setTodoInputValue(event.target.value)}
                  placeholder="할일입력"
                  autoFocus
                />
              </label>
              <button
                type="button"
                className="parent-schedule-todo-save"
                onClick={handleSaveTodo}
              >
                저장
              </button>
            </div>

            <div className="parent-schedule-todo-priority-row">
              <span className="parent-schedule-todo-priority-label">시급도</span>
              <div className="parent-schedule-todo-priority-buttons">
                {TODO_PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    className={`parent-schedule-priority-button ${option.toneClass} ${
                      selectedPriority === option.key ? 'is-selected' : ''
                    }`}
                    onClick={() => setSelectedPriority(option.key)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {isScheduleInputSheetOpen ? (
        <div
          className="parent-schedule-action-overlay"
          role="presentation"
          onClick={() => setIsScheduleInputSheetOpen(false)}
        >
          <section
            className="parent-schedule-schedule-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="일정 입력"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="parent-schedule-sheet-handle" aria-hidden="true" />

            <div className="parent-schedule-schedule-header">
              <label className="parent-schedule-schedule-title-input">
                <span className="sr-only">일정 제목 입력</span>
                <input
                  type="text"
                  value={scheduleForm.title}
                  onChange={(event) =>
                    setScheduleForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  placeholder="일정제목입력"
                  autoFocus
                />
              </label>
              <button
                type="button"
                className="parent-schedule-schedule-save"
                onClick={handleSaveSchedule}
              >
                저장
              </button>
            </div>

            <div className="parent-schedule-form-section">
              <span className="parent-schedule-form-label">일정 유형</span>
              <div className="parent-schedule-type-grid">
                {SCHEDULE_TYPE_OPTIONS.map((option) => {
                  const isSelected = scheduleForm.typeKey === option.key

                  return (
                    <button
                      key={option.key}
                      type="button"
                      className="parent-schedule-type-button"
                      style={{
                        background: option.color,
                        color: option.textColor,
                        opacity: scheduleForm.typeKey && !isSelected ? 0.6 : 1,
                      }}
                      onClick={() => setScheduleForm((prev) => ({ ...prev, typeKey: option.key }))}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="parent-schedule-form-section">
              <span className="parent-schedule-form-label">일정 시간</span>
              <div className="parent-schedule-time-row">
                <div className="parent-schedule-time-box">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={scheduleForm.hour}
                    onChange={(event) => {
                      const normalizedHour = normalizeTimePart(event.target.value, 23)

                      setScheduleForm((prev) => ({
                        ...prev,
                        hour: normalizedHour,
                        period: normalizedHour && Number(normalizedHour) >= 12 ? 'pm' : 'am',
                      }))
                    }}
                    aria-label="시"
                  />
                  <span className="parent-schedule-time-divider" aria-hidden="true" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={scheduleForm.minute}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        minute: normalizeTimePart(event.target.value, 59),
                      }))
                    }
                    aria-label="분"
                  />
                </div>
                <div className="parent-schedule-period-buttons">
                  <button
                    type="button"
                    className={`parent-schedule-period-button ${
                      scheduleForm.period === 'am' ? 'is-selected is-am' : ''
                    }`}
                    onClick={() => setScheduleForm((prev) => ({ ...prev, period: 'am' }))}
                  >
                    오전
                  </button>
                  <button
                    type="button"
                    className={`parent-schedule-period-button ${
                      scheduleForm.period === 'pm' ? 'is-selected is-pm' : ''
                    }`}
                    onClick={() => setScheduleForm((prev) => ({ ...prev, period: 'pm' }))}
                  >
                    오후
                  </button>
                </div>
              </div>
            </div>

            <div className="parent-schedule-form-section is-memo">
              <span className="parent-schedule-form-label">메모</span>
              <textarea
                className="parent-schedule-memo-input"
                value={scheduleForm.memo}
                onChange={(event) => setScheduleForm((prev) => ({ ...prev, memo: event.target.value }))}
              />
            </div>
          </section>
        </div>
      ) : null}

      {isTodoDeleteSheetOpen ? (
        <div
          className="parent-schedule-action-overlay"
          role="presentation"
          onClick={() => setIsTodoDeleteSheetOpen(false)}
        >
          <section
            className="parent-schedule-todo-input-sheet parent-schedule-delete-sheet"
            role="dialog"
            aria-modal="true"
            aria-label="할 일 삭제"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="parent-schedule-todo-input-header">
              <strong className="parent-schedule-delete-title">MY LIST 삭제</strong>
              <button
                type="button"
                className="parent-schedule-todo-save is-delete"
                onClick={handleDeleteTodos}
              >
                삭제하기
              </button>
            </div>

            <div className="parent-schedule-delete-list">
              {activeTodoGroup.myList.length ? (
                activeTodoGroup.myList.map((item) => (
                  <label className="parent-schedule-delete-item" key={item.key}>
                    <input
                      type="checkbox"
                      className="parent-schedule-checkbox-input"
                      checked={deleteTargetKeys.includes(item.key)}
                      onChange={() => toggleDeleteTarget(item.key)}
                    />
                    <span className="parent-schedule-check" aria-hidden="true" />
                    <span>{item.text}</span>
                  </label>
                ))
              ) : (
                <p className="parent-schedule-delete-empty">삭제할 MY LIST 항목이 없어요.</p>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default ParentScheduleScreen
