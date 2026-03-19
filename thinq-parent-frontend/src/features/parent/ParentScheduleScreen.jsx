import { useMemo, useState } from 'react'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import menuIcon from '@shared-assets/srg/Menu.svg'
import { useEffect } from 'react'
import { useRef } from 'react'
import { API_BASE_URL } from '../../config/api'
import { RECOMMENDED_TODOS_BY_WEEK } from '../../data/recommendedTodos'
import ScheduleInputSheet, { DEFAULT_SCHEDULE_FORM, SCHEDULE_TYPE_OPTIONS } from './ScheduleInputSheet'

function BackIcon() {
  return <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
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
const DEFAULT_SCHEDULE_USER_ID = 3
const MONTHLY_SCHEDULE_CACHE_PREFIX = 'parent-monthly-schedules'
const SCHEDULE_ITEM_LONG_PRESS_MS = 550

function getUserPayload(payload) {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  if (payload?.user && typeof payload.user === 'object') {
    return payload.user
  }

  return null
}

function getUserField(user, ...keys) {
  for (const key of keys) {
    if (user?.[key] !== undefined && user?.[key] !== null && user?.[key] !== '') {
      return user[key]
    }
  }

  return null
}

function normalizeWeekNumber(value) {
  const parsedValue = Number.parseInt(String(value ?? '').trim(), 10)

  if (!Number.isInteger(parsedValue) || parsedValue < 1 || parsedValue > 40) {
    return null
  }

  return parsedValue
}

async function fetchScheduleUserContext(userId = DEFAULT_SCHEDULE_USER_ID) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    const user = getUserPayload(payload)
    
    if (!user) {
      return null
    }

    return {
      userId: getUserField(user, 'userId', 'user_id') ?? userId,
      groupId: getUserField(user, 'groupId', 'group_id'),
      dueDate: getUserField(user, 'dueDate', 'due_date'),
      currentWeek: normalizeWeekNumber(getUserField(user, 'currentWeek', 'currentweek', 'current_week')),
    }
  } catch {
    return null
  }
}

