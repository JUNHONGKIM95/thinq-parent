const AXES = [
  {
    code: 'P_R',
    leftTrait: 'planner',
    rightTrait: 'reactive',
  },
  {
    code: 'T_F',
    leftTrait: 'thinking',
    rightTrait: 'feeling',
  },
  {
    code: 'I_C',
    leftTrait: 'independent',
    rightTrait: 'connected',
  },
  {
    code: 'E_M',
    leftTrait: 'efficiency',
    rightTrait: 'meaning',
  },
]

function roundPercent(value) {
  return Math.round(value * 100)
}

export function buildQuestionPayload(store) {
  return {
    testId: 'mombti',
    title: 'MomBTI',
    intro: {
      title: '검사 시작하기',
      descriptionLines: [
        '질문을 읽고, 가장 먼저 떠오르는 정도에 표시해 주세요.',
        '(1점: 매우 아니다 ~ 5점: 매우 그렇다)',
        '총 20문항이며, 예상 소요 시간은 약 10분입니다.',
      ],
      questionsPerPage: 5,
      totalQuestions: store.mombti.questions.length,
    },
    options: store.mombti.options,
    questions: store.mombti.questions,
  }
}

function createEmptyScores() {
  return {
    planner: 0,
    reactive: 0,
    thinking: 0,
    feeling: 0,
    independent: 0,
    connected: 0,
    efficiency: 0,
    meaning: 0,
  }
}

function calculateScores(questions, answers) {
  const scoreMap = createEmptyScores()
  const answerMap = new Map(answers.map((answer) => [Number(answer.questionId), Number(answer.value)]))

  for (const question of questions) {
    const value = answerMap.get(question.id)

    if (!value || value < 1 || value > 5) {
      continue
    }

    const axis = AXES.find((item) => item.code === question.axis)

    if (!axis) {
      continue
    }

    if (question.trait === axis.leftTrait) {
      scoreMap[axis.leftTrait] += value
      scoreMap[axis.rightTrait] += 6 - value
      continue
    }

    scoreMap[axis.rightTrait] += value
    scoreMap[axis.leftTrait] += 6 - value
  }

  return scoreMap
}

function buildTypeCode(scores, traitCopy) {
  return AXES.map((axis) => {
    const left = scores[axis.leftTrait]
    const right = scores[axis.rightTrait]
    const selectedTrait = left >= right ? axis.leftTrait : axis.rightTrait
    return traitCopy[selectedTrait].key
  }).join('')
}

function buildDetails(scores, traitCopy) {
  return AXES.flatMap((axis) => {
    const leftSelected = scores[axis.leftTrait] >= scores[axis.rightTrait]
    const left = traitCopy[axis.leftTrait]
    const right = traitCopy[axis.rightTrait]

    return [
      {
        key: left.key,
        title: left.title,
        desc: left.desc,
        isSelected: leftSelected,
      },
      {
        key: right.key,
        title: right.title,
        desc: right.desc,
        isSelected: !leftSelected,
      },
    ]
  })
}

function buildScorePairs(scores) {
  return AXES.map((axis) => {
    const leftValue = scores[axis.leftTrait]
    const rightValue = scores[axis.rightTrait]
    const total = leftValue + rightValue || 1

    return {
      leftKey: axis.leftTrait,
      rightKey: axis.rightTrait,
      leftValue: roundPercent(leftValue / total),
      rightValue: roundPercent(rightValue / total),
    }
  })
}

function buildFallbackMeta(typeCode, scorePairs) {
  const dominantSummary = scorePairs
    .map((pair) => `${pair.leftKey}: ${pair.leftValue}% / ${pair.rightKey}: ${pair.rightValue}%`)
    .join(', ')

  return {
    title: `${typeCode} 유형`,
    subtitle: `${typeCode} 성향이 가장 두드러지는 MomBTI 결과예요.`,
    summary: `현재 제출된 응답을 기준으로 계산한 결과예요.\n축별 점수는 ${dominantSummary} 입니다.`,
  }
}

export function buildResultPayload(store, submission) {
  const scores = calculateScores(store.mombti.questions, submission.answers)
  const traitCopy = store.mombti.traitCopy
  const type = buildTypeCode(scores, traitCopy)
  const override = store.mombti.typeOverrides[type]
  const scorePairs = buildScorePairs(scores)
  const meta = override ?? buildFallbackMeta(type, scorePairs)

  return {
    submissionId: submission.id,
    childId: submission.childId,
    type,
    title: meta.title,
    subtitle: meta.subtitle,
    summary: meta.summary,
    scores,
    scorePairs,
    details: buildDetails(scores, traitCopy),
    createdAt: submission.createdAt,
  }
}

export function validateSubmissionPayload(store, payload) {
  if (!payload || typeof payload !== 'object') {
    return '요청 본문이 비어 있습니다.'
  }

  if (!Number.isInteger(payload.childId)) {
    return 'childId는 정수여야 합니다.'
  }

  if (!Array.isArray(payload.answers) || payload.answers.length !== store.mombti.questions.length) {
    return `answers는 ${store.mombti.questions.length}개 문항 응답을 포함해야 합니다.`
  }

  const validQuestionIds = new Set(store.mombti.questions.map((question) => question.id))
  const seen = new Set()

  for (const answer of payload.answers) {
    if (!validQuestionIds.has(Number(answer.questionId))) {
      return `유효하지 않은 questionId가 포함되어 있습니다: ${answer.questionId}`
    }

    if (seen.has(Number(answer.questionId))) {
      return `중복 questionId가 포함되어 있습니다: ${answer.questionId}`
    }

    seen.add(Number(answer.questionId))

    if (!Number.isInteger(answer.value) || answer.value < 1 || answer.value > 5) {
      return `questionId ${answer.questionId}의 value는 1~5 사이 정수여야 합니다.`
    }
  }

  return null
}
