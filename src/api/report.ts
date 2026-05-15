import { supabase } from "./supabase";

function parseJsonResponse<T>(text: string): T {
  if (!text) return {} as T;

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("서버 응답을 읽지 못했습니다.");
  }
}

// 주간 리포트 생성
export async function generateWeeklyReport(weekStart: string, weekEnd: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-weekly-report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weekStart,
        weekEnd,
      }),
    },
  );

  const responseText = await response.text();
  const result = parseJsonResponse<{ report?: unknown; error?: string }>(responseText);

  if (!response.ok) {
    throw new Error(result.error ?? `주간 리포트 생성에 실패했습니다. (${response.status})`);
  }

  if (!result.report) {
    throw new Error("주간 리포트 생성 응답에 report 데이터가 없습니다.");
  }

  return result.report;
}

// 리포트 목록
export async function getWeeklyReports() {
  const { data, error } = await supabase
    .from("weekly_reports")
    .select("*")
    .order("week_start", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

// 포스터 생성
export async function generatePoster(reportId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-poster`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
      }),
    },
  );

  const responseText = await response.text();
  const result = parseJsonResponse<{ posterImageUrl?: string; error?: string }>(responseText);

  if (!response.ok) {
    throw new Error(result.error ?? `포스터 생성에 실패했습니다. (${response.status})`);
  }

  return result.posterImageUrl;
}
