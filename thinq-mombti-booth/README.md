# MomBTI 부스 체험용

LG ThinQ 부모모드 — MomBTI 검사 체험 전용 페이지

## 실행 방법

```bash
cd thinq-mombti-booth
npx serve .
```

또는 Python이 있으면:
```bash
cd thinq-mombti-booth
python -m http.server 3000
```

브라우저에서 `http://localhost:3000` 또는 `http://{PC_IP}:3000` 접속

## 사전 조건

- 백엔드 서버가 8081 포트에서 실행 중이어야 합니다
- 같은 네트워크에서 접근 가능

## QR 코드 생성

`http://{PC_IP}:3000` 주소로 QR 코드를 생성하여 부스에 비치하세요.

## 구성

- `index.html` — MomBTI 검사 전용 SPA (단일 파일)
- 별도 설치 불필요 (순수 HTML + JS)
