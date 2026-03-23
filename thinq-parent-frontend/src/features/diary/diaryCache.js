const LIST_PREFIX = 'pregnancy-diary:list:v1'
const DETAIL_PREFIX = 'pregnancy-diary:detail:v1'

function canUseStorage() {
  return typeof window !== 'undefined' && Boolean(window.localStorage)
}

function safeParse(value, fallbackValue) {
  try {
    return value ? JSON.parse(value) : fallbackValue
  } catch {
    return fallbackValue
  }
}

function getListKey(userId, page, limit) {
  return `${LIST_PREFIX}:${userId}:${page}:${limit}`
}

function getDetailKey(userId, diaryId) {
  return `${DETAIL_PREFIX}:${userId}:${diaryId}`
}

function getUserListPrefix(userId) {
  return `${LIST_PREFIX}:${userId}:`
}

function getUserDetailPrefix(userId) {
  return `${DETAIL_PREFIX}:${userId}:`
}

function readCache(key) {
  if (!canUseStorage()) {
    return null
  }

  return safeParse(window.localStorage.getItem(key), null)
}

function writeCache(key, value) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        ...value,
        cachedAt: Date.now(),
      }),
    )
  } catch {
    // Ignore storage quota and serialization failures.
  }
}

function removeCache(key) {
  if (!canUseStorage()) {
    return
  }

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Ignore storage failures.
  }
}

function getAllKeys() {
  if (!canUseStorage()) {
    return []
  }

  try {
    return Object.keys(window.localStorage)
  } catch {
    return []
  }
}

function computeTotalPages(totalCount, limit, fallbackTotalPages = 1) {
  if (!limit) {
    return Math.max(1, fallbackTotalPages || 1)
  }

  return Math.max(1, Math.ceil(Math.max(0, totalCount) / limit))
}

function updateListPayloadItems(payload, nextItems, nextTotalCount) {
  const pagination = payload?.pagination ?? {}
  const limit = Number(pagination.limit) || nextItems.length || 10

  return {
    items: nextItems,
    pagination: {
      page: Number(pagination.page) || 1,
      limit,
      totalCount: typeof nextTotalCount === 'number' ? nextTotalCount : Number(pagination.totalCount) || nextItems.length,
      totalPages: computeTotalPages(
        typeof nextTotalCount === 'number' ? nextTotalCount : Number(pagination.totalCount) || nextItems.length,
        limit,
        Number(pagination.totalPages) || 1,
      ),
    },
  }
}

export function readCachedDiaryList(userId, page, limit) {
  return readCache(getListKey(userId, page, limit))
}

export function writeCachedDiaryList(userId, page, limit, value) {
  writeCache(getListKey(userId, page, limit), value)
}

export function readCachedDiaryDetail(userId, diaryId) {
  return readCache(getDetailKey(userId, diaryId))
}

export function writeCachedDiaryDetail(userId, diaryId, value) {
  writeCache(getDetailKey(userId, diaryId), value)
}

export function removeCachedDiaryDetail(userId, diaryId) {
  removeCache(getDetailKey(userId, diaryId))
}

export function upsertDiaryInCachedLists(userId, diary, options = {}) {
  if (!diary?.id) {
    return
  }

  const { prepend = false } = options
  const userPrefix = getUserListPrefix(userId)

  getAllKeys()
    .filter((key) => key.startsWith(userPrefix))
    .forEach((key) => {
      const payload = readCache(key)

      if (!payload?.items || !Array.isArray(payload.items)) {
        return
      }

      const matchedIndex = payload.items.findIndex((item) => String(item.id) === String(diary.id))
      let nextItems = payload.items
      let nextTotalCount = Number(payload?.pagination?.totalCount) || payload.items.length

      if (matchedIndex >= 0) {
        nextItems = payload.items.map((item) => (String(item.id) === String(diary.id) ? { ...item, ...diary } : item))
      } else if (prepend && Number(payload?.pagination?.page) === 1) {
        const limit = Number(payload?.pagination?.limit) || payload.items.length || 10
        nextItems = [diary, ...payload.items].slice(0, limit)
        nextTotalCount += 1
      } else {
        return
      }

      writeCache(key, updateListPayloadItems(payload, nextItems, nextTotalCount))
    })
}

export function removeDiaryFromCachedLists(userId, diaryId) {
  const userPrefix = getUserListPrefix(userId)

  getAllKeys()
    .filter((key) => key.startsWith(userPrefix))
    .forEach((key) => {
      const payload = readCache(key)

      if (!payload?.items || !Array.isArray(payload.items)) {
        return
      }

      const nextItems = payload.items.filter((item) => String(item.id) !== String(diaryId))

      if (nextItems.length === payload.items.length) {
        return
      }

      const currentTotalCount = Number(payload?.pagination?.totalCount) || payload.items.length
      const nextTotalCount = Math.max(0, currentTotalCount - 1)

      writeCache(key, updateListPayloadItems(payload, nextItems, nextTotalCount))
    })
}

export function updateCachedDiaryDetail(userId, diaryId, updater) {
  const currentValue = readCachedDiaryDetail(userId, diaryId)

  if (!currentValue) {
    return
  }

  const nextValue = typeof updater === 'function' ? updater(currentValue) : updater

  if (!nextValue) {
    removeCachedDiaryDetail(userId, diaryId)
    return
  }

  writeCachedDiaryDetail(userId, diaryId, nextValue)
}

export function removeDiaryFromCache(userId, diaryId) {
  removeDiaryFromCachedLists(userId, diaryId)
  removeCachedDiaryDetail(userId, diaryId)
}

export function clearUserDiaryDetailCaches(userId) {
  const userPrefix = getUserDetailPrefix(userId)

  getAllKeys()
    .filter((key) => key.startsWith(userPrefix))
    .forEach(removeCache)
}
