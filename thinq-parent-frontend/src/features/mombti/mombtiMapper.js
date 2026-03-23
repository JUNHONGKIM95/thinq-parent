const SCORE_PAIRS = [
  { leftKey: 'planner', rightKey: 'reactive', leftLabel: 'Planner', rightLabel: 'Reactive' },
  { leftKey: 'thinking', rightKey: 'feeling', leftLabel: 'Thinking', rightLabel: 'Feeling' },
  {
    leftKey: 'independent',
    rightKey: 'connected',
    leftLabel: 'Independent',
    rightLabel: 'Connected',
  },
  { leftKey: 'efficiency', rightKey: 'meaning', leftLabel: 'Efficiency', rightLabel: 'Meaning' },
]

const RESULT_IMAGE_MODULES = import.meta.glob('../../../assets/mombti/*.{png,svg}', {
  eager: true,
  import: 'default',
})

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

function normalizeResultType(value) {
  return String(value ?? '').trim().toUpperCase()
}

function getResultAsset(resultType, extension) {
  const normalizedType = normalizeResultType(resultType)

  if (!normalizedType) {
    return ''
  }

  const entry = Object.entries(RESULT_IMAGE_MODULES).find(([path]) => path.endsWith(`${normalizedType}.${extension}`))
  return entry?.[1] ?? ''
}

function getScoreValue(scores, ...keys) {
  for (const key of keys) {
    if (scores?.[key] !== undefined && scores?.[key] !== null) {
      return scores[key]
    }
  }

  return 0
}

function buildBarValues(pair, leftValue, rightValue) {
  const safeLeft = clampPercent(leftValue)
  const safeRight = clampPercent(rightValue)
  const total = safeLeft + safeRight
  const dominantPercent = total ? (Math.max(safeLeft, safeRight) / total) * 100 : 0

  return {
    ...pair,
    leftValue: safeLeft,
    rightValue: safeRight,
    activePercent: clampPercent(dominantPercent),
    activeSide: safeRight > safeLeft ? 'right' : 'left',
  }
}

function getAttemptProfile(attempt) {
  if (attempt?.profile && typeof attempt.profile === 'object') {
    return attempt.profile
  }

  if (attempt?.resultProfile && typeof attempt.resultProfile === 'object') {
    return attempt.resultProfile
  }

  if (attempt?.result_profile && typeof attempt.result_profile === 'object') {
    return attempt.result_profile
  }

  return {}
}

export function buildMombtiViewModel(record, meta) {
  const type = normalizeResultType(record?.mombti_type)
  const scores = meta?.scores ?? {}
  const defaultImage = getResultAsset(type, 'svg') || (record?.image ?? '')
  const defaultTitleImage =
    record?.titleUrl ??
    record?.title_url ??
    record?.titleImage ??
    record?.title_image ??
    getResultAsset(type, 'png') ??
    ''

  return {
    id: record?.mbti_id ?? null,
    type,
    title: record?.title ?? '',
    subtitle: record?.subtitle ?? '',
    subtitleHighlight: meta?.subtitleHighlight ?? '',
    summary: record?.summary ?? '',
    image: defaultImage,
    copyImage: defaultImage,
    titleImage: defaultTitleImage,
    scorePairs: SCORE_PAIRS.map((pair) => buildBarValues(pair, scores[pair.leftKey], scores[pair.rightKey])),
    details: (meta?.details ?? []).map((detail) => ({
      ...detail,
      isSelected: type.includes(detail.key),
    })),
    navigation: meta?.navigation ?? [],
  }
}

export function buildMombtiViewModelFromAttempt(attempt, meta) {
  const profile = getAttemptProfile(attempt)
  const resultType = normalizeResultType(
    attempt?.resultType ?? attempt?.result_type ?? profile?.resultType ?? profile?.result_type
  )
  const scores = attempt?.scores ?? attempt?.score ?? {}
  const copyImage =
    getResultAsset(resultType, 'svg') ||
    profile?.imageUrl ||
    profile?.image_url ||
    profile?.image ||
    ''
  const titleImage =
    profile?.titleUrl ??
    profile?.title_url ??
    profile?.titleImage ??
    profile?.title_image ??
    getResultAsset(resultType, 'png') ??
    copyImage

  return {
    id: attempt?.attemptId ?? attempt?.attempt_id ?? attempt?.id ?? null,
    type: resultType,
    title: profile?.title ?? resultType,
    subtitle: profile?.subtitle ?? '',
    subtitleHighlight: '',
    summary: profile?.summary ?? attempt?.summary ?? '',
    image: copyImage,
    copyImage,
    titleImage,
    scorePairs: [
      buildBarValues(
        SCORE_PAIRS[0],
        getScoreValue(scores, 'scoreP', 'score_p', 'planner'),
        getScoreValue(scores, 'scoreR', 'score_r', 'reactive')
      ),
      buildBarValues(
        SCORE_PAIRS[1],
        getScoreValue(scores, 'scoreT', 'score_t', 'thinking'),
        getScoreValue(scores, 'scoreF', 'score_f', 'feeling')
      ),
      buildBarValues(
        SCORE_PAIRS[2],
        getScoreValue(scores, 'scoreI', 'score_i', 'independent'),
        getScoreValue(scores, 'scoreC', 'score_c', 'connected')
      ),
      buildBarValues(
        SCORE_PAIRS[3],
        getScoreValue(scores, 'scoreE', 'score_e', 'efficiency'),
        getScoreValue(scores, 'scoreM', 'score_m', 'meaning')
      ),
    ],
    details: (meta?.details ?? []).map((detail) => ({
      ...detail,
      isSelected: resultType.includes(detail.key),
    })),
    navigation: meta?.navigation ?? [],
  }
}
