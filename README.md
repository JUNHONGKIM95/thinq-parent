# LG DX School 4팀 (Last Dance)
# ThinQ 부모모드 (ThinQ Parenting Mode)

임산부와 배우자를 위한 LG ThinQ 기반 통합 지원 서비스

---

## 프로젝트 구조

```
thinq-parent/
├── thinq-parent-frontend/    # React 19 + Vite (프론트엔드)
├── thinq-parent-backend/     # Spring Boot 4.0.3 (백엔드 REST API)
└── README.md
```

---

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 19, Vite 7.3, JavaScript (ES Module) |
| Backend | Spring Boot 4.0.3, Java 21, Spring Data JPA, Spring Validation |
| Database | PostgreSQL 17 (Supabase 호스팅) |
| Storage | Supabase Storage (이미지 파일) |
| AI Chatbot | Google Gemini API (GCP) |
| API 문서 | SpringDoc OpenAPI 3.0.2 (Swagger UI) |

---

## 백엔드 (Backend)

### 실행 방법

```bash
cd thinq-parent-backend
./gradlew bootRun
```

- 서버 포트: `8081`
- Swagger UI: `http://localhost:8081/swagger-ui.html`

### 아키텍처

계층형 아키텍처 (Layered Architecture)를 적용하여 관심사를 분리하였습니다.

```
Controller → Service (Interface) → ServiceImpl → Repository → Entity
                                                                 ↕
                                                            PostgreSQL (Supabase)
```

### API 모듈 구성 (13개 컨트롤러, 80+ 엔드포인트)

| 모듈 | Base Path | 주요 기능 |
|------|-----------|-----------|
| 사용자 | `/api/v1/users` | 회원 CRUD, 임신 주차 조회, 출산 예정일 관리 |
| 가족 그룹 | `/api/v1/family-groups` | 그룹 생성, 초대 코드 기반 참여 |
| 임신 일기 | `/api/pregnancy-diaries` | 일기 CRUD, 이미지 업로드 (Supabase Storage) |
| 일정 관리 | `/api/v1/schedules` | 월별/일별 일정 조회, 출산 예정일 자동 관리 |
| 나만의 할 일 | `/api/v1/my-list` | 투두 리스트 CRUD, 완료 여부 관리 |
| 추천 할 일 | `/api/v1/todos` | 임신 주차별 맞춤 추천 할 일 |
| 추천 목록 | `/api/v1/recommand-list` | 주차별 추천 항목 체크 관리 |
| 맘BTI 검사 | `/api/v1/mombti` | 24문항 성격 유형 검사 (16개 결과 유형) |
| 커뮤니티 | `/api/v1/community` | 게시글/댓글/좋아요, 게시판/키워드 분류, 맘BTI 필터 |
| 응원 메시지 | `/api/v1/cheer-messages` | 가족 간 응원 메시지 전송 |
| 가전 제어 | `/api/appliance-controls` | 루틴 선택/변경, 자동제어 토글, 알림음 제어 |
| 헬스체크 | `/api/v1/health` | 서버/DB 상태 확인 |

### 가전 제어 API 상세

임신 시기별 가전 루틴을 관리하는 핵심 차별 기능입니다.

| Method | Endpoint | 기능 |
|--------|----------|------|
| `POST` | `/api/appliance-controls` | 최초 루틴 선택 (4개 가전 등록) |
| `PATCH` | `/api/appliance-controls/routine` | 루틴 변경 (초기→중기→후기) |
| `GET` | `/api/appliance-controls` | 내 가전 제어 상태 조회 |
| `PATCH` | `/api/appliance-controls/routine-activation` | 가전제품 자동제어 ON/OFF |
| `PATCH` | `/api/appliance-controls/alert-sound-all` | 전체 알림음 일괄 ON/OFF |
| `PATCH` | `/api/appliance-controls/{id}/alert-sound` | 개별 알림음 ON/OFF |
| `GET` | `/api/appliance-controls/routines` | 루틴 목록 조회 (3개) |

### 코드 규모

