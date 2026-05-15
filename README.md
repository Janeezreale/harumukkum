# 📔 하루묶음 (Harumukkum)

![Expo](https://img.shields.io/badge/Expo-54-000020?logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase&logoColor=white)

> **"오늘 하루를 단 3분 만에, 한 편의 이야기로."**

평소 일기를 쓰지 않는 사람들을 위해 만들었습니다.
육하원칙 키워드만 입력하면 AI가 당신의 하루를 한 편의 일기로 엮어줍니다.

---

## 🧐 왜 만들었나

사용자가 일기를 쓰지 않는 이유 — 우리가 찾은 답:

- 글 쓰기 자체가 귀찮다
- 일상이 단조로워 특별할 게 없다고 느낀다
- 다이어리 꾸미기를 잘 못해서 시도조차 안 한다

**하루묶음은 "쓰는 일기"에서 "엮어주는 일기"로 패러다임을 바꿉니다.**
사용자는 키워드만 던지면 됩니다. AI가 본문의 대부분을 채워주고, 사용자는 다듬기만 하면 됩니다.

---

## 🤖 주요 기능

| 기능 | 설명 |
|---|---|
| **AI 일기 자동 생성** | 육하원칙(언제/어디서/누구와/무엇을/감정/왜) 입력 → AI가 본문 생성, 사용자 수정 가능 |
| **주간 리포트** | 감정 추이 그래프, 키워드 TOP 5, AI 인사이트, Reflection Tip |
| **친구 공유 + 찌르기** | 친구 일기 카드형 피드, 일기 안 쓴 친구에게 찌르기 알림 |
| **캘린더형 일기 목록** | 월별 그리드, 일기 있는 날은 사진 썸네일로 한눈에 |
| **마이페이지** | 프로필 사진 변경, 닉네임 수정, 로그아웃 |

---

## 🛠 기술 스택

**Frontend**
- React Native (Expo SDK 54) · TypeScript
- Expo Router · Zustand · react-native-gifted-charts · expo-image-picker

**Backend**
- Supabase (Auth · PostgreSQL · Storage · Edge Functions)
- OpenAI API (일기 본문 생성, 주간 리포트 분석, 포스터 이미지 생성)

---

## 📁 폴더 구조

```
harumukkum/
├── app/                    # Expo Router 파일 기반 라우팅
│   ├── (tabs)/             # 하단 탭 (홈/캘린더/작성/리포트/친구)
│   ├── auth/               # 로그인, 회원가입
│   ├── diary/              # 일기 상세, 수정
│   └── friends/            # 친구 관리
├── src/
│   ├── api/                # Supabase API (auth, diary, friends, report)
│   ├── components/         # 공통 UI 컴포넌트 (Button, Card, Input 등)
│   ├── constants/          # 컬러, 감정, 라우트 상수
│   ├── screens/            # 화면 컴포넌트 (12개)
│   ├── store/              # Zustand (auth, diary draft)
│   ├── types/              # 타입 정의
│   └── utils/              # 날짜, 검증 유틸
├── supabase/
│   └── functions/          # Edge Functions (일기 생성, 리포트, 포스터, 찌르기)
└── assets/                 # 이미지, 아이콘
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

Expo Go 앱으로 QR 코드 스캔하거나 에뮬레이터에서 실행.

---

## 📊 개발 진행 상황

| 영역 | 상태 |
|---|---|
| 로그인 / 회원가입 (Supabase Auth) | ✅ 완료 |
| AI 일기 생성 (4단계 질문 → Edge Function) | ✅ 완료 |
| 일기 상세 / 수정 / 삭제 | ✅ 완료 |
| 캘린더 (월별 조회, 사진 동기화, 월 이동) | ✅ 완료 |
| 주간 리포트 (AI 분석, 차트, 키워드) | ✅ 완료 |
| 친구 추가 / 요청 수락·거절 / 찌르기 | ✅ 완료 |
| 친구 일기 피드 (공개 일기) | ✅ 완료 |
| 마이페이지 (프로필 수정, 로그아웃) | ✅ 완료 |
| 사진 업로드 (Supabase Storage) | ✅ 완료 |
| Supabase Edge Functions (AI 일기/리포트/포스터/찌르기) | ✅ 완료 |
| 디자인 시스템 (Figma → 코드 반영) | ✅ 완료 |
| 푸시 알림 | 🔲 예정 |
| 포스터 이미지 화면 표시 | 🔲 예정 |

---

## 📷 화면

<!-- TODO: 스크린샷 추가 (홈 / 일기 생성 / 일기 상세 / 주간 리포트 / 친구) -->

---

## 👥 팀

<!-- TODO: 이름 채우기 -->

| 이름 | 역할 |
|---|---|
|  | 프론트엔드 (types, store, screens) |
|  | 프론트엔드 (constants, utils, components) |
|  | 백엔드 (Supabase, Edge Functions) |
|  | 디자인 (Figma) |

---

## 📄 License

Private project. © 2026 하루묶음 팀.
