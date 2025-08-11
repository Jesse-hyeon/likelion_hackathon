# K-Fish 온라인 수산물 경매 시스템

실시간 온라인 수산물 경매 플랫폼 - 48시간 해커톤 MVP

## 주요 기능

### 구현 완료
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
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. 서버 실행

#### Windows
```bash
# 프로젝트 루트에서
start.bat
```

#### Mac/Linux
```bash
# Backend (터미널 1)
cd backend
npm start

# Frontend (터미널 2)
cd frontend
npm run dev
```

### 3. 접속
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 시연 시나리오

### 1. 어민 플로우
1. 홈페이지에서 "김어민" 선택
2. 대시보드에서 "새 수산물 등록" 클릭
3. 수산물 정보 입력 및 등록
4. RFID 태그 자동 생성 확인

### 2. 구매자 플로우
1. 홈페이지에서 "이구매" 선택
2. "실시간 경매 참여" 클릭
3. 진행중인 경매에 입찰
4. 실시간 가격 업데이트 확인

### 3. 배송 추적
1. 경매 종료 후 자동 배송 시작
2. "배송 추적" 페이지에서 실시간 위치 확인
3. 온도 모니터링 데이터 확인

### 4. 관리자 기능
1. "관리자" 계정으로 로그인
2. 경매 시작/종료 관리
3. 전체 시스템 모니터링

## 테스트 계정

- 어민: 김어민 (fisherman1@kfish.com)
- 구매자: 이구매 (buyer1@kfish.com)
- 물류: 박물류 (logistics1@kfish.com)
- 관리자: 관리자 (admin@kfish.com)

## 실시간 기능

- WebSocket을 통한 실시간 경매 입찰
- 실시간 배송 위치 업데이트 (10초마다)
- 실시간 온도 모니터링 시뮬레이션

## 주의사항

- 로그인 기능은 간소화됨 (사용자 선택 방식)
- 모든 데이터는 메모리에 저장 (서버 재시작시 초기화)
- GPS 및 온도 데이터는 시뮬레이션
- AI 품질 평가는 Mock 데이터로 구현

## 핵심 어필 포인트

1. 완전 추적 시스템: RFID 태그로 전 과정 추적
2. 실시간 경매: WebSocket 기반 실시간 입찰
3. 자동화 물류: 낙찰 즉시 자동 배송 시작
4. 온도 관리: 실시간 온도 모니터링