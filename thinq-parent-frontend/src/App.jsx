import { useEffect, useRef, useState } from 'react'
import './App.css'
import addHomeImage from '@shared-assets/addhome.png'
import anomalyImage from '@shared-assets/check.png'
import clockImage from '@shared-assets/clock.png'
import newHomeImage from '@shared-assets/homeplus.png'
import laundryBannerImage from '@shared-assets/home_laundry.png'
import home3dImage from '@shared-assets/image2.png'
import playBannerImage from '@shared-assets/image4.png'
import floatingInnerImage from '@shared-assets/image5.png'
import lifeAgentImage from '@shared-assets/lifeagent.png'
import lookDiaryImage from '@shared-assets/lookdiary.png'
import plusImage from '@shared-assets/plus.png'
import userHomeIcon from '@shared-assets/srg/change.png'
import arrowLeftIcon from '@shared-assets/srg/Arrow_left.svg'
import messageOpenIcon from '@shared-assets/srg/Message_open_light.svg'
import sendLightIcon from '@shared-assets/srg/Send_light.svg'
import heartIcon from '@shared-assets/srg/heart.svg'
import parentModeHomeIcon from '@shared-assets/srg/부모모드홈_아이콘.svg'
import parentModeBabyIcon from '@shared-assets/srg/부모모드가전육아_아이콘.svg'
import parentModeCommunityIcon from '@shared-assets/srg/부모모드커뮤니티_아이콘.svg'
import parentModeMyIcon from '@shared-assets/srg/부모모드MY_아이콘.svg'
import whiteHomeIcon from '@shared-assets/srg/whitehome.svg'
import whiteBabyIcon from '@shared-assets/srg/whiteelec.svg'
import whiteCommunityIcon from '@shared-assets/srg/whitecommunity.svg'
import whiteMyIcon from '@shared-assets/srg/whitemy.svg'
import chatFloatingIcon from '@shared-assets/srg/chat_floating.svg'
import sendDuotoneIcon from '@shared-assets/srg/Send_duotone_line.svg'
import bellIcon from '@shared-assets/icons/a_button.svg'
import plusButtonIcon from '@shared-assets/icons/button_plus.svg'
import careIcon from '@shared-assets/assets/icons/care.svg'
import deviceIcon from '@shared-assets/assets/icons/device.svg'
import homeIcon from '@shared-assets/assets/icons/home.svg'
import homeMoreIcon from '@shared-assets/icons/home_more.svg'
import menuIcon from '@shared-assets/assets/icons/menu.svg'
import headerMenuIcon from '@shared-assets/srg/Menu.svg'
import moreButtonIcon from '@shared-assets/icons/more_button.svg'
import smartGoIcon from '@shared-assets/icons/smart_go.svg'
import { API_BASE_URL } from './config/api'
import { mockChildProfile } from './data/mockChildProfile'
import { mockParentSchedule } from './data/mockParentSchedule'
import { mockMyPage } from './data/mockMyPage'
import { mockMombtiMeta, mockMombtiRow } from './data/mockMombti'
import CommunityScreen from './features/community/CommunityScreen'
import CommunityDetailScreen from './features/community/CommunityDetailScreen'
import CommunityWriteScreen from './features/community/CommunityWriteScreen'
import PregnancyDiaryDetailScreen from './features/diary/PregnancyDiaryDetailScreen'
import PregnancyDiaryScreen from './features/diary/PregnancyDiaryScreen'
import PregnancyDiaryWriteScreen from './features/diary/PregnancyDiaryWriteScreen'
import ChildProfileScreen from './features/my/ChildProfileScreen'
import MombtiDetailScreen from './features/mombti/MombtiDetailScreen'
import MombtiLatestResultScreen from './features/mombti/MombtiLatestResultScreen'
import MombtiMenuScreen from './features/mombti/MombtiMenuScreen'
import MombtiTestScreen from './features/mombti/MombtiTestScreen'
import CheerMessageScreen from './features/parent/CheerMessageScreen'
import ParentDeviceScreen from './features/parent/ParentDeviceScreen'
import ParentDeviceRoutineFirstScreen from './features/parent/ParentDeviceRoutineFirstScreen'
import ParentDeviceRoutineFinalScreen from './features/parent/ParentDeviceRoutineFinalScreen'
import ParentDeviceRoutineMiddleScreen from './features/parent/ParentDeviceRoutineMiddleScreen'
import ParentDeviceRoutineScreen from './features/parent/ParentDeviceRoutineScreen'
import ParentScheduleScreen from './features/parent/ParentScheduleScreen'
import MyScreen from './features/my/MyScreen'
import { buildMombtiViewModel, buildMombtiViewModelFromAttempt } from './features/mombti/mombtiMapper'

const HOME_NAME = '사용자 홈'

const navItems = [
  { key: 'home', label: '홈', icon: homeIcon },
  { key: 'device', label: '디바이스', icon: deviceIcon },
  { key: 'care', label: '케어', icon: careIcon },
  { key: 'menu', label: '메뉴', icon: menuIcon },
]

const settingCards = [
  {
    title: '새로운 홈 만들기',
    description: '새로운 홈을 추가해보세요.',
    image: newHomeImage,
    className: 'square',
  },
  {
    title: '다른 홈 초대받기',
    description: 'QR 스캔을 통해 새로운 홈\n멤버가 되어보세요.',
    image: addHomeImage,
    className: 'square',
  },
  {
    title: '라이프 에이전트',
    description: '생활 속에서 가전의 도움을 받아보세요.',
    image: lifeAgentImage,
    className: 'wide',
  },
]

const DEFAULT_PREGNANCY_SUMMARY = {
  babyNickname: '틔움이',
  daysUntilDueDate: 102,
  dueDate: mockMyPage.dueDate,
  groupId: null,
  role: '',
}
const DEFAULT_CHEER_MESSAGE = ''
const DEFAULT_TODAY_TODO_CARD = {
  weekLabel: '',
  items: [],
}
const DEFAULT_CURRENT_USER_ID = 3
const CHATBOT_API_URL = 'https://chatbot-api-338378601376.asia-northeast3.run.app/ask'
const DEFAULT_CHATBOT_GREETING = '안녕하세요, 틔움이 어머니를 위한 전문가 챗봇입니다.'

function getDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDayOfWeekLabel(date) {
  const labels = ['일', '월', '화', '수', '목', '금', '토']
  return labels[date.getDay()]
}

function getMonthLabel(date) {
  return date.toLocaleString('en-US', { month: 'long' }).toUpperCase()
}

function calculateDaysUntilDueDate(dueDate) {
  if (!dueDate) {
    return DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate
  }

  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const dueDateValue = new Date(`${dueDate}T00:00:00`)

  if (Number.isNaN(dueDateValue.getTime())) {
    return DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate
  }

  return Math.max(0, Math.ceil((dueDateValue.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)))
}

function parseDueDateValue(dueDate) {
  if (!dueDate) {
    return null
  }

  const parsedDate = new Date(`${dueDate}T00:00:00`)
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate
}

function calculatePregnancyWeek(targetDate, dueDate) {
  const targetValue =
    typeof targetDate === 'string' ? new Date(`${targetDate}T00:00:00`) : new Date(targetDate)
  const dueDateValue = parseDueDateValue(dueDate)

  if (Number.isNaN(targetValue.getTime()) || !dueDateValue) {
    return null
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24
  const daysRemaining = Math.ceil((dueDateValue.getTime() - targetValue.getTime()) / millisecondsPerDay)
  const elapsedDays = 280 - daysRemaining
  const currentWeek = Math.floor(elapsedDays / 7)

  if (currentWeek < 0 || currentWeek > 40) {
    return null
  }

  return currentWeek
}

function normalizeWeekNumber(value) {
  const parsedValue = Number.parseInt(String(value ?? '').trim(), 10)

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return null
  }

  return parsedValue
}