function parseDueDateValue(dueDate) {
  if (!dueDate) {
    return null
  }

  const parsedDate = new Date(`${dueDate}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function calculatePregnancyWeek(targetDateKey, dueDate) {
  const targetDate = parseDateKey(targetDateKey)
  const dueDateValue = parseDueDateValue(dueDate)

  if (Number.isNaN(targetDate.getTime()) || !dueDateValue) {
    return null
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24
  const daysRemaining = Math.ceil((dueDateValue.getTime() - targetDate.getTime()) / millisecondsPerDay)
  const elapsedDays = 280 - daysRemaining
  const currentWeek = Math.floor(elapsedDays / 7)

  if (currentWeek < 0 || currentWeek > 40) {
    return null
  }

  return currentWeek
}

function getRecommendedTodosByWeek(currentWeek) {
  const weekItems = RECOMMENDED_TODOS_BY_WEEK[currentWeek] ?? []

  return weekItems.map((text, index) => ({
    key: `recommended-${currentWeek}-${index}`,
    text,
    checked: false,
  }))
}

function getRecommendedTodoItems(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.todos)) {
    return payload.todos
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items
  }

  if (Array.isArray(payload?.data?.todos)) {
    return payload.data.todos
  }

  return []
}

function getRecommendedTodoText(item) {
  if (typeof item === 'string') {
    return item.trim()
  }

  if (!item || typeof item !== 'object') {
    return ''
  }

  return String(item.todo_name ?? item.todoName ?? item.name ?? item.title ?? item.text ?? '').trim()
}

function getRecommendedTodoWeek(item) {
  if (!item || typeof item !== 'object') {
    return null
  }

  return normalizeWeekNumber(
    item.currentWeek ??
      item.currentweek ??
      item.current_week ??
      item.week ??
      item.weekNumber ??
      item.week_number
  )
}

function normalizeRecommendedTodos(payload, week) {
  return getRecommendedTodoItems(payload)
    .filter((item) => {
      const itemWeek = getRecommendedTodoWeek(item)
      return itemWeek === null || itemWeek === week
    })
    .map((item, index) => ({
      key:
        typeof item === 'object' && item !== null
          ? `recommended-${week}-${item.todoId ?? item.todo_id ?? item.id ?? index}`
          : `recommended-${week}-${index}`,
      text: getRecommendedTodoText(item),
      checked: false,
    }))
    .filter((item) => item.text)
}

async function fetchRecommendedTodos(week) {
  const queryCandidates = [
    `?currentWeek=${week}`,
    `?currentweek=${week}`,
    `?week=${week}`,
    '',
  ]

  for (const query of queryCandidates) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/todos/recommended${query}`)

      if (!response.ok) {
        continue
      }

      const payload = await response.json()
      return normalizeRecommendedTodos(payload, week)
    } catch {
      // Try the next request shape.
    }
  }

  return getRecommendedTodosByWeek(week)
}

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`)
}

function getMonthStart(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long' }).toUpperCase()
}

function getMonthlyScheduleCacheKey(monthDate, userId = DEFAULT_SCHEDULE_USER_ID) {
  return `${MONTHLY_SCHEDULE_CACHE_PREFIX}:${userId}:${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`
}

function readMonthlyScheduleCache(monthDate, userId = DEFAULT_SCHEDULE_USER_ID) {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const cachedValue = window.localStorage.getItem(getMonthlyScheduleCacheKey(monthDate, userId))
    const parsedValue = cachedValue ? JSON.parse(cachedValue) : []

    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function writeMonthlyScheduleCache(monthDate, schedules, userId = DEFAULT_SCHEDULE_USER_ID) {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(getMonthlyScheduleCacheKey(monthDate, userId), JSON.stringify(schedules))
  } catch {
    // Ignore storage failures and continue with live data.
  }
}

const DEFAULT_ACTIVE_DATE_KEY = getDateKey(new Date())
const TODO_PRIORITY_OPTIONS = [
  { key: 'low', label: '낮음', toneClass: 'is-low' },
  { key: 'medium', label: '보통', toneClass: 'is-medium' },
  { key: 'high', label: '높음', toneClass: 'is-high' },
  { key: 'urgent', label: '우선', toneClass: 'is-urgent' },
]
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

function buildMarkerState(weeks) {
  const markersByDate = {}

  weeks.forEach((week) => {
    week.forEach((day) => {
      if (!day.markers?.length) {
        return
      }

      markersByDate[day.key] = day.markers.map((marker) => ({ ...marker }))
    })
  })

  return markersByDate
}

function buildCalendarWeeks(monthDate, markersByDate) {
  const monthStart = getMonthStart(monthDate)
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)
  const gridStart = new Date(monthStart)
  const gridEnd = new Date(monthEnd)

  gridStart.setDate(monthStart.getDate() - monthStart.getDay())
  gridEnd.setDate(monthEnd.getDate() + (6 - monthEnd.getDay()))

  const weeks = []
  const currentDate = new Date(gridStart)

  while (currentDate <= gridEnd) {
    const week = []

    for (let index = 0; index < 7; index += 1) {
      const dateKey = getDateKey(currentDate)

      week.push({
        key: dateKey,
        label: String(currentDate.getDate()),
        inMonth: currentDate.getMonth() === monthStart.getMonth(),
        markers: markersByDate[dateKey]?.map((marker) => ({ ...marker })),
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    weeks.push(week)
  }

  return weeks
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

function splitWeekLabel(weekLabel) {
  const label = String(weekLabel ?? '').trim()
  const matched = label.match(/^(\d+)\s*(.*)$/)

  if (!matched) {
    return {
      numberText: '',
      suffixText: label || '주차',
    }
  }

  return {
    numberText: matched[1],
    suffixText: matched[2]?.trim() || '주차',
  }
}

function getTypeOption(typeKey) {
  return SCHEDULE_TYPE_OPTIONS.find((option) => option.key === typeKey) ?? SCHEDULE_TYPE_OPTIONS[0]
}

function getTypeOptionFromScheduleType(scheduleType) {
  if (!scheduleType) {
    return SCHEDULE_TYPE_OPTIONS[0]
  }

  const normalizedType = String(scheduleType).trim().toLowerCase()
  const aliasMap = {
    baby: 'baby',
    family: 'family',
    work: 'work',
    personal: 'personal',
    important: 'important',
    etc: 'etc',
    아기: 'baby',
    가족: 'family',
    일: 'work',
    개인: 'personal',
    중요: 'important',
    기타: 'etc',
  }
  const matchedKey = aliasMap[normalizedType] ?? aliasMap[String(scheduleType).trim()]

  return getTypeOption(matchedKey ?? normalizedType)
}

function formatTimePart(value) {
  return value?.trim() ? value.padStart(2, '0') : '00'
}

function formatScheduleTime(time) {
  return time?.trim() ? time.slice(0, 5) : ''
}

function parseScheduleTimeToForm(timeLabel) {
  const trimmedValue = String(timeLabel ?? '').trim()
  const koreanMatch = trimmedValue.match(/^(오전|오후)\s*(\d{1,2}):(\d{2})$/)

  if (koreanMatch) {
    return {
      hour: koreanMatch[2].padStart(2, '0'),
      minute: koreanMatch[3],
      period: koreanMatch[1] === '오후' ? 'pm' : 'am',
    }
  }

  const timeMatch = trimmedValue.match(/^(\d{1,2}):(\d{2})/)

  if (!timeMatch) {
    return {
      hour: '',
      minute: '',
      period: 'am',
    }
  }

  const hour24 = Number(timeMatch[1])
  const minute = timeMatch[2]
  const period = hour24 >= 12 ? 'pm' : 'am'
  const hour12 = hour24 % 12 || 12

  return {
    hour: String(hour12).padStart(2, '0'),
    minute,
    period,
  }
}

function createScheduleFormFromItem(item) {
  const parsedTime = parseScheduleTimeToForm(item.time)

  return {
    title: item.title ?? '',
    typeKey: item.typeKey ?? DEFAULT_SCHEDULE_FORM.typeKey,
    hour: parsedTime.hour,
    minute: parsedTime.minute,
    period: parsedTime.period,
    memo: item.note ?? '',
  }
}

function formatScheduleUpdateTime(form) {
  const rawHour = Number(form.hour || 0)
  const minute = formatTimePart(form.minute)
  let hour24 = rawHour % 12

  if (form.period === 'pm') {
    hour24 += 12
  }

  return `${String(hour24).padStart(2, '0')}:${minute}:00`
}

function isSameMonthKey(dateKey, monthDate) {
  const date = parseDateKey(dateKey)
  return date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth()
}

async function fetchMonthlySchedules(monthDate, userId = DEFAULT_SCHEDULE_USER_ID) {
  try {
    const userContext = await fetchScheduleUserContext(userId)
    const groupId = userContext?.groupId

    if (!groupId) {
      return []
    }

    const query = new URLSearchParams({
      groupId: String(groupId),
      year: String(monthDate.getFullYear()),
      month: String(monthDate.getMonth() + 1),
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/monthly?${query.toString()}`)

    if (!response.ok) {
      return []
    }

    const payload = await response.json()
    return Array.isArray(payload?.data) ? payload.data : []
  } catch {
    return []
  }
}

