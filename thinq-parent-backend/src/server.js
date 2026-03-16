import cors from 'cors'
import express from 'express'
import { readStore, updateStore } from './lib/store.js'
import { buildQuestionPayload, buildResultPayload, validateSubmissionPayload } from './services/mombti.js'

const app = express()
const PORT = Number(process.env.PORT ?? 4000)

app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  }),
)
app.use(express.json())

function findChild(store, childId) {
  return store.children.find((child) => child.id === Number(childId))
}

function buildDashboardPayload(store, childId) {
  const child = findChild(store, childId)

  if (!child) {
    return null
  }

  const submissions = store.mombti.submissions.filter((submission) => submission.childId === child.id)
  const latestSubmission = submissions.at(-1)

  return {
    childId: child.id,
    childName: child.name,
    dDay: child.dDay,
    dueDate: child.dueDate,
    mombti: {
      title: 'MomBTI',
      description: '아이를 더 잘 알기 위한 첫걸음,\n먼저 나의 육아 성향을 알아보세요.',
      ctaLabel: '테스트하러 가기',
      hasResult: Boolean(latestSubmission),
      latestSubmissionId: latestSubmission?.id ?? null,
    },
    diaryCards: [
      { key: 'write', label: '일기 쓰기' },
      { key: 'read', label: '일기 보기' },
    ],
    schedule: child.schedule,
    todo: child.todo,
  }
}

function buildChildProfilePayload(child) {
  return {
    childId: child.id,
    childName: child.name,
    dDay: child.dDay,
    dueDate: child.dueDate,
    calculationMethod: child.calculationMethod,
    selectedDate: child.selectedDate,
  }
}

app.get('/health', (_request, response) => {
  response.json({ ok: true, service: 'thinq-parent-backend' })
})

app.get('/api/my/dashboard', async (request, response) => {
  const childId = Number(request.query.childId ?? 1)
  const store = await readStore()
  const payload = buildDashboardPayload(store, childId)

  if (!payload) {
    response.status(404).json({ message: '해당 아이를 찾을 수 없습니다.' })
    return
  }

  response.json(payload)
})

app.get('/api/children/:childId/profile', async (request, response) => {
  const store = await readStore()
  const child = findChild(store, request.params.childId)

  if (!child) {
    response.status(404).json({ message: '해당 아이를 찾을 수 없습니다.' })
    return
  }

  response.json(buildChildProfilePayload(child))
})

app.patch('/api/children/:childId/profile', async (request, response) => {
  const allowedMethods = new Set(['due_date', 'last_period'])

  const nextStore = await updateStore((store) => {
    const child = findChild(store, request.params.childId)

    if (!child) {
      return store
    }

    const { childName, calculationMethod, selectedDate, dueDate, dDay } = request.body ?? {}

    if (typeof childName === 'string' && childName.trim()) {
      child.name = childName.trim()
    }

    if (typeof calculationMethod === 'string' && allowedMethods.has(calculationMethod)) {
      child.calculationMethod = calculationMethod
    }

    if (typeof selectedDate === 'string' && selectedDate) {
      child.selectedDate = selectedDate
    }

    if (typeof dueDate === 'string' && dueDate) {
      child.dueDate = dueDate
    }

    if (Number.isInteger(dDay)) {
      child.dDay = dDay
    }

    return store
  })

  const updatedChild = findChild(nextStore, request.params.childId)

  if (!updatedChild) {
    response.status(404).json({ message: '해당 아이를 찾을 수 없습니다.' })
    return
  }

  response.json(buildChildProfilePayload(updatedChild))
})

app.get('/api/mombti/questions', async (_request, response) => {
  const store = await readStore()
  response.json(buildQuestionPayload(store))
})

app.post('/api/mombti/submissions', async (request, response) => {
  const store = await readStore()
  const validationError = validateSubmissionPayload(store, request.body)

  if (validationError) {
    response.status(400).json({ message: validationError })
    return
  }

  const child = findChild(store, request.body.childId)

  if (!child) {
    response.status(404).json({ message: '해당 아이를 찾을 수 없습니다.' })
    return
  }

  const updatedStore = await updateStore((currentStore) => {
    const nextId =
      currentStore.mombti.submissions.reduce((maxId, submission) => Math.max(maxId, submission.id), 0) + 1

    currentStore.mombti.submissions.push({
      id: nextId,
      childId: request.body.childId,
      answers: request.body.answers.map((answer) => ({
        questionId: Number(answer.questionId),
        value: Number(answer.value),
      })),
      createdAt: new Date().toISOString(),
    })

    return currentStore
  })

  const submission = updatedStore.mombti.submissions.at(-1)
  response.status(201).json({
    submissionId: submission.id,
    result: buildResultPayload(updatedStore, submission),
  })
})

app.get('/api/mombti/results/:submissionId', async (request, response) => {
  const store = await readStore()
  const submission = store.mombti.submissions.find((item) => item.id === Number(request.params.submissionId))

  if (!submission) {
    response.status(404).json({ message: '해당 검사 결과를 찾을 수 없습니다.' })
    return
  }

  response.json(buildResultPayload(store, submission))
})

app.get('/api/mombti/results/latest/:childId', async (request, response) => {
  const store = await readStore()
  const submission = [...store.mombti.submissions]
    .reverse()
    .find((item) => item.childId === Number(request.params.childId))

  if (!submission) {
    response.status(404).json({ message: '해당 아이의 최근 검사 결과가 없습니다.' })
    return
  }

  response.json(buildResultPayload(store, submission))
})

app.use((error, _request, response, _next) => {
  console.error(error)
  response.status(500).json({ message: '서버 오류가 발생했습니다.' })
})

app.listen(PORT, () => {
  console.log(`thinq-parent-backend listening on http://localhost:${PORT}`)
})
