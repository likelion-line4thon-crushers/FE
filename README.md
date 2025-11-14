# Boini (보이니)

## 📖 서비스 소개

**Boini**는 실시간 프레젠테이션 상호작용 플랫폼입니다. 발표자와 청중이 실시간으로 소통하고, AI 기반 리포트를 통해 프레젠테이션을 분석할 수 있는 서비스입니다.
![Uploading boini 발표자료_01.jpg…]()

### 주요 기능

- 🎯 **실시간 프레젠테이션 세션 관리**

  - 발표자가 세션을 생성하고 청중이 참여할 수 있는 방(Room) 시스템
  - QR 코드를 통한 간편한 세션 참여

- 💬 **실시간 상호작용**

  - 이모지 반응 (재미있는, 놀라운, 궁금한, 신나는, 화난, 슬픈, 좋은, 나쁜)
  - 실시간 질문 및 답변 기능
  - WebSocket을 통한 실시간 동기화

- 📊 **AI 기반 리포트**

  - 이모지별 인기 슬라이드 분석
  - 질문이 가장 많았던 슬라이드 분석
  - Top 3 질문 요약
  - 청중 후기 및 만족도 분석

- 📱 **듀얼 뷰**
  - 발표자 뷰: 프레젠테이션 제어 및 실시간 피드백 확인
  - 청중 뷰: 슬라이드 확인 및 상호작용 참여

---

## 🛠 기술스택

