# 리포트 화면 — 데이터 없을 때 빈 구조 표시 구현 계획

## 목표
일기가 한 건도 없는 신규 유저에게 리포트 화면의 **섹션 구조는 그대로 보여주되**,
실제 데이터 자리는 빈칸(플레이스홀더)으로 표시한다.

---

## 현재 상태 파악

| 항목 | 내용 |
|------|------|
| 화면 파일 | `src/screens/ReportScreen.tsx` |
| 데이터 소스 | 현재 `mockReport` 하드코딩 객체 (API 미연결) |
| API 함수 | `src/api/report.ts` — `getWeeklyReports()` 존재 |
| 타입 | `src/types/report.ts` — `WeeklyReport` 정의 |
| 섹션 구성 | Magazine Header / Emotion Storyline / Keyword TOP 5 / Reflection Tip / View Full Report 버튼 |

---

## 구현 단계

### Step 1 — ReportScreen에 데이터 로딩 로직 추가
- `useEffect` + `useState`로 `getWeeklyReports()` 호출
- 상태: `report: WeeklyReport | null`, `isLoading: boolean`
- 로딩 중엔 `ActivityIndicator` 표시

### Step 2 — `report === null`일 때 빈 구조 렌더링

각 섹션별 처리:

| 섹션 | 데이터 있을 때 | 데이터 없을 때 |
|------|--------------|--------------|
| **Magazine Header** | VOL·날짜·인용구·히어로 이미지 표시 | VOL·날짜 자리 `—` / 인용구 자리 회색 placeholder 박스 / 이미지 자리 회색 빈 박스 |
| **Emotion Storyline** | LineChart 렌더링 | 차트 자리 회색 빈 박스 + "일기를 작성하면 감정 흐름을 볼 수 있어요" 안내 텍스트 |
| **Keyword TOP 5** | 키워드 리스트 | 5개 행 자리 모두 회색 바(skeleton) |
| **Reflection Tip** | AI 코멘트 텍스트 | "일기가 쌓이면 AI가 인사이트를 드려요" 안내 텍스트 |
| **View Full Report 버튼** | 활성 | `disabled` 처리 + opacity 낮춤 |

### Step 3 — 빈 구조 스타일 추가
```
emptyBox        — 회색 둥근 사각형 placeholder
emptyText       — 회색 안내 문구 (fontSize 13)
skeletonBar     — 키워드 행 대체용 회색 바
```

---

## 파일 수정 범위

| 파일 | 변경 내용 |
|------|---------|
| `src/screens/ReportScreen.tsx` | mockReport 제거, API 연결, 빈 상태 분기 렌더링 추가 |

> `src/api/report.ts`, `src/types/report.ts`는 수정 없음.

---

## 확인 사항 (구현 전 판단 필요)
- `getWeeklyReports()`는 배열 반환 → 가장 최신 리포트 1건(`data[0]`)을 사용할 것인지 확인
- `LineChart` 라이브러리(`react-native-gifted-charts`)가 빈 데이터 배열 전달 시 크래시 여부 → 빈 상태엔 차트 자체를 미렌더링 처리
