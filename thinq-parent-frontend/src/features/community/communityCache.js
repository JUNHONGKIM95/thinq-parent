const LIST_PREFIX = 'community:list:v1'
const DETAIL_PREFIX = 'community:detail:v1'

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
    // Ignore storage failures.
  }
}

function getListKey({ boardId, keywordId, sameMombtiOnly, userId }) {
  const normalizedBoardId = boardId ?? 'all'
  const normalizedKeywordId = keywordId ?? 'all'
  const normalizedSameMombtiOnly = sameMombtiOnly ? 'same' : 'all'
  const normalizedUserId = userId ?? 'anon'

  return `${LIST_PREFIX}:${normalizedUserId}:${normalizedBoardId}:${normalizedKeywordId}:${normalizedSameMombtiOnly}`
}

function getDetailKey(postId) {
  return `${DETAIL_PREFIX}:${postId}`
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

export function readCachedCommunityList(filters) {
  return readCache(getListKey(filters))
}

export function writeCachedCommunityList(filters, posts) {
  writeCache(getListKey(filters), { posts })
}

export function readCachedCommunityDetail(postId) {
  return readCache(getDetailKey(postId))
}

export function writeCachedCommunityDetail(postId, value) {
  writeCache(getDetailKey(postId), value)
}

export function removeCachedCommunityDetail(postId) {
  if (!canUseStorage() || !postId) {
    return
  }

  try {
    window.localStorage.removeItem(getDetailKey(postId))
  } catch {
    // Ignore storage failures.
  }
}

export function upsertCommunityPostInCachedLists(post) {
  if (!post?.postId) {
    return
  }

  getAllKeys()
    .filter((key) => key.startsWith(LIST_PREFIX))
    .forEach((key) => {
      const payload = readCache(key)

      if (!Array.isArray(payload?.posts)) {
        return
      }

      const matchedIndex = payload.posts.findIndex((item) => String(item.postId) === String(post.postId))

      if (matchedIndex < 0) {
        return
      }

      writeCache(key, {
        posts: payload.posts.map((item) => (String(item.postId) === String(post.postId) ? { ...item, ...post } : item)),
      })
    })
}

export function removeCommunityPostFromCachedLists(postId) {
  if (!postId) {
    return
  }

  getAllKeys()
    .filter((key) => key.startsWith(LIST_PREFIX))
    .forEach((key) => {
      const payload = readCache(key)

      if (!Array.isArray(payload?.posts)) {
        return
      }

      writeCache(key, {
        posts: payload.posts.filter((item) => String(item.postId) !== String(postId)),
      })
    })
}
