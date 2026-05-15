# 📔 하루묶음 (Harumukkum)

> 오늘 하루를 단 몇 개의 질문으로 기록하는 AI 일기 앱


Web URL: https://harumukkum-xfad.vercel.app/


> **"오늘 하루를 단 3분 만에, 한 편의 이야기로"**


오늘 하루를 기록하고 싶지만 글쓰기가 어려운 당신을 위해, AI가 당신의 하루를 한 편의 일기로 엮어줍니다.

---

## 🧐 아이디어

20대 대학생, 비리얼이랑 셋로그는 잘 쓰는데 왜 일기는 쓰지 않을까?

### 우리가 찾은 답

- 글 쓰기 자체가 귀찮다
- 일상이 단조로워 특별할 게 없다고 느낀다
- 한 번 쓰면 다꾸(다이어리 꾸미기)도 해야 할 것 같은데, 똥손이라 시도조차 안 한다

### 우리가 쓴 답

하루묶음은 "쓰는 일기"에서 "엮어주는 일기"로 패러다임을 바꿉니다.

질문에 선택 혹은 단답만 하면 됩니다. 답변을 바탕으로 AI가 본문의 대부분을 채워주면, 우리는 다듬기만 하면 됩니다.

---

## 🤖 핵심 기능

### ✍️ AI 일기 생성
언제 / 어디서 / 누구와 / 무엇을 / 감정을 입력하면 OpenAI 기반 Edge Function이 일기 초안을 생성합니다.

### 📅 캘린더형 일기 관리
날짜별 일기를 한눈에 확인하고, 사진 썸네일과 함께 기록을 관리할 수 있습니다.

### 📊 주간 리포트
한 주 동안 작성한 일기를 기반으로 감정 흐름 / 키워드 TOP 5 / AI 인사이트 / Reflection Tip을 제공합니다.

### 👥 친구 기능
친구의 공개 일기를 카드형 피드로 확인하고, 일기를 아직 작성하지 않은 친구를 찌를 수 있습니다.

---

## 🛠 기술 스택

**Frontend**
- React Native (Expo SDK 54) · TypeScript
- Expo Router · Zustand · react-native-gifted-charts · expo-image-picker

**Backend**
- Supabase (Auth · PostgreSQL · Storage · Edge Functions)
- OpenAI API (일기 본문 생성, 주간 리포트 분석)

---

## 📁 폴더 구조

```
harumukkum/
├── app/                        # Expo Router 파일 기반 라우팅
│   ├── (tabs)/                 # 하단 탭 (홈/캘린더/작성/리포트/친구)
│   │   ├── index.tsx           # 홈
│   │   ├── diary.tsx           # 캘린더
│   │   ├── create.tsx          # 일기 작성
│   │   ├── report.tsx          # 주간 리포트
│   │   └── friends.tsx         # 친구
│   ├── auth/                   # 로그인, 회원가입
│   ├── diary/                  # 일기 상세, 수정
│   ├── friends/                # 친구 관리
│   └── mypage.tsx              # 마이페이지
├── src/
│   ├── api/                    # Supabase API (auth, diary, friends, report)
│   ├── components/             # 공통 UI (Button, Card, Input, Header 등 8개)
│   ├── constants/              # 컬러, 감정(20종), 라우트 상수
│   ├── screens/                # 화면 컴포넌트 (12개)
│   ├── store/                  # Zustand (auth, diary draft)
│   ├── types/                  # 타입 정의 (diary, user, friend, report)
│   └── utils/                  # 날짜, 검증, 일기 유틸
├── supabase/
│   └── functions/              # Edge Functions
│       ├── generate-diary/     # AI 일기 생성
│       ├── generate-weekly-report/  # AI 주간 리포트
│       ├── generate-poster/    # AI 포스터 이미지
│       └── poke-friend/        # 찌르기 알림
└── assets/                     # 앱 아이콘, 스플래시, 이미지
```

---

## 🚀 설치 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env 파일 생성)
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# 3. 실행
npx expo start
```

Expo Go 앱으로 QR 코드 스캔하거나 에뮬레이터에서 실행

---

<!-- ## 📷 화면 TODO: 스크린샷 추가 (홈 / 일기 생성 / 일기 상세 / 주간 리포트 / 친구) -->

<!-- ---

## 👥 팀

| 이름 | 역할 |
|---|---|
|  | 프론트엔드 (types, store, screens) |
|  | 프론트엔드 (constants, utils, components) |
|  | 백엔드 (Supabase, Edge Functions) |
|  | 디자인 (Figma) |

--- -->

## 📄 License

Private project. © 2026 하루묶음 팀.