function formatDueDateLabel(dueDate) {
  if (!dueDate) {
    return DEFAULT_PREGNANCY_SUMMARY.dueDate
  }

  const matchedDate = dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (matchedDate) {
    const [, year, month, day] = matchedDate
    return `${year.slice(-2)}.${month}.${day}`
  }

  const parsedDate = new Date(`${dueDate}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return dueDate
  }

  return `${String(parsedDate.getFullYear()).slice(-2)}.${String(parsedDate.getMonth() + 1).padStart(2, '0')}.${String(parsedDate.getDate()).padStart(2, '0')}`
}

function formatDaysUntilDueDateLabel(daysUntilDueDate) {
  return String(daysUntilDueDate)
}

function getMeetingName(summary) {
  if (summary?.babyNickname) {
    return summary.babyNickname
  }

  if (summary?.meetingTitle) {
    return summary.meetingTitle.replace(/\s*만나기$/, '')
  }

  return DEFAULT_PREGNANCY_SUMMARY.babyNickname
}

function getUserPayload(payload) {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  if (payload?.user && typeof payload.user === 'object') {
    return payload.user
  }

  return null
}

async function fetchPregnancySummary(userId = 3) {
  const url = `${API_BASE_URL}/api/v1/users/${userId}`

  try {
    const response = await fetch(url)

    if (!response.ok) {
      return DEFAULT_PREGNANCY_SUMMARY
    }

    const payload = await response.json()
    const userData = getUserPayload(payload)

    if (userData) {
      const dueDate = userData.dueDate
      const daysUntilDueDate = calculateDaysUntilDueDate(dueDate)

      return {
        ...userData,
        daysUntilDueDate,
      }
    }
  } catch {
    return DEFAULT_PREGNANCY_SUMMARY
  }

  return DEFAULT_PREGNANCY_SUMMARY
}

async function fetchLatestCheerMessage(userId = 3) {
  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!userResponse.ok) {
      return ''
    }

    const userPayload = await userResponse.json()
    const groupId = getUserPayload(userPayload)?.groupId

    if (!groupId) {
      return ''
    }

    const cheerResponse = await fetch(`${API_BASE_URL}/api/v1/cheer-messages/groups/${groupId}/latest`)

    if (!cheerResponse.ok) {
      return ''
    }

    const cheerPayload = await cheerResponse.json()
    const content = cheerPayload?.data?.content
    const senderId = cheerPayload?.data?.senderId

    if (!content?.trim()) {
      return ''
    }

    if (!senderId) {
      return content
    }

    const senderResponse = await fetch(`${API_BASE_URL}/api/v1/users/${senderId}`)

    if (!senderResponse.ok) {
      return content
    }

    const senderPayload = await senderResponse.json()
    const senderUsername = getUserPayload(senderPayload)?.username

    if (!senderUsername?.trim()) {
      return content
    }

    return `${content} - ${senderUsername}`
  } catch {
    return ''
  }
}

function formatDailyScheduleTime(rawTime, startDate) {
  if (rawTime?.trim()) {
    return rawTime.slice(0, 5)
  }

  if (!startDate) {
    return ''
  }

  const scheduleDate = new Date(startDate)

  if (Number.isNaN(scheduleDate.getTime())) {
    return ''
  }

  return scheduleDate.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function getParentModeScheduleTypeStyle(scheduleType, index) {
  const normalizedType = String(scheduleType ?? '').trim().toLowerCase()
  const styleMap = {
    baby: { background: '#ff3b3b', color: '#ffffff' },
    family: { background: '#8fbc69', color: '#ffffff' },
    work: { background: '#7478a8', color: '#ffffff' },
    personal: { background: '#fef19f', color: '#000000' },
    important: { background: '#2e2e2e', color: '#ffffff' },
    etc: { background: '#b285bb', color: '#ffffff' },
    아기: { background: '#ff3b3b', color: '#ffffff' },
    가족: { background: '#8fbc69', color: '#ffffff' },
    일: { background: '#7478a8', color: '#ffffff' },
    개인: { background: '#fef19f', color: '#000000' },
    중요: { background: '#2e2e2e', color: '#ffffff' },
    기타: { background: '#b285bb', color: '#ffffff' },
  }

  return (
    styleMap[normalizedType] ??
    styleMap[String(scheduleType ?? '').trim()] ?? {
      background: index === 0 ? '#ff0000' : '#ffef88',
      color: index === 0 ? '#ffffff' : '#000000',
    }
  )
}

function getScheduleObjectPayload(payload) {
  if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return payload.data
  }

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    return payload
  }

  return null
}

async function fetchScheduleDetail(scheduleId) {
  if (!scheduleId) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/${scheduleId}`)

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    const schedule = getScheduleObjectPayload(payload)

    if (!schedule) {
      return null
    }

    return {
      scheduleId: schedule.scheduleId ?? schedule.id ?? scheduleId,
      title: schedule.title ?? '',
      time: schedule.time ?? '',
      startDate: schedule.startDate ?? schedule.scheduleDate ?? '',
      scheduleType: schedule.scheduleType ?? schedule.type ?? '',
      memo: schedule.memo ?? schedule.note ?? '',
    }
  } catch {
    return null
  }
}

async function fetchDailySchedules(userId = 3, date = new Date()) {
  const dateKey = getDateKey(date)

  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!userResponse.ok) {
      return []
    }

    const userPayload = await userResponse.json()
    const groupId = getUserPayload(userPayload)?.groupId

    if (!groupId) {
      return []
    }

    const query = new URLSearchParams({
      groupId: String(groupId),
      date: dateKey,
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/schedules/daily?${query.toString()}`)

    if (!response.ok) {
      return []
    }

    const payload = await response.json()
    const schedules = Array.isArray(payload?.data) ? payload.data : []
    const limitedSchedules = schedules.slice(0, 2)
    const scheduleDetails = await Promise.all(
      limitedSchedules.map((schedule) => fetchScheduleDetail(schedule.scheduleId))
    )

    const items = limitedSchedules.map((schedule, index) => {
      const detail = scheduleDetails[index]
      const resolvedSchedule = detail ?? schedule

      return {
        key:
          resolvedSchedule.scheduleId ??
          `${resolvedSchedule.title}-${resolvedSchedule.scheduleDate ?? resolvedSchedule.startDate}-${resolvedSchedule.time}-${index}`,
        scheduleId: resolvedSchedule.scheduleId ?? schedule.scheduleId ?? null,
        title: resolvedSchedule.title ?? '',
        time: formatDailyScheduleTime(resolvedSchedule.time, resolvedSchedule.startDate),
        note: resolvedSchedule.memo ?? '',
        boxStyle: getParentModeScheduleTypeStyle(resolvedSchedule.scheduleType, index),
      }
    })

    return items
  } catch {
    return []
  }
}

function getMyListPayloadItems(payload) {
  if (Array.isArray(payload)) {
    return payload
  }

  if (Array.isArray(payload?.data)) {
    return payload.data
  }

  if (Array.isArray(payload?.items)) {
    return payload.items
  }

  if (Array.isArray(payload?.myLists)) {
    return payload.myLists
  }

  if (Array.isArray(payload?.data?.items)) {
    return payload.data.items
  }

  if (Array.isArray(payload?.data?.myLists)) {
    return payload.data.myLists
  }

  return []
}

function getMyListDateKey(item) {
  const rawValue = String(
    item?.myListDate ??
      item?.my_list_date ??
      item?.date ??
      item?.scheduleDate ??
      item?.schedule_date ??
      ''
  ).trim()

  return rawValue.length >= 10 ? rawValue.slice(0, 10) : rawValue
}

function getMyListTitle(item) {
  return String(item?.title ?? item?.todo_name ?? item?.todoName ?? item?.name ?? item?.text ?? '').trim()
}

function isMyListChecked(item) {
  return String(item?.checkYn ?? item?.check_yn ?? 'N').trim().toUpperCase() === 'Y'
}

function getWeekLabelFromValue(value) {
  const weekLabel = String(value?.weekLabel ?? value?.week_label ?? '').trim()

  if (weekLabel) {
    return weekLabel
  }

  const weekNumber = normalizeWeekNumber(
    value?.currentWeek ?? value?.currentweek ?? value?.current_week ?? value?.week ?? value?.weekNumber
  )

  return weekNumber ? `${weekNumber}주차` : ''
}

function resolveTodayTodoWeekLabel(payload, userData, dateKey) {
  const candidates = [
    payload,
    payload?.data,
    Array.isArray(payload?.data) ? payload.data[0] : null,
    userData,
  ]

  for (const candidate of candidates) {
    const weekLabel = getWeekLabelFromValue(candidate)

    if (weekLabel) {
      return weekLabel
    }
  }

  const calculatedWeek = calculatePregnancyWeek(dateKey, userData?.dueDate)
  return calculatedWeek ? `${calculatedWeek}주차` : ''
}

async function fetchTodayTodoCard(userId = 3, date = new Date()) {
  const dateKey = getDateKey(date)

  try {
    const userResponse = await fetch(`${API_BASE_URL}/api/v1/users/${userId}`)

    if (!userResponse.ok) {
      return DEFAULT_TODAY_TODO_CARD
    }

    const userPayload = await userResponse.json()
    const userData = getUserPayload(userPayload)
    const groupId = userData?.groupId

    if (!groupId) {
      return DEFAULT_TODAY_TODO_CARD
    }

    const query = new URLSearchParams({
      date: dateKey,
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/my-list/groups/${groupId}/daily?${query.toString()}`)

    if (!response.ok) {
      return {
        weekLabel: resolveTodayTodoWeekLabel(null, userData, dateKey),
        items: [],
      }
    }

    const payload = await response.json()

    return {
      weekLabel: resolveTodayTodoWeekLabel(payload, userData, dateKey),
      items: getMyListPayloadItems(payload)
        .map((item, index) => {
          const myListId = item?.myListId ?? item?.my_list_id ?? item?.id ?? null

          return {
            key: myListId ? `my-list-${myListId}` : `my-list-${dateKey}-${index}`,
            myListId,
            dateKey: getMyListDateKey(item),
            text: getMyListTitle(item),
            checked: isMyListChecked(item),
          }
        })
        .filter((item) => item.dateKey === dateKey && item.text),
    }
  } catch {
    return DEFAULT_TODAY_TODO_CARD
  }
}