![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=React&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF?style=flat-square&logo=Vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-6.8.1-CA4245?style=flat-square&logo=React-Router&logoColor=white)
![Styled Components](https://img.shields.io/badge/Styled_Components-6.1.19-DB7093?style=flat-square&logo=styled-components&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-1.12.2-5A29E4?style=flat-square&logo=Axios&logoColor=white)
![Netlify](https://img.shields.io/badge/Netlify-00C7B7?style=flat-square&logo=Netlify&logoColor=white)

### 주요 라이브러리

- **WebSocket**: SockJS Client, @stomp/stompjs
- **PDF**: react-pdf, pdfjs-dist

---

## 📋 컨벤션 및 브랜치 전략

### 컨벤션

#### 커밋 컨벤션

| 태그       | 용도                          |
| ---------- | ----------------------------- |
| `feat`     | 기능 추가                     |
| `fix`      | 버그 수정                     |
| `chore`    | 패키지 매니저, 설정 세팅      |
| `refactor` | 코드 리팩토링                 |
| `setting`  | 초기 세팅 및 종속성 추가 관련 |
| `docs`     | 문서 수정                     |
| `design`   | UI 수정                       |
| `test`     | 테스트 코드 추가              |

### 브랜치

| 브랜치 | 용도             |
| ------ | ---------------- |
| `main` | 배포 브랜치      |
| `dev`  | 통합 브랜치 역할 |

### 코드 컨벤션

#### Frontend (JavaScript/React)

- **파일명(컴포넌트)**: PascalCase
- **파일명(훅)**: camelCase
- **함수/변수명**: camelCase
- **컴포넌트명**: PascalCase
- **상수명**: UPPER_SNAKE_CASE

---

## 🚀 시작하기

### 설치 및 실행

```bash
npm install
npm run dev
```

---

## 📁 프로젝트 구조

```
4thon/
├── public/                    # 정적 파일
│   ├── _redirects
│   └── favicon.png
├── src/
│   ├── api/                   # API 관련 설정
│   ├── assets/                # 이미지, 아이콘 등 정적 리소스
│   │   ├── icons/
│   │   │   ├── Emoji/         # 이모지 아이콘
│   │   │   ├── Emoji_hover/   # 이모지 호버 상태
│   │   │   ├── Emoji_selected/# 이모지 선택 상태
│   │   │   └── Emoji_sticker/ # 이모지 스티커
│   │   └── images/
│   │       ├── AI/            # AI 리포트 관련 이미지
│   │       └── *.png, *.svg   # 기타 이미지 파일
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── AI/                # AI 리포트 관련 컴포넌트
│   │   │   ├── AITitle/
│   │   │   ├── ContentBox/
│   │   │   ├── PopularSlide/
│   │   │   ├── QuestionSlide/
│   │   │   ├── ReplaySlide/
│   │   │   ├── ReviewSlide/
│   │   │   ├── SideHeader/
│   │   │   ├── SlideNumber/
│   │   │   ├── SlideSkeleton/
│   │   │   ├── Top3/
│   │   │   └── TotalReaction/
│   │   ├── Audience/          # 청중 뷰 컴포넌트
│   │   │   ├── AudiencePanel/
│   │   │   ├── EmojiPanel/
│   │   │   └── SlideViewer_audience/
│   │   ├── common/            # 공통 컴포넌트
│   │   │   └── HeaderButtons/
│   │   ├── HeaderBar/        # 헤더 바 컴포넌트
│   │   ├── LandingPage/      # 랜딩 페이지 컴포넌트
│   │   ├── Layout/           # 레이아웃 컴포넌트
│   │   ├── modal/            # 모달 컴포넌트
│   │   │   └── ShareModal.jsx
│   │   ├── QuestionList/     # 질문 리스트 컴포넌트
│   │   ├── SettingsPanel/    # 설정 패널 컴포넌트
│   │   ├── SidebarSlides/    # 사이드바 슬라이드 컴포넌트
│   │   └── SlideViewer/      # 슬라이드 뷰어 컴포넌트
│   ├── constants/            # 상수 정의
│   │   └── emojiIcons.js
│   ├── contexts/             # React Context
│   ├── hooks/                # Custom Hooks
│   │   ├── useAudienceJoinRoom.js          # 청중 방 입장 및 초기 설정
│   │   ├── useAudienceQuestions.js         # 청중 질문 관리
│   │   ├── useAudienceSlides.js            # 청중 슬라이드 로드 및 관리
│   │   ├── useAudienceSlideNavigation.js   # 청중 슬라이드 네비게이션
│   │   ├── useAudienceWebSocketSubscriptions.js  # 청중 WebSocket 구독 관리
│   │   ├── useAudienceEventHandlers.js     # 청중 이벤트 핸들러
│   │   ├── useAudienceInitialState.js      # 청중 초기 상태 관리
│   │   ├── useAudienceFocusHighlight.js    # 청중 Focus Highlight 관리
│   │   ├── useAudienceStats.js             # 청중 통계
│   │   ├── useEmojiReactions.js            # 이모지 반응 관리
│   │   ├── useFocusHighlight.js            # Focus Highlight
│   │   ├── useLiveFeedback.js              # 실시간 피드백
│   │   ├── usePdfConverter.js              # PDF 변환
│   │   ├── usePresentationSession.js       # 프레젠테이션 세션 관리
│   │   ├── usePresenterPageSync.js         # 발표자 페이지 동기화
│   │   ├── usePresenterQuestions.js        # 발표자 질문 관리
│   │   ├── usePresenterWebSocket.js        # 발표자 WebSocket 관리
│   │   ├── useQuickSettings.js             # 빠른 설정 관리
│   │   ├── useQuickSettingsStorage.js      # 빠른 설정 스토리지
│   │   ├── useRoom.js                      # 방 관리
│   │   ├── useSlideImage.js                # 슬라이드 이미지 로드
│   │   ├── useSlideLoader.js               # 슬라이드 로더
│   │   ├── useStickerLoader.js             # 스티커 로더
│   │   └── useTimer.js                     # 타이머
│   ├── pages/                # 페이지 컴포넌트
│   │   ├── AIReport/         # AI 리포트 페이지
│   │   │   ├── AIReport.jsx
│   │   │   └── AIReport.styles.js
│   │   ├── AudienceView/     # 청중 뷰 페이지
│   │   │   ├── AudienceViewPage.jsx
│   │   │   ├── AudienceViewPage.styles.js
│   │   │   ├── DelayAudience.jsx
│   │   │   └── DelayAudience.styles.js
│   │   ├── CreateSession/    # 세션 생성 페이지
│   │   │   └── CreateSessionPage.jsx
│   │   ├── JoinRoom/         # 방 참여 페이지
│   │   ├── MainPage.jsx      # 메인 페이지
│   │   ├── PresenterView/    # 발표자 뷰 페이지
│   │   │   └── PresenterViewPage.jsx
│   │   └── Rating/           # 평가 페이지
│   │       └── RatingPage.jsx
│   ├── services/             # API 서비스
│   │   ├── aiReportService.js
│   │   ├── api.js
│   │   ├── feedbackService.js
│   │   ├── fetchSlides.js
│   │   ├── presentationService.js
│   │   ├── questionService.js
│   │   ├── roomService.js
│   │   ├── stickerService.js
│   │   └── websocketService.js
│   ├── store/                 # 상태 관리 (Redux/Zustand 등)
│   ├── styles/               # 전역 스타일
│   │   └── global.css
│   ├── utils/                 # 유틸리티 함수
│   │   ├── aiReportRoom.js
│   │   └── questionHelpers.js
│   ├── App.jsx                # 메인 App 컴포넌트
│   ├── main.jsx               # 진입점
│   └── router.jsx             # 라우터 설정
├── dist/                      # 빌드 결과물
├── node_modules/              # 의존성 패키지
├── eslint.config.js           # ESLint 설정
├── index.html                 # HTML 템플릿
├── package.json               # 프로젝트 설정 및 의존성
├── package-lock.json           # 의존성 잠금 파일
├── vite.config.js             # Vite 설정
└── README.md                  # 프로젝트 문서
```

---

## 📄 라이선스

이 프로젝트는 4호선톤 프로젝트입니다.