| 구분 | 파일 수 |
|------|--------|
| Controller | 13개 |
| Service (인터페이스 + 구현체) | 27개 |
| Repository | 23개 |
| Domain (Entity) | 23개 |
| DTO (Request/Response) | 58개 |

---

## 데이터베이스 (Database)

### 구성

| 항목 | 내용 |
|------|------|
| DBMS | PostgreSQL 17.6 |
| 호스팅 | Supabase (AWS ap-northeast-1) |
| 테이블 수 | 23개 |
| DDL 전략 | validate (엔티티-스키마 정합성 검증) |
| 파일 저장소 | Supabase Storage (임신 일기 이미지) |

### ERD 도메인 구성 (23개 테이블)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [임신일기]          [핵심]              [커뮤니티]          │
│   diary_images       users ◄──► family    boards            │
│       ↓             groups               keywords           │
│   diaries                                  ↓                │
│                                          posts              │
│   [할일]          [일정/응원]            ↙    ↘             │
│   todos          schedules          comments  likes         │
│   my_list        cheer_messages                             │
│   recommand_list                                            │
│                                                             │
│   [맘BTI]              [AI]           [가전제어]             │
│   question          ai_chat_logs     appliance_master       │
│   choice                             routine_master         │
│   result_profile                     routine_action         │
│   test_attempt                       user_appliance_control │
│   answer                                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 테이블 목록

| 도메인 | 테이블 | 설명 |
|--------|--------|------|
| 핵심 | `users` | 사용자 (이메일, 태명, 출산예정일, 임신주차) |
| 핵심 | `family_groups` | 가족 그룹 (초대코드 기반) |
| 임신일기 | `pregnancy_diaries` | 임신 일기 (부부 공유) |
| 임신일기 | `pregnancy_diary_images` | 일기 첨부 이미지 (Supabase Storage) |
| 할일 | `todos` | 추천 할 일 마스터 (주차별) |
| 할일 | `my_list` | 나만의 할 일 |
| 할일 | `recommand_list` | 추천 할 일 체크 목록 |
| 맘BTI | `mombti_question` | 검사 문항 (24개) |
| 맘BTI | `mombti_choice` | 문항별 선택지 (120개) |
| 맘BTI | `mombti_result_profile` | 결과 유형 프로필 (16개) |
| 맘BTI | `mombti_test_attempt` | 검사 시도 기록 |
| 맘BTI | `mombti_answer` | 문항별 답변 기록 |
| 커뮤니티 | `boards` | 게시판 마스터 (임신수다, 정보/고민) |
| 커뮤니티 | `community_keywords` | 키워드 마스터 (7개) |
| 커뮤니티 | `community_posts` | 게시글 |
| 커뮤니티 | `community_comments` | 댓글 |
| 커뮤니티 | `community_post_likes` | 좋아요 |
| 일정 | `schedules` | 일정 (6개 유형: 아기/가족/업무/개인/중요/기타) |
| 응원 | `cheer_messages` | 가족 간 응원 메시지 |
| 가전제어 | `appliance_master` | 가전 마스터 (세탁기/건조기/로봇청소기/공기청정기) |
| 가전제어 | `routine_master` | 루틴 마스터 (초기/중기/후기) |
| 가전제어 | `routine_action` | 루틴별 가전 동작 정의 (12개) |
| 가전제어 | `user_appliance_control` | 사용자별 가전 제어 상태 |

### 스키마 파일

- `supabase-postgres-schema.sql` — 전체 DB 스키마 + 시드 데이터
- `appliance_mvp.sql` — 가전 제어 테이블 독립 스키마

---

## 환경 설정

### Backend (`application.properties`)

| 설정 | 값 |
|------|-----|
| 서버 포트 | 8081 |
| DB 접속 | Supabase PostgreSQL (SSL) |
| JPA DDL | validate |
| 파일 업로드 제한 | 10MB |
| Swagger | `/swagger-ui.html` |

### Frontend

| 설정 | 값 |
|------|-----|
| 개발 서버 | `npm run dev` (Vite) |
| API Base URL | `VITE_API_BASE_URL` 환경변수 |
| 기본값 | `http://localhost:8000/api/v1` |

---

## 팀 구성

**4팀 Last Dance** — LG DX School