function buildMonthlyScheduleState(schedules) {
  const markersByDate = {}
  const detailsByDate = {}

  schedules.forEach((schedule, index) => {
    const dateKey = schedule.scheduleDate

    if (!dateKey) {
      return
    }

    const typeOption = getTypeOptionFromScheduleType(schedule.scheduleType)
    const time = formatScheduleTime(schedule.time)

    if (!markersByDate[dateKey]) {
      markersByDate[dateKey] = []
    }

    markersByDate[dateKey].push({
      key: schedule.scheduleId ?? `${dateKey}-${index}`,
      label: schedule.title ?? '',
      color: typeOption.color,
      textColor: typeOption.textColor,
      typeKey: typeOption.key,
    })

    if (!detailsByDate[dateKey]) {
      detailsByDate[dateKey] = {
        day: String(parseDateKey(dateKey).getDate()),
        dayOfWeek: getDayOfWeekLabel(dateKey),
        items: [],
      }
    }

    detailsByDate[dateKey].items.push({
      key: schedule.scheduleId ?? `${dateKey}-${index}`,
      scheduleId: schedule.scheduleId ?? null,
      scheduleDateKey: dateKey,
      title: schedule.title ?? '',
      time,
      note: schedule.memo ?? '',
      typeKey: typeOption.key,
      color: typeOption.color,
      textColor: typeOption.textColor,
    })
  })

  return { markersByDate, detailsByDate }
}

