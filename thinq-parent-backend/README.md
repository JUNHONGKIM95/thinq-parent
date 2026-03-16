# thinq-parent-backend

현재 프론트 화면에 맞춘 최소 백엔드 API 서버입니다.

## 실행

```bash
npm install
npm run dev
```

기본 포트는 `4000` 입니다.

## 주요 엔드포인트

- `GET /health`
- `GET /api/my/dashboard?childId=1`
- `GET /api/children/1/profile`
- `PATCH /api/children/1/profile`
- `GET /api/mombti/questions`
- `POST /api/mombti/submissions`
- `GET /api/mombti/results/:submissionId`
- `GET /api/mombti/results/latest/:childId`

## 저장 방식

개발 단계에서는 `src/data/store.json` 파일을 실제 저장소처럼 사용합니다.

나중에 DB로 옮길 때는:

- `src/server.js` 라우트는 유지
- `src/lib/store.js` 를 DB 접근 코드로 교체
- `src/services/mombti.js` 계산 로직은 그대로 재사용
