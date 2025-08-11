# K-Fish 온라인 수산물 경매 시스템

실시간 온라인 수산물 경매 플랫폼

## 주요 기능

- 사용자 시스템: 4가지 사용자 유형 (어민, 구매자, 물류, 관리자)
- 수산물 등록: RFID 태그 시뮬레이션, GPS 위치 기록
- 실시간 경매: WebSocket 기반 실시간 입찰
- 배송 추적: GPS 위치 및 온도 모니터링 시뮬레이션
- 대시보드: 사용자별 맞춤 대시보드

## 기술 스택

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Socket.io-client
- Zustand (상태 관리)

### Backend
- Node.js + Express
- Socket.io
- SQLite (in-memory)

## 설치 및 실행

### 1. 의존성 설치
```bash
# Frontend
cd k-fish/frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. 서버 실행
```bash
# Backend (터미널 1)
cd k-fish/backend
npm start

# Frontend (터미널 2)
cd k-fish/frontend
npm run dev
```

### 3. 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 테스트 계정

- 어민: 김어민 (fisherman1@kfish.com)
- 구매자: 이구매 (buyer1@kfish.com)
- 물류: 박물류 (logistics1@kfish.com)
- 관리자: 관리자 (admin@kfish.com)

## 프로젝트 구조
```
k-fish/
├── frontend/          # Next.js 프론트엔드
│   ├── app/          # 페이지 및 라우팅
│   ├── components/   # 재사용 컴포넌트
│   ├── lib/          # 유틸리티 함수
│   └── store/        # 상태 관리
├── backend/          # Express 백엔드
│   └── server.js     # 메인 서버 파일
└── database/         # 데이터베이스 파일
```