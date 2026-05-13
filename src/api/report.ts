import { supabase } from "./supabase";

// 주간 리포트 생성
export async function generateWeeklyReport(weekStart: string, weekEnd: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-weekly-report`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        weekStart,
        weekEnd,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
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

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-poster`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reportId,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }

  return result.posterImageUrl;
}