async function updateMyListCheckYn(myListId, checked) {
  if (!myListId) {
    return false
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/my-list/${myListId}/check-yn`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        checkYn: checked ? 'Y' : 'N',
        check_yn: checked ? 'Y' : 'N',
      }),
    })

    return response.ok
  } catch {
    return false
  }
}

function getMombtiAttemptPayload(payload) {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  if (payload && typeof payload === 'object') {
    return payload
  }

  return null
}

function getCompletedMombtiAttemptPayload(payload) {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data
  }

  if (payload && typeof payload === 'object') {
    return payload
  }

  return null
}

function normalizeMombtiAttemptStatus(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getMombtiAttemptCompletedAt(attempt) {
  return attempt?.completedAt ?? attempt?.completed_at ?? null
}

function isCompletedMombtiAttempt(attempt) {
  return normalizeMombtiAttemptStatus(attempt?.status) === 'COMPLETED' && Boolean(getMombtiAttemptCompletedAt(attempt))
}

function getLatestCompletedMombtiAttemptFromPayload(payload) {
  const rawValue = payload?.data ?? payload
  const attempts = Array.isArray(rawValue)
    ? rawValue
    : Array.isArray(rawValue?.items)
      ? rawValue.items
      : Array.isArray(rawValue?.attempts)
        ? rawValue.attempts
        : rawValue
          ? [rawValue]
          : []

  return attempts
    .filter(isCompletedMombtiAttempt)
    .sort((first, second) => {
      const firstTime = new Date(getMombtiAttemptCompletedAt(first) ?? 0).getTime()
      const secondTime = new Date(getMombtiAttemptCompletedAt(second) ?? 0).getTime()
      return secondTime - firstTime
    })[0] ?? null
}

function getMombtiAttemptId(attempt) {
  return attempt?.attemptId ?? attempt?.attempt_id ?? attempt?.id ?? null
}

async function createMombtiAttempt(userId) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/mombti/attempts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        user_id: userId,
      }),
    })

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return getMombtiAttemptPayload(payload)
  } catch {
    return null
  }
}

async function fetchLatestCompletedMombtiAttempt(userId) {
  try {
    const query = new URLSearchParams({
      userId: String(userId),
    })
    const response = await fetch(`${API_BASE_URL}/api/v1/mombti/attempts/latest?${query.toString()}`)

    if (!response.ok) {
      return null
    }

    const payload = await response.json()
    return getLatestCompletedMombtiAttemptFromPayload(payload)
  } catch {
    return null
  }
}

function AssetIcon({ src, alt = '', className = '', size = 20 }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`asset-icon ${className}`.trim()}
      style={{ width: size, height: size }}
    />
  )
}

function HeaderAction({ icon, label, size = 17 }) {
  return (
    <button type="button" className="header-action" aria-label={label}>
      <AssetIcon src={icon} size={size} />
    </button>
  )
}

function removeChatMarkdown(text) {
  return String(text ?? '')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/gs, '$1')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*>\s+/gm, '')
    .replace(/(?<!\n)(\n?)(\d+\.)/g, '\n\n$2')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function HomeSelectionSheet({ onClose, onOpenSettings }) {
  return (
    <div className="sheet-overlay" onClick={onClose} role="presentation">
      <section
        className="home-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="홈 선택"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="sheet-handle" aria-hidden="true" />
        <h2>홈 선택</h2>
        <button type="button" className="sheet-home-option">
          <span className="sheet-check" aria-hidden="true">
            ✓
          </span>
          <span>{HOME_NAME}</span>
        </button>
        <button type="button" className="sheet-settings-link" onClick={onOpenSettings}>
          홈 설정
          <span aria-hidden="true">›</span>
        </button>
      </section>
    </div>
  )
}

function HomeScreen({ activeTab, onChangeTab, onOpenSheet, isHomeSheetOpen }) {
  return (
    <div className="home-screen">
      <header className="home-header">
        <button type="button" className="home-selector" onClick={onOpenSheet} aria-label="홈 선택">
          <strong>{HOME_NAME}</strong>
          <AssetIcon src={homeMoreIcon} size={16} />
        </button>

        <div className="header-actions">
          <HeaderAction icon={plusButtonIcon} label="추가" />
          <HeaderAction icon={bellIcon} label="알림" />
          <HeaderAction icon={moreButtonIcon} label="더보기" size={14} />
        </div>
      </header>

      <div className="home-content">
        <section className="hero-card">
          <img src={anomalyImage} alt="" className="hero-card-icon" />
          <div className="hero-copy">
            <p>제품에 이상 징후가 발견되면 전문 상담사가</p>
            <p>알려드려요.</p>
            <button type="button" className="primary-pill">
              지금 알아보기
            </button>
          </div>
        </section>

        <section className="hero-card second">
          <img src={home3dImage} alt="" className="hero-card-icon map" />
          <div className="hero-copy">
            <p>3D 홈뷰로 우리집과 제품의 실시간 상태를</p>
            <p>한눈에 확인해보세요.</p>
            <button type="button" className="primary-pill">
              3D 홈뷰 만들기
            </button>
          </div>
        </section>

        <section className="section-block">
          <h2>즐겨 찾는 제품</h2>
          <div className="favorite-panel">
            <p>제품을 추가하고 즐겨 찾는 제품으로 배치하면 홈 화면에서 바로</p>
            <p>사용할 수 있어요.</p>
            <button type="button" className="favorite-button">
              <img src={plusImage} alt="" />
              <span>제품 추가</span>
            </button>
          </div>
        </section>

        <section className="section-block">
          <img src={playBannerImage} alt="ThinQ PLAY 배너" className="play-banner" />
        </section>

        <section className="section-block">
          <div className="section-row">
            <h2>스마트 루틴</h2>
            <AssetIcon src={smartGoIcon} size={18} />
          </div>

          <button type="button" className="routine-button">
            <img src={clockImage} alt="" />
            <span>루틴 알아보기</span>
          </button>
        </section>

        <section className="section-block thinq-section">
          <h2>ThinQ 활용하기</h2>
          <img src={laundryBannerImage} alt="ThinQ 활용 배너" className="laundry-banner" />
        </section>
      </div>

      {!isHomeSheetOpen ? (
        <button type="button" className="floating-button" aria-label="ThinQ 도우미">
          <img src={floatingInnerImage} alt="" />
        </button>
      ) : null}

      <nav className="bottom-nav" aria-label="주요 메뉴">
        {navItems.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={`bottom-nav-item ${activeTab === index ? 'active' : ''}`}
            aria-current={activeTab === index ? 'page' : undefined}
            onClick={() => onChangeTab(index)}
          >
            <span className="bottom-nav-icon-frame" aria-hidden="true">
              <AssetIcon
                src={item.icon}
                size={24}
                className={`bottom-nav-icon ${activeTab === index ? 'active-nav-icon' : ''}`}
              />
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function SettingCard({ title, description, image, className, onClick }) {
  return (
    <button type="button" className={`setting-card ${className}`} onClick={onClick}>
      <div className="setting-card-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <img src={image} alt="" className={`setting-card-image ${className}`} />
    </button>
  )
}

function HomeSettingsScreen({ onBack, onOpenLifeAgent }) {
  return (
    <div className="settings-screen">
      <header className="settings-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>홈 설정</h1>
        <button type="button" className="settings-plus-button" aria-label="홈 추가">
          <AssetIcon src={plusButtonIcon} size={17} />
        </button>
      </header>

      <div className="settings-content">
        <button type="button" className="current-home-card">
          <span className="current-home-preview" aria-hidden="true" />
          <strong>{HOME_NAME}</strong>
          <span className="current-home-state">현재 홈</span>
          <span className="current-home-arrow" aria-hidden="true" />
        </button>

        <section className="settings-section">
          <h2>홈 추가하기</h2>
          <div className="settings-grid">
            {settingCards.slice(0, 2).map((card) => (
              <SettingCard
                key={card.title}
                title={card.title}
                description={card.description}
                image={card.image}
                className={card.className}
              />
            ))}
          </div>
          <SettingCard
            title={settingCards[2].title}
            description={settingCards[2].description}
            image={settingCards[2].image}
            className={settingCards[2].className}
            onClick={onOpenLifeAgent}
          />
        </section>
      </div>
    </div>
  )
}

function LifeAgentScreen({ onBack, onOpenParentMode }) {
  return (
    <div className="settings-screen">
      <header className="settings-header life-agent-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>라이프 에이전트</h1>
        <button type="button" className="life-agent-more-button" aria-label="더보기">
          <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="settings-content life-agent-content">
        <section className="life-agent-card-list">
          <button type="button" className="life-agent-card life-agent-card--holomode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">홀로 모드</p>
              <p className="life-agent-card-subtitle">혼자서도 충분한 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--petmode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">펫 모드</p>
              <p className="life-agent-card-subtitle">작은 동반자를 찾은 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--babymode" onClick={onOpenParentMode}>
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">부모 모드</p>
              <p className="life-agent-card-subtitle">새 생명이 처음인 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--couplemode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">부부 모드</p>
              <p className="life-agent-card-subtitle">사랑하고 있는 당신을 위해</p>
            </div>
          </button>

          <button type="button" className="life-agent-card life-agent-card--oldmode">
            <div className="life-agent-card-overlay">
              <p className="life-agent-card-title">슬로우 모드</p>
              <p className="life-agent-card-subtitle">인생의 여유를 찾은 당신을 위해</p>
            </div>
          </button>
        </section>
      </div>
    </div>
  )
}

function ChatExpertScreen({ onBack, message, messages, isSending, onMessageChange, onSendMessage }) {
  const messagesRef = useRef(null)

  useEffect(() => {
    if (!messagesRef.current) {
      return
    }

    messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages, isSending])

  return (
    <div className="chat-expert-shell">
      <header className="settings-header chat-expert-page-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>
          <span>챗태피티</span>
          <span className="chat-expert-page-header-subtitle">전문가</span>
        </h1>
        <button type="button" className="life-agent-more-button chat-expert-menu-button" aria-label="메뉴">
          <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
        </button>
      </header>

      <div className="chat-expert-content">
        <div className="chat-expert-card">
          <div className="chat-expert-messages" ref={messagesRef}>
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}-${item.text}`}
                className={`chat-expert-bubble ${
                  item.role === 'user' ? 'chat-expert-bubble-user' : 'chat-expert-bubble-bot'
                }`}
              >
                <span className="chat-expert-bubble-shape" aria-hidden="true" />
                <p>{item.text}</p>
              </div>
            ))}
            {isSending ? <p className="chat-expert-loading">답변을 생성 중입니다...</p> : null}
          </div>

          <div className="chat-expert-input-area">
            <input
              type="text"
              placeholder="메세지를 입력하세요."
              aria-label="메세지를 입력하세요."
              value={message}
              onChange={(event) => onMessageChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSendMessage()
                }
              }}
            />
            <button
              type="button"
              className="chat-expert-send-btn"
              aria-label="전송"
              onClick={onSendMessage}
              disabled={isSending}
            >
              <img src={sendDuotoneIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ParentModeScreen({
  onBack,
  onOpenChat,
  onOpenHome,
  onOpenDevice,
  onOpenCommunity,
  onOpenMy,
  onOpenDiary,
  onOpenSchedule,
  onOpenAccountSwitch,
  onCloseAccountSwitch,
  onSelectMomAccount,
  onSelectDadAccount,
  isAccountSwitchPopupOpen,
  pregnancySummary,
  cheerMessageText,
  dailyScheduleItems,
  todayTodoItems,
  onToggleTodayTodo,
  onOpenCheerMessage,
}) {
  const [inputStatusIndex, setInputStatusIndex] = useState(0)
  const today = new Date()

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setInputStatusIndex((prev) => (prev + 1) % 3)
    }, 700)

    return () => window.clearInterval(intervalId)
  }, [])

  const handleOpenTodoSchedule = () => {
    onOpenSchedule(false)
  }

  const parentModeNavItems = [
    { key: 'home', label: '홈', icon: parentModeHomeIcon, onClick: onOpenHome, isActive: true },
    { key: 'device', label: '가전육아', icon: parentModeBabyIcon, onClick: onOpenDevice, isActive: false },
    { key: 'community', label: '커뮤니티', icon: parentModeCommunityIcon, onClick: onOpenCommunity, isActive: false },
    { key: 'my', label: 'MY', icon: parentModeMyIcon, onClick: onOpenMy, isActive: false },
  ]

  return (
    <div className="parent-mode-screen">
      <header className="parent-mode-header">
        <button type="button" className="back-button" onClick={onBack} aria-label="뒤로가기">
          <img src={arrowLeftIcon} alt="" className="back-button-icon" aria-hidden="true" />
        </button>
        <h1>부모 모드</h1>
        <div className="parent-mode-header-actions">
          <button
            type="button"
            className="parent-mode-account-switch-button"
            aria-label="계정 전환"
            onClick={onOpenAccountSwitch}
          >
            <img src={userHomeIcon} alt="" className="parent-mode-account-switch-icon" aria-hidden="true" />
          </button>
          <button type="button" className="life-agent-more-button" aria-label="더보기">
            <img src={headerMenuIcon} alt="" className="header-menu-icon" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="parent-mode-body">
        <div className="parent-mode-content">
          <section className="parent-mode-meet">
            <h2 className="parent-mode-meet-title">{`${getMeetingName(pregnancySummary)} 만나기`}</h2>
            <p className="parent-mode-meet-meta">
              <img src={heartIcon} alt="" className="parent-mode-heart" aria-hidden="true" />
              {`- ${pregnancySummary.daysUntilDueDate}일 전`}
            </p>
          </section>

          <div className="parent-mode-input-row">
            {pregnancySummary.role === 'FAMILY' ? (
              <button
                type="button"
                className="parent-mode-input-icon-button"
                aria-label="응원 글쓰기"
                onClick={onOpenCheerMessage}
              >
                <img src={messageOpenIcon} alt="" className="parent-mode-input-icon" aria-hidden="true" />
              </button>
            ) : (
              <img src={messageOpenIcon} alt="" className="parent-mode-input-icon" aria-hidden="true" />
            )}
            <span className="parent-mode-input-arrows" aria-hidden="true">
              <img
                src={sendLightIcon}
                alt=""
                className={`parent-mode-input-icon parent-mode-input-motion ${inputStatusIndex === 0 ? 'is-visible' : ''
                  }`}
                aria-hidden="true"
              />
              <img
                src={sendLightIcon}
                alt=""
                className={`parent-mode-input-icon parent-mode-input-icon--rotate parent-mode-input-motion ${inputStatusIndex === 1 ? 'is-visible' : ''
                  }`}
                aria-hidden="true"
              />
            </span>
            <img
              src={heartIcon}
              alt=""
              className={`parent-mode-input-heart parent-mode-input-motion ${inputStatusIndex === 2 ? 'is-visible' : ''
                }`}
              aria-hidden="true"
            />
            <p className="parent-mode-input-text">{cheerMessageText}</p>
          </div>

          <div className="parent-mode-cards-row">
            <button
              type="button"
              className="parent-mode-card parent-mode-calendar parent-mode-card-button"
            >
              <h3 onClick={() => onOpenSchedule(false)}>캘린더</h3>
              <p className="parent-mode-date-line" onClick={() => onOpenSchedule(true)}>
                <span className="parent-mode-date">{today.getDate()}</span>
                <span className="parent-mode-day">{getDayOfWeekLabel(today)}</span>
              </p>
              <div className="parent-mode-events" onClick={() => onOpenSchedule(true)}>
                {dailyScheduleItems.map((item) => (
                  <div
                    key={item.key}
                    className="parent-mode-event-box"
                    style={{
                      background: item.boxStyle.background,
                      color: item.boxStyle.color,
                      opacity: 0.8,
                    }}
                  >
                    <span className="parent-mode-event-label">{item.title}</span>
                    <span className="parent-mode-event-time" style={{ color: item.boxStyle.color }}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </button>
            <section
              className="parent-mode-card parent-mode-todo"
              role="button"
              tabIndex={0}
              onClick={handleOpenTodoSchedule}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  handleOpenTodoSchedule()
                }
              }}
            >
              <div
                className="parent-mode-todo-head"
                onClick={handleOpenTodoSchedule}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleOpenTodoSchedule()
                  }
                }}
              >
                <h3>TO DO</h3>
              </div>
              {todayTodoItems.map((item) => (
                <label
                  key={item.key}
                  className="parent-mode-todo-item"
                  onClick={(event) => event.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    className="parent-mode-todo-checkbox"
                    checked={Boolean(item.checked)}
                    onChange={() => onToggleTodayTodo(item)}
                    onClick={(event) => event.stopPropagation()}
                  />
                  <span className="parent-mode-todo-check" aria-hidden="true" />
                  <span>{item.text}</span>
                </label>
              ))}
            </section>
          </div>

          <button type="button" className="parent-mode-diary parent-mode-diary-button" onClick={onOpenDiary}>
            <span className="parent-mode-diary-copy">
              <h3>임신 일기</h3>
              <p className="parent-mode-diary-desc">소중한 매일의 순간을 기록해보세요.</p>
            </span>
            <span className="parent-mode-diary-image-wrap">
              <img src={lookDiaryImage} alt="일기 보기" />
            </span>
          </button>

          <section className="parent-mode-widget">
            <h3>위젯 추가하기</h3>
            <div className="parent-mode-widget-box">
              <p>즐겨 찾는 기능을 한 눈에 볼 수 있도록 홈 화면에 배치해보세요.</p>
              <button type="button" className="parent-mode-widget-btn">위젯 추가</button>
            </div>
          </section>
        </div>

        <div className="parent-mode-bottom-bar" />

        <nav className="parent-mode-bottom-nav" aria-label="부모 모드 메뉴">
          {parentModeNavItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`parent-mode-nav-item ${item.isActive ? 'parent-mode-nav-item--active' : ''}`}
              aria-current={item.isActive ? 'page' : undefined}
              aria-label={item.label}
              onClick={item.onClick}
            >
              <span className="parent-mode-nav-icon-frame" aria-hidden="true">
                <img src={item.icon} alt="" className="parent-mode-nav-icon" aria-hidden="true" />
              </span>
              <span className="parent-mode-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button type="button" className="parent-mode-fab" aria-label="채팅" onClick={onOpenChat}>
          <img src={chatFloatingIcon} alt="" className="parent-mode-fab-icon" aria-hidden="true" />
        </button>

        {isAccountSwitchPopupOpen ? (
          <div className="parent-mode-account-switch-overlay" onClick={onCloseAccountSwitch} role="presentation">
            <section
              className="parent-mode-account-switch-popup"
              role="dialog"
              aria-modal="true"
              aria-label="계정 전환"
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" className="parent-mode-account-switch-option is-mom" onClick={onSelectMomAccount}>
                엄마
              </button>
              <button type="button" className="parent-mode-account-switch-option is-dad" onClick={onSelectDadAccount}>
                아빠
              </button>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  )
}

function App() {
  const [activeTab, setActiveTab] = useState(0)
  const [currentUserId, setCurrentUserId] = useState(DEFAULT_CURRENT_USER_ID)
  const [currentScreen, setCurrentScreen] = useState('home')
  const [screenHistory, setScreenHistory] = useState([])
  const [isHomeSheetOpen, setIsHomeSheetOpen] = useState(false)
  const [isScheduleDetailInitiallyOpen, setIsScheduleDetailInitiallyOpen] = useState(true)
  const [isScheduleInputInitiallyOpen, setIsScheduleInputInitiallyOpen] = useState(false)
  const [isAccountSwitchPopupOpen, setIsAccountSwitchPopupOpen] = useState(false)
  const [pregnancySummary, setPregnancySummary] = useState(DEFAULT_PREGNANCY_SUMMARY)
  const [cheerMessageText, setCheerMessageText] = useState(DEFAULT_CHEER_MESSAGE)
  const [dailyScheduleItems, setDailyScheduleItems] = useState([])
  const [todayTodoCard, setTodayTodoCard] = useState(DEFAULT_TODAY_TODO_CARD)
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState(null)
  const [selectedPregnancyDiaryId, setSelectedPregnancyDiaryId] = useState(null)
  const [editingPregnancyDiary, setEditingPregnancyDiary] = useState(null)
  const [activeMombtiAttempt, setActiveMombtiAttempt] = useState(null)
  const [mombtiResultData, setMombtiResultData] = useState(() =>
    buildMombtiViewModel(mockMombtiRow, mockMombtiMeta)
  )
  const [latestMombtiResultData, setLatestMombtiResultData] = useState(null)
  const [isCreatingMombtiAttempt, setIsCreatingMombtiAttempt] = useState(false)
  const [childProfile, setChildProfile] = useState(mockChildProfile)
  const [chatExpertDraft, setChatExpertDraft] = useState('')
  const [chatExpertMessages, setChatExpertMessages] = useState([{ role: 'bot', text: DEFAULT_CHATBOT_GREETING }])
  const [isChatExpertSending, setIsChatExpertSending] = useState(false)
  const mombtiAttemptRequestRef = useRef(null)
  const chatExpertSessionIdRef = useRef(`user-${Date.now()}`)
  const today = new Date()
  const myPage = {
    ...mockMyPage,
    childName: pregnancySummary.babyNickname ?? mockMyPage.childName,
    dDay: formatDaysUntilDueDateLabel(pregnancySummary.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate),
    dueDate: formatDueDateLabel(pregnancySummary.dueDate),
    schedule: {
      ...mockMyPage.schedule,
      monthLabel: getMonthLabel(today),
      day: String(today.getDate()),
      dayOfWeek: getDayOfWeekLabel(today),
      items: dailyScheduleItems,
    },
    todo: {
      ...mockMyPage.todo,
      weekLabel: todayTodoCard.weekLabel,
      items: todayTodoCard.items,
    },
  }
  const parentSchedule = mockParentSchedule
  const mombti = mombtiResultData
  const latestMombti = latestMombtiResultData ?? mombtiResultData

  useEffect(() => {
    let isMounted = true

    setPregnancySummary(DEFAULT_PREGNANCY_SUMMARY)
    setChildProfile(mockChildProfile)
    setCheerMessageText(DEFAULT_CHEER_MESSAGE)
    setDailyScheduleItems([])
    setTodayTodoCard(DEFAULT_TODAY_TODO_CARD)

    fetchPregnancySummary(currentUserId).then((data) => {
      if (!isMounted || !data) {
        return
      }

      setPregnancySummary({
        babyNickname:
          data.babyNickname ??
          data.meetingTitle?.replace(/\s*만나기$/, '') ??
          DEFAULT_PREGNANCY_SUMMARY.babyNickname,
        meetingTitle: data.meetingTitle,
        daysUntilDueDate: data.daysUntilDueDate ?? DEFAULT_PREGNANCY_SUMMARY.daysUntilDueDate,
        dueDate: data.dueDate ?? DEFAULT_PREGNANCY_SUMMARY.dueDate,
        groupId: data.groupId ?? DEFAULT_PREGNANCY_SUMMARY.groupId,
        role: data.role ?? DEFAULT_PREGNANCY_SUMMARY.role,
      })

      setChildProfile((prev) => ({
        ...prev,
        selectedDate: data.dueDate || getDateKey(new Date()),
      }))

      if (data.babyNickname) {
        setChildProfile((prev) => ({
          ...prev,
          childName: data.babyNickname,
        }))
      }
    })

    fetchLatestCheerMessage(currentUserId).then((content) => {
      if (!isMounted || !content) {
        return
      }

      setCheerMessageText(content)
    })

    fetchDailySchedules(currentUserId, new Date()).then((items) => {
      if (!isMounted) {
        return
      }

      setDailyScheduleItems(items)
    })

    fetchTodayTodoCard(currentUserId, new Date()).then((todoCard) => {
      if (!isMounted) {
        return
      }

      setTodayTodoCard(todoCard)
    })

    return () => {
      isMounted = false
    }
  }, [currentUserId])

  useEffect(() => {
    setChatExpertDraft('')
    setChatExpertMessages([{ role: 'bot', text: DEFAULT_CHATBOT_GREETING }])
    setIsChatExpertSending(false)
    chatExpertSessionIdRef.current = `user-${currentUserId}-${Date.now()}`
  }, [currentUserId])

  useEffect(() => {
    if (currentScreen !== 'parent-mode' && currentScreen !== 'my') {
      return undefined
    }

    let isMounted = true

    fetchDailySchedules(currentUserId, new Date()).then((items) => {
      if (!isMounted) {
        return
      }

      setDailyScheduleItems(items)
    })

    fetchTodayTodoCard(currentUserId, new Date()).then((todoCard) => {
      if (!isMounted) {
        return
      }

      setTodayTodoCard(todoCard)
    })

    return () => {
      isMounted = false
    }
  }, [currentScreen, currentUserId])

  const navigateToScreen = (nextScreen) => {
    setCurrentScreen((prevScreen) => {
      if (prevScreen === nextScreen) {
        return prevScreen
      }

      setScreenHistory((prevHistory) => [...prevHistory, prevScreen])
      return nextScreen
    })
  }

  const goBack = () => {
    setScreenHistory((prevHistory) => {
      if (!prevHistory.length) {
        return prevHistory
      }

      const nextHistory = prevHistory.slice(0, -1)
      const previousScreen = prevHistory[prevHistory.length - 1]

      setCurrentScreen(previousScreen)
      return nextHistory
    })
  }

  const handleParentModeBack = () => {
    if (!screenHistory.length) {
      setCurrentScreen('home')
      return
    }

    goBack()
  }

  const openSettings = () => {
    setIsHomeSheetOpen(false)
    navigateToScreen('settings')
  }

  const openLifeAgent = () => {
    navigateToScreen('life-agent')
  }

  const openParentMode = () => {
    navigateToScreen('parent-mode')
  }

  const openParentModeChat = () => {
    navigateToScreen('parent-mode-chat')
  }

  const handleSendChatExpertMessage = async () => {
    const trimmedMessage = chatExpertDraft.trim()

    if (!trimmedMessage || isChatExpertSending) {
      return
    }

    setChatExpertMessages((prev) => [...prev, { role: 'user', text: trimmedMessage }])
    setChatExpertDraft('')
    setIsChatExpertSending(true)

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: trimmedMessage,
          session_id: chatExpertSessionIdRef.current,
        }),
      })

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`)
      }

      const payload = await response.json()
      const answer = removeChatMarkdown(payload?.answer)

      setChatExpertMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: answer || '응답을 받아오지 못했어요. 잠시 후 다시 시도해주세요.',
        },
      ])
    } catch (error) {
      console.error(error)
      setChatExpertMessages((prev) => [
        ...prev,
        {
          role: 'bot',
          text: '서버와 연결되지 않았어요. 잠시 후 다시 시도해주세요.',
        },
      ])
    } finally {
      setIsChatExpertSending(false)
    }
  }

  const openParentDevice = () => {
    navigateToScreen('parent-mode-device')
  }

  const openParentDeviceRoutine = () => {
    navigateToScreen('parent-mode-device-routine')
  }

  const openParentDeviceRoutineFirst = () => {
    navigateToScreen('parent-mode-device-routine-first')
  }

  const openParentDeviceRoutineMiddle = () => {
    navigateToScreen('parent-mode-device-routine-middle')
  }

  const openParentDeviceRoutineFinal = () => {
    navigateToScreen('parent-mode-device-routine-final')
  }

  const openCheerMessage = () => {
    if (pregnancySummary.role !== 'FAMILY') {
      return
    }

    navigateToScreen('cheer-message')
  }

  const openMyScreen = () => {
    navigateToScreen('my')
  }

  const openCommunity = () => {
    navigateToScreen('community')
  }

  const openCommunityWrite = () => {
    if (pregnancySummary.role !== 'USER') {
      return
    }

    navigateToScreen('community-write')
  }

  const openCommunityDetail = (postId) => {
    if (!postId) {
      return
    }

    setSelectedCommunityPostId(postId)
    navigateToScreen('community-detail')
  }

  const openPregnancyDiary = () => {
    navigateToScreen('pregnancy-diary')
  }

  const openPregnancyDiaryDetail = (diaryId) => {
    if (!diaryId) {
      return
    }

    setSelectedPregnancyDiaryId(diaryId)
    navigateToScreen('pregnancy-diary-detail')
  }

  const openPregnancyDiaryWrite = () => {
    setEditingPregnancyDiary(null)
    navigateToScreen('pregnancy-diary-write')
  }

  const goPregnancyDiaryHome = () => {
    setCurrentScreen('parent-mode')
    setScreenHistory([])
  }

  const openPregnancyDiaryEdit = (diary) => {
    if (!diary?.id) {
      return
    }

    setEditingPregnancyDiary(diary)
    navigateToScreen('pregnancy-diary-write')
  }

  const handleOpenAccountSwitch = () => {
    setIsAccountSwitchPopupOpen(true)
  }

  const handleCloseAccountSwitch = () => {
    setIsAccountSwitchPopupOpen(false)
  }

  const handleSelectAccount = (nextUserId) => {
    setCurrentUserId(nextUserId)
    setIsAccountSwitchPopupOpen(false)
  }

  const refreshHomeDailySchedules = async (targetUserId = currentUserId) => {
    const items = await fetchDailySchedules(targetUserId, new Date())
    setDailyScheduleItems(items)
    return items
  }

  const openParentSchedule = (shouldOpenDetail = true, shouldOpenScheduleInput = false) => {
    setIsScheduleDetailInitiallyOpen(shouldOpenDetail)
    setIsScheduleInputInitiallyOpen(shouldOpenScheduleInput)
    navigateToScreen('parent-mode-schedule')
  }

  const openChildProfile = () => {
    navigateToScreen('child-profile')
  }

  const openMombti = () => {
    navigateToScreen('mombti-menu')
  }

  const openMombtiResult = async () => {
    const latestCompletedAttempt = await fetchLatestCompletedMombtiAttempt(currentUserId)

    if (!latestCompletedAttempt) {
      window.alert('완료된 최근 검사 결과가 없어요.')
      return
    }

    setLatestMombtiResultData(buildMombtiViewModelFromAttempt(latestCompletedAttempt, mockMombtiMeta))
    navigateToScreen('mombti-latest')
  }

  const beginMombtiAttempt = () => {
    if (mombtiAttemptRequestRef.current) {
      return mombtiAttemptRequestRef.current
    }

    setActiveMombtiAttempt(null)
    setIsCreatingMombtiAttempt(true)

    const request = createMombtiAttempt(currentUserId)
      .then((attempt) => {
        if (attempt) {
          setActiveMombtiAttempt(attempt)
        }

        return attempt
      })
      .finally(() => {
        mombtiAttemptRequestRef.current = null
        setIsCreatingMombtiAttempt(false)
      })

    mombtiAttemptRequestRef.current = request
    return request
  }

  const ensureMombtiAttemptId = async () => {
    const existingAttemptId = getMombtiAttemptId(activeMombtiAttempt)

    if (existingAttemptId) {
      return existingAttemptId
    }

    const attempt = mombtiAttemptRequestRef.current
      ? await mombtiAttemptRequestRef.current
      : await beginMombtiAttempt()

    return getMombtiAttemptId(attempt)
  }

  const openMombtiTest = () => {
    beginMombtiAttempt()
    navigateToScreen('mombti-test')
  }

  const handleMombtiMenuBack = () => {
    setScreenHistory((prevHistory) => {
      if (!prevHistory.length) {
        return prevHistory
      }

      const previousScreen = prevHistory[prevHistory.length - 1]

      if (previousScreen === 'mombti') {
        let nextHistory = prevHistory.slice(0, -1)

        while (nextHistory.length && nextHistory[nextHistory.length - 1] === 'mombti-menu') {
          nextHistory = nextHistory.slice(0, -1)
        }

        setCurrentScreen('parent-mode')
        return nextHistory
      }

      const nextHistory = prevHistory.slice(0, -1)
      setCurrentScreen(previousScreen)
      return nextHistory
    })
  }

  const handleSaveChildDueDate = (dueDate) => {
    setChildProfile((prev) => ({
      ...prev,
      selectedDate: dueDate,
    }))

    setPregnancySummary((prev) => ({
      ...prev,
      dueDate,
      daysUntilDueDate: calculateDaysUntilDueDate(dueDate),
    }))

    setScreenHistory((prevHistory) => {
      const nextHistory =
        prevHistory[prevHistory.length - 1] === 'my' ? prevHistory.slice(0, -1) : prevHistory

      setCurrentScreen('my')
      return nextHistory
    })
  }

  const handleSaveBabyNickname = (babyNickname) => {
    setPregnancySummary((prev) => ({
      ...prev,
      babyNickname,
    }))

    setChildProfile((prev) => ({
      ...prev,
      childName: babyNickname,
    }))
  }

  const handleToggleTodayTodo = async (targetItem) => {
    if (!targetItem?.key) {
      return
    }

    const nextChecked = !targetItem.checked

    setTodayTodoCard((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.key === targetItem.key ? { ...item, checked: nextChecked } : item)),
    }))

    const isUpdated = await updateMyListCheckYn(targetItem.myListId, nextChecked)

    if (!isUpdated) {
      setTodayTodoCard((prev) => ({
        ...prev,
        items: prev.items.map((item) => (item.key === targetItem.key ? { ...item, checked: targetItem.checked } : item)),
      }))
    }
  }

  const handleCompleteMombti = (completedAttemptPayload) => {
    const completedAttempt = getCompletedMombtiAttemptPayload(completedAttemptPayload)

    if (completedAttempt) {
      setActiveMombtiAttempt(completedAttempt)
      setMombtiResultData(buildMombtiViewModelFromAttempt(completedAttempt, mockMombtiMeta))
    }

    navigateToScreen('mombti')
  }

  const handleCheerMessageSubmitSuccess = (nextCheerMessageText) => {
    setCheerMessageText(nextCheerMessageText || DEFAULT_CHEER_MESSAGE)
  }

  const phoneShellClass =
    currentScreen === 'home'
      ? 'home-mode'
      : currentScreen === 'parent-mode' ||
        currentScreen === 'parent-mode-device' ||
        currentScreen === 'parent-mode-device-routine' ||
        currentScreen === 'parent-mode-device-routine-first' ||
        currentScreen === 'parent-mode-device-routine-middle' ||
        currentScreen === 'parent-mode-device-routine-final' ||
        currentScreen === 'cheer-message' ||
        currentScreen === 'parent-mode-chat' ||
        currentScreen === 'parent-mode-schedule'
        ? 'parent-mode'
        : currentScreen === 'community' || currentScreen === 'community-detail'
          ? 'community-mode'
        : currentScreen === 'community-write'
          ? 'community-write-mode'
        : currentScreen === 'pregnancy-diary' ||
            currentScreen === 'pregnancy-diary-write' ||
            currentScreen === 'pregnancy-diary-detail'
          ? 'diary-mode'
        : currentScreen === 'my' || currentScreen === 'child-profile'
          ? 'my-mode'
          : currentScreen === 'mombti' ||
              currentScreen === 'mombti-latest' ||
              currentScreen === 'mombti-menu' ||
              currentScreen === 'mombti-test'
            ? 'mombti-mode'
            : 'settings-mode'

  return (
    <main className="app-shell">
      <section className={`phone-shell ${phoneShellClass}`}>
        <div key={currentScreen} className="screen-transition-layer">
          {currentScreen === 'home' && (
            <HomeScreen
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              onOpenSheet={() => setIsHomeSheetOpen(true)}
              isHomeSheetOpen={isHomeSheetOpen}
            />
          )}

          {currentScreen === 'settings' && (
            <HomeSettingsScreen onBack={goBack} onOpenLifeAgent={openLifeAgent} />
          )}

          {currentScreen === 'life-agent' && (
            <LifeAgentScreen
              onBack={goBack}
              onOpenParentMode={openParentMode}
            />
          )}

        {currentScreen === 'parent-mode' && (
          <ParentModeScreen
            onBack={handleParentModeBack}
            onOpenChat={openParentModeChat}
            onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onOpenMy={openMyScreen}
              onOpenDiary={openPregnancyDiary}
              onOpenSchedule={openParentSchedule}
              onOpenAccountSwitch={handleOpenAccountSwitch}
              onCloseAccountSwitch={handleCloseAccountSwitch}
              onSelectMomAccount={() => handleSelectAccount(3)}
              onSelectDadAccount={() => handleSelectAccount(4)}
              isAccountSwitchPopupOpen={isAccountSwitchPopupOpen}
              pregnancySummary={pregnancySummary}
              cheerMessageText={cheerMessageText}
              dailyScheduleItems={dailyScheduleItems}
              todayTodoItems={todayTodoCard.items}
              onToggleTodayTodo={handleToggleTodayTodo}
              onOpenCheerMessage={openCheerMessage}
            />
          )}

          {currentScreen === 'cheer-message' && (
            <CheerMessageScreen
              userId={currentUserId}
              groupId={pregnancySummary.groupId}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onOpenMy={openMyScreen}
              onSubmitSuccess={handleCheerMessageSubmitSuccess}
              navIcons={{
                home: parentModeHomeIcon,
                device: parentModeBabyIcon,
                community: parentModeCommunityIcon,
                my: parentModeMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-device' && (
            <ParentDeviceScreen
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenMy={openMyScreen}
              onOpenCommunity={openCommunity}
              onOpenRoutine={openParentDeviceRoutine}
              navIcons={{
                home: parentModeHomeIcon,
                device: parentModeBabyIcon,
                community: parentModeCommunityIcon,
                my: parentModeMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-device-routine' && (
            <ParentDeviceRoutineScreen
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenMy={openMyScreen}
              onOpenCommunity={openCommunity}
              onOpenFirstRoutine={openParentDeviceRoutineFirst}
              onOpenMiddleRoutine={openParentDeviceRoutineMiddle}
              onOpenFinalRoutine={openParentDeviceRoutineFinal}
              navIcons={{
                home: whiteHomeIcon,
                device: whiteBabyIcon,
                community: whiteCommunityIcon,
                my: whiteMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-device-routine-first' && (
            <ParentDeviceRoutineFirstScreen
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenMy={openMyScreen}
              onOpenCommunity={openCommunity}
              navIcons={{
                home: whiteHomeIcon,
                device: whiteBabyIcon,
                community: whiteCommunityIcon,
                my: whiteMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-device-routine-middle' && (
            <ParentDeviceRoutineMiddleScreen
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenMy={openMyScreen}
              onOpenCommunity={openCommunity}
              navIcons={{
                home: whiteHomeIcon,
                device: whiteBabyIcon,
                community: whiteCommunityIcon,
                my: whiteMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-device-routine-final' && (
            <ParentDeviceRoutineFinalScreen
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenMy={openMyScreen}
              onOpenCommunity={openCommunity}
              navIcons={{
                home: whiteHomeIcon,
                device: whiteBabyIcon,
                community: whiteCommunityIcon,
                my: whiteMyIcon,
              }}
            />
          )}

          {currentScreen === 'parent-mode-chat' && (
            <ChatExpertScreen
              onBack={goBack}
              message={chatExpertDraft}
              messages={chatExpertMessages}
              isSending={isChatExpertSending}
              onMessageChange={setChatExpertDraft}
              onSendMessage={handleSendChatExpertMessage}
            />
          )}

          {currentScreen === 'parent-mode-schedule' && (
            <ParentScheduleScreen
              data={parentSchedule}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onOpenMy={openMyScreen}
              initialDetailOpen={isScheduleDetailInitiallyOpen}
              initialScheduleInputOpen={isScheduleInputInitiallyOpen}
              userId={currentUserId}
              onDailySchedulesChange={refreshHomeDailySchedules}
              navIcons={{
                home: parentModeHomeIcon,
                device: parentModeBabyIcon,
                community: parentModeCommunityIcon,
                my: parentModeMyIcon,
              }}
            />
          )}

          {currentScreen === 'my' && (
            <MyScreen
              data={myPage}
              userId={currentUserId}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onOpenChildProfile={openChildProfile}
              onOpenMombti={openMombti}
              onOpenDiary={openPregnancyDiary}
              onOpenDiaryWrite={openPregnancyDiaryWrite}
              onOpenSchedule={openParentSchedule}
              onSaveBabyNickname={handleSaveBabyNickname}
              onToggleTodayTodo={handleToggleTodayTodo}
            />
          )}

          {currentScreen === 'child-profile' && (
            <ChildProfileScreen
              data={childProfile}
              userId={currentUserId}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onSaveDueDate={handleSaveChildDueDate}
            />
          )}

          {currentScreen === 'community' && (
            <CommunityScreen
              userId={currentUserId}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenMy={openMyScreen}
              onOpenWrite={openCommunityWrite}
              onOpenPost={openCommunityDetail}
              canWrite={pregnancySummary.role === 'USER'}
            />
          )}

          {currentScreen === 'community-detail' && (
            <CommunityDetailScreen
              postId={selectedCommunityPostId}
              userId={currentUserId}
              onBack={goBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenMy={openMyScreen}
            />
          )}

          {currentScreen === 'community-write' && (
            <CommunityWriteScreen
              userId={currentUserId}
              onBack={goBack}
              onSuccess={goBack}
            />
          )}

          {currentScreen === 'pregnancy-diary' && (
            <PregnancyDiaryScreen
              userId={currentUserId}
              onBack={goPregnancyDiaryHome}
              onOpenWrite={openPregnancyDiaryWrite}
              onEdit={openPregnancyDiaryEdit}
              onOpenDetail={openPregnancyDiaryDetail}
            />
          )}

          {currentScreen === 'pregnancy-diary-detail' && (
            <PregnancyDiaryDetailScreen
              diaryId={selectedPregnancyDiaryId}
              userId={currentUserId}
              onBack={goBack}
              onEdit={openPregnancyDiaryEdit}
              onDeleted={goBack}
            />
          )}

          {currentScreen === 'pregnancy-diary-write' && (
            <PregnancyDiaryWriteScreen
              userId={currentUserId}
              onBack={goBack}
              onSuccess={goBack}
              babyNickname={pregnancySummary.babyNickname}
              initialDiary={editingPregnancyDiary}
            />
          )}

          {currentScreen === 'mombti-menu' && (
            <MombtiMenuScreen
              onBack={handleMombtiMenuBack}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
              onOpenResult={openMombtiResult}
              onOpenTest={openMombtiTest}
              isCreatingAttempt={isCreatingMombtiAttempt}
            />
          )}

          {currentScreen === 'mombti-test' && (
            <MombtiTestScreen
              onBack={goBack}
              onOpenMombtiMenu={openMombtiMenu}
              onComplete={handleCompleteMombti}
              attemptId={getMombtiAttemptId(activeMombtiAttempt)}
              onEnsureAttemptId={ensureMombtiAttemptId}
            />
          )}

          {currentScreen === 'mombti' && (
            <MombtiDetailScreen
              data={mombti}
              onBack={goBack}
              onOpenMombtiMenu={() => navigateToScreen('mombti-menu')}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
            />
          )}

          {currentScreen === 'mombti-latest' && (
            <MombtiLatestResultScreen
              data={latestMombti}
              onBack={goBack}
              onOpenMombtiMenu={() => navigateToScreen('mombti-menu')}
              onOpenHome={() => navigateToScreen('parent-mode')}
              onOpenDevice={openParentDevice}
              onOpenCommunity={openCommunity}
            />
          )}
        </div>

        {currentScreen === 'home' && isHomeSheetOpen ? (
          <HomeSelectionSheet
            onClose={() => setIsHomeSheetOpen(false)}
            onOpenSettings={openSettings}
          />
        ) : null}
      </section>
    </main>
  )
}

export default App