function replaceMonthEntries(prevState, monthDate, nextEntries) {
  const filteredState = Object.fromEntries(
    Object.entries(prevState).filter(([dateKey]) => !isSameMonthKey(dateKey, monthDate))
  )

  return {
    ...filteredState,
    ...nextEntries,
  }
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

function ParentScheduleScreen({
  data,
  onBack,
  onOpenHome,
  onOpenDevice,
  onOpenCommunity,
  onOpenMy,
  navIcons,
  initialDetailOpen = true,
  initialScheduleInputOpen = false,
  userId = DEFAULT_SCHEDULE_USER_ID,
}) {
  const initialMonth = getMonthStart(new Date())
  const initialMonthlySchedules = readMonthlyScheduleCache(initialMonth, userId)
  const initialMonthlyState = buildMonthlyScheduleState(initialMonthlySchedules)
  const [activeDateKey, setActiveDateKey] = useState(DEFAULT_ACTIVE_DATE_KEY)
  const [visibleMonth, setVisibleMonth] = useState(initialMonth)
  const [isDetailOpen, setIsDetailOpen] = useState(initialDetailOpen)
  const [isTodoActionSheetOpen, setIsTodoActionSheetOpen] = useState(false)
  const [isTodoInputSheetOpen, setIsTodoInputSheetOpen] = useState(false)
  const [isScheduleInputSheetOpen, setIsScheduleInputSheetOpen] = useState(initialScheduleInputOpen)
  const [isScheduleEditSheetOpen, setIsScheduleEditSheetOpen] = useState(false)
  const [isTodoDeleteSheetOpen, setIsTodoDeleteSheetOpen] = useState(false)
  const [todoInputValue, setTodoInputValue] = useState('')
  const [selectedPriority, setSelectedPriority] = useState(null)
  const [scheduleForm, setScheduleForm] = useState(DEFAULT_SCHEDULE_FORM)
  const [editingScheduleMeta, setEditingScheduleMeta] = useState(null)
  const [deleteTargetKeys, setDeleteTargetKeys] = useState([])
  const [isMonthlyScheduleLoaded, setIsMonthlyScheduleLoaded] = useState(initialMonthlySchedules.length > 0)
  const [calendarMarkersByDate, setCalendarMarkersByDate] = useState(initialMonthlyState.markersByDate)
  const [scheduleDetails, setScheduleDetails] = useState(initialMonthlyState.detailsByDate)
  const [todosByDate, setTodosByDate] = useState(() => buildTodoState(data.todo))
  const [currentWeekNumber, setCurrentWeekNumber] = useState(null)
  const [recommendedWeekNumber, setRecommendedWeekNumber] = useState(null)
  const [recommendedTodos, setRecommendedTodos] = useState([])
  const [isWeekEditing, setIsWeekEditing] = useState(false)
  const [weekInputValue, setWeekInputValue] = useState('')
  const scheduleItemLongPressRef = useRef(null)
  const lastWeekNumberTapRef = useRef(0)
  const calendarWeeks = useMemo(
    () => buildCalendarWeeks(visibleMonth, calendarMarkersByDate),
    [visibleMonth, calendarMarkersByDate]
  )

  const selectedDetail = useMemo(() => {
    if (!activeDateKey || !isMonthlyScheduleLoaded) {
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

  const refreshMonthlySchedules = async (monthDate = visibleMonth) => {
    const schedules = await fetchMonthlySchedules(monthDate, userId)
    const { markersByDate, detailsByDate } = buildMonthlyScheduleState(schedules)

    writeMonthlyScheduleCache(monthDate, schedules, userId)
    setCalendarMarkersByDate((prev) => replaceMonthEntries(prev, monthDate, markersByDate))
    setScheduleDetails((prev) => replaceMonthEntries(prev, monthDate, detailsByDate))
    setIsMonthlyScheduleLoaded(true)
  }

  const clearScheduleItemLongPress = () => {
    if (scheduleItemLongPressRef.current) {
      window.clearTimeout(scheduleItemLongPressRef.current)
      scheduleItemLongPressRef.current = null
    }
  }

  useEffect(() => () => clearScheduleItemLongPress(), [])

  useEffect(() => {
    let isMounted = true
    const cachedSchedules = readMonthlyScheduleCache(visibleMonth, userId)

    if (cachedSchedules.length) {
      const cachedState = buildMonthlyScheduleState(cachedSchedules)
      setCalendarMarkersByDate((prev) => replaceMonthEntries(prev, visibleMonth, cachedState.markersByDate))
      setScheduleDetails((prev) => replaceMonthEntries(prev, visibleMonth, cachedState.detailsByDate))
      setIsMonthlyScheduleLoaded(true)
    } else {
      setIsMonthlyScheduleLoaded(false)
    }

    fetchMonthlySchedules(visibleMonth, userId).then((schedules) => {
      if (!isMounted) {
        return
      }

      const { markersByDate, detailsByDate } = buildMonthlyScheduleState(schedules)
      writeMonthlyScheduleCache(visibleMonth, schedules, userId)

      setCalendarMarkersByDate((prev) => replaceMonthEntries(prev, visibleMonth, markersByDate))
      setScheduleDetails((prev) => replaceMonthEntries(prev, visibleMonth, detailsByDate))

      setIsMonthlyScheduleLoaded(true)
    })

    return () => {
      isMounted = false
    }
  }, [userId, visibleMonth])

  useEffect(() => {
    let isMounted = true

    fetchScheduleUserContext(userId).then((userContext) => {
      if (!isMounted) {
        return
      }

      const resolvedCurrentWeek =
        userContext?.currentWeek ?? calculatePregnancyWeek(DEFAULT_ACTIVE_DATE_KEY, userContext?.dueDate)

      setCurrentWeekNumber(resolvedCurrentWeek)
      setRecommendedWeekNumber(resolvedCurrentWeek)
      setWeekInputValue(resolvedCurrentWeek ? String(resolvedCurrentWeek) : '')
    })

    return () => {
      isMounted = false
    }
  }, [userId])

  const handleDayClick = (dayKey) => {
    if (dayKey === activeDateKey) {
      setIsDetailOpen((prev) => !prev)
      return
    }

    setActiveDateKey(dayKey)
    setVisibleMonth(getMonthStart(parseDateKey(dayKey)))
    setIsDetailOpen(true)
  }

  const handleMonthChange = (offset) => {
    const nextMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + offset, 1)
    const activeDate = parseDateKey(activeDateKey)
    const maxDay = new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()
    const nextSelectedDate = new Date(
      nextMonth.getFullYear(),
      nextMonth.getMonth(),
      Math.min(activeDate.getDate(), maxDay)
    )

    setVisibleMonth(nextMonth)
    setActiveDateKey(getDateKey(nextSelectedDate))
  }

  const activeTodoKey = activeDateKey && todosByDate[activeDateKey] ? activeDateKey : 'default'
  const activeTodoGroup = todosByDate[activeTodoKey]
  const displayWeekNumber = recommendedWeekNumber ?? currentWeekNumber

  useEffect(() => {
    setIsWeekEditing(false)
    setWeekInputValue(displayWeekNumber ? String(displayWeekNumber) : '')
  }, [displayWeekNumber, activeTodoKey])

  useEffect(() => {
    let isMounted = true
    const targetWeek = normalizeWeekNumber(displayWeekNumber)

    if (!targetWeek) {
      setRecommendedTodos([])
      return () => {
        isMounted = false
      }
    }

    fetchRecommendedTodos(targetWeek).then((items) => {
      if (!isMounted) {
        return
      }

      setRecommendedTodos(items)
    })

    return () => {
      isMounted = false
    }
  }, [displayWeekNumber])

  const saveWeekLabel = () => {
    const nextWeek = normalizeWeekNumber(weekInputValue) ?? currentWeekNumber

    setRecommendedWeekNumber(nextWeek)
    setWeekInputValue(nextWeek ? String(nextWeek) : '')
    setIsWeekEditing(false)
  }

  const openWeekEditor = () => {
    setWeekInputValue(displayWeekNumber ? String(displayWeekNumber) : '')
    setIsWeekEditing(true)
  }

  const handleWeekNumberPress = () => {
    const now = Date.now()

    if (now - lastWeekNumberTapRef.current < 320) {
      openWeekEditor()
      lastWeekNumberTapRef.current = 0
      return
    }

    lastWeekNumberTapRef.current = now
  }

  const toggleTodo = (listType, todoKey) => {
    if (listType === 'recommended') {
      setRecommendedTodos((prev) =>
        prev.map((item) => (item.key === todoKey ? { ...item, checked: !item.checked } : item))
      )
      return
    }

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
    const formattedHour = formatTimePart(scheduleForm.hour)
    const formattedMinute = formatTimePart(scheduleForm.minute)
    const timeLabel = `${scheduleForm.period === 'am' ? '오전' : '오후'} ${formattedHour}:${formattedMinute}`
    const newItem = {
      key: `schedule-${Date.now()}`,
      scheduleId: null,
      scheduleDateKey: targetKey,
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

    setCalendarMarkersByDate((prev) => ({
      ...prev,
      [targetKey]: [
        ...(prev[targetKey] ?? []),
        {
          key: newItem.key,
          label: newItem.title,
          color: newItem.color,
          textColor: newItem.textColor,
        },
      ],
    }))

    setScheduleForm(DEFAULT_SCHEDULE_FORM)
    setIsDetailOpen(true)
    setIsScheduleInputSheetOpen(false)
  }

  const openScheduleEditSheet = (item) => {
    if (!item.scheduleId) {
      return
    }

    setEditingScheduleMeta({
      scheduleId: item.scheduleId,
      dateKey: item.scheduleDateKey ?? activeDateKey,
    })
    setScheduleForm(createScheduleFormFromItem(item))
    setIsScheduleEditSheetOpen(true)
  }

  const handleScheduleItemPressStart = (item) => {
    if (!item.scheduleId) {
      return
    }

    clearScheduleItemLongPress()
    scheduleItemLongPressRef.current = window.setTimeout(() => {
      openScheduleEditSheet(item)
      scheduleItemLongPressRef.current = null
    }, SCHEDULE_ITEM_LONG_PRESS_MS)
  }

  const closeScheduleEditSheet = () => {
    setIsScheduleEditSheetOpen(false)
    setEditingScheduleMeta(null)
    setScheduleForm(DEFAULT_SCHEDULE_FORM)
  }

  const handleUpdateSchedule = async () => {
    const trimmedValue = scheduleForm.title.trim()

    if (!trimmedValue || !editingScheduleMeta?.scheduleId) {
      return
    }

    try {
      const userContext = await fetchScheduleUserContext(userId)

      if (!userContext?.groupId || !userContext?.userId) {
        throw new Error('Missing user context for schedule update')
      }

      const selectedType = getTypeOption(scheduleForm.typeKey)
      const response = await fetch(`${API_BASE_URL}/api/v1/schedules/${editingScheduleMeta.scheduleId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupId: userContext.groupId,
          userId: userContext.userId,
          title: trimmedValue,
          memo: scheduleForm.memo.trim(),
          todoYn: 'N',
          scheduleType: selectedType.label,
          scheduleDate: editingScheduleMeta.dateKey ?? activeDateKey,
          time: formatScheduleUpdateTime(scheduleForm),
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update schedule: ${response.status} ${errorText}`)
      }

      await refreshMonthlySchedules(getMonthStart(parseDateKey(editingScheduleMeta.dateKey ?? activeDateKey)))
      closeScheduleEditSheet()
      setIsDetailOpen(false)
    } catch (error) {
      console.error(error)
    }
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
          <div className="parent-schedule-calendar-header">
            <button
              type="button"
              className="parent-schedule-month-button"
              aria-label="이전 달"
              onClick={() => handleMonthChange(-1)}
            >
              ‹
            </button>
            <h2>{getMonthLabel(visibleMonth)}</h2>
            <button
              type="button"
              className="parent-schedule-month-button"
              aria-label="다음 달"
              onClick={() => handleMonthChange(1)}
            >
              ›
            </button>
          </div>

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

        </section>

        {selectedDetail && isDetailOpen ? (
          <div className="parent-schedule-popup-backdrop">
            <section
              className="parent-schedule-detail-card parent-schedule-detail-popup"
              aria-label={`${selectedDetail.day}일 일정`}
            >
              <div className="parent-schedule-detail-date">
                <div className="parent-schedule-detail-date-copy">
                  <strong>{selectedDetail.day}</strong>
                  <span>{selectedDetail.dayOfWeek}</span>
                </div>
                <button
                  type="button"
                  className="parent-schedule-todo-add parent-schedule-detail-add"
                  aria-label="일정 추가"
                  onClick={() => {
                    setScheduleForm(DEFAULT_SCHEDULE_FORM)
                    setIsScheduleInputSheetOpen(true)
                  }}
                >
                  <PlusIcon />
                </button>
              </div>

              {selectedDetail.items.length ? (
                <div className="parent-schedule-detail-list">
                  {selectedDetail.items.map((item) => (
                    <article
                      className="parent-schedule-detail-item"
                      key={item.key}
                      onMouseDown={() => handleScheduleItemPressStart(item)}
                      onMouseUp={clearScheduleItemLongPress}
                      onMouseLeave={clearScheduleItemLongPress}
                      onTouchStart={() => handleScheduleItemPressStart(item)}
                      onTouchEnd={clearScheduleItemLongPress}
                      onTouchCancel={clearScheduleItemLongPress}
                      onContextMenu={(event) => event.preventDefault()}
                    >
                      <span
                        className="parent-schedule-detail-badge"
                        style={{ background: getScheduleVisual(item).color }}
                      />
                      <div className="parent-schedule-detail-copy">
                        <p className="parent-schedule-detail-title">{item.title}</p>
                        <p className="parent-schedule-detail-line">
                          <strong>{item.time}</strong>
                          {item.note ? <span>{item.note}</span> : null}
                        </p>
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

        <section className="parent-schedule-recommend-card">
          <div className="parent-schedule-recommend-head">
            <div className="parent-schedule-recommend-title">
              <strong>주간 추천</strong>
              <div className="parent-schedule-recommend-week">
                {isWeekEditing ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="parent-schedule-recommend-week-input"
                    value={weekInputValue}
                    onChange={(event) => setWeekInputValue(event.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    onBlur={saveWeekLabel}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        saveWeekLabel()
                      }

                      if (event.key === 'Escape') {
                        setWeekInputValue(displayWeekNumber ? String(displayWeekNumber) : '')
                        setIsWeekEditing(false)
                      }
                    }}
                    autoFocus
                    aria-label="추천 주차 수정"
                  />
                ) : (
                  <span
                    className="parent-schedule-recommend-week-number"
                    onDoubleClick={openWeekEditor}
                    onClick={handleWeekNumberPress}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openWeekEditor()
                      }
                    }}
                    aria-label="추천 주차 숫자 수정"
                  >
                    {displayWeekNumber ?? ''}
                  </span>
                )}
                <span className="parent-schedule-recommend-week-suffix">주차</span>
              </div>
            </div>
          </div>

          <div className="parent-schedule-todo-body">
            <div className="parent-schedule-todo-section">
              <p className="parent-schedule-todo-section-title with-icon is-recommended">
                <StarIcon />
                <span>추천</span>
              </p>
              <div className="parent-schedule-todo-list">
                {recommendedTodos.map((item) => (
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
          </div>
        </section>

        <section className="parent-schedule-todo-card">
          <div className="parent-schedule-todo-head">
            <div className="parent-schedule-todo-title">
              <strong>TO DO</strong>
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
        {NAV_ITEMS.map((item) => {
          const handleClick =
            item.key === 'home'
              ? onOpenHome
              : item.key === 'device'
                ? onOpenDevice
                : item.key === 'community'
                  ? onOpenCommunity
                  : item.key === 'my'
                    ? onOpenMy
                    : undefined

          return (
            <button
              key={item.key}
              type="button"
              className={`parent-mode-nav-item ${item.key === 'device' ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={item.key === 'device' ? 'page' : undefined}
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

      <ScheduleInputSheet
        open={isScheduleInputSheetOpen}
        form={scheduleForm}
        onFormChange={setScheduleForm}
        onClose={() => setIsScheduleInputSheetOpen(false)}
        onSave={handleSaveSchedule}
      />

      <ScheduleInputSheet
        open={isScheduleEditSheetOpen}
        form={scheduleForm}
        onFormChange={setScheduleForm}
        onClose={closeScheduleEditSheet}
        onSave={handleUpdateSchedule}
      />

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
