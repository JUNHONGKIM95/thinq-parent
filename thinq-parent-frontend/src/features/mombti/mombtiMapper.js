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

function clampPercent(value) {
  return Math.max(0, Math.min(100, Number(value) || 0))
}

export function buildMombtiViewModel(record, meta) {
  const type = (record?.mombti_type ?? '').toUpperCase()
  const scores = meta?.scores ?? {}

  return {
    id: record?.mbti_id ?? null,
    type,
    title: record?.title ?? '',
    subtitle: record?.subtitle ?? '',
    subtitleHighlight: meta?.subtitleHighlight ?? '',
    summary: record?.summary ?? '',
    image: record?.image ?? '',
    scorePairs: SCORE_PAIRS.map((pair) => {
      const leftValue = clampPercent(scores[pair.leftKey])
      const rightValue = clampPercent(scores[pair.rightKey])

      return {
        ...pair,
        leftValue,
        rightValue,
        activePercent: leftValue || Math.max(0, 100 - rightValue),
      }
    }),
    details: (meta?.details ?? []).map((detail) => ({
      ...detail,
      isSelected: type.includes(detail.key),
    })),
    navigation: meta?.navigation ?? [],
  }
}
