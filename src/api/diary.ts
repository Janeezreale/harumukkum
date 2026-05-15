import { supabase } from "./supabase";
import type { Diary } from "../types/diary";

export type GenerateDiaryParams = {
  diaryDate: string;

  whenText?: string;
  whereText?: string;
  withWhomText: string;
  whatText: string;

  emotion: string;
  reasonText: string;

  imageUrls?: string[];
};

// 일기 생성
export async function generateDiary(params: GenerateDiaryParams) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-diary`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
  );

  const responseText = await response.text();
  let result: { diary?: Diary; error?: string } = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    throw new Error(`일기 생성 응답을 읽지 못했습니다. (${response.status})`);
  }

  if (!response.ok) {
    throw new Error(result.error ?? `일기 생성에 실패했습니다. (${response.status})`);
  }

  if (!result.diary) {
    throw new Error("일기 생성 응답에 diary 데이터가 없습니다.");
  }

  return result.diary;
}

// 일기 목록 조회
// 내 일기 목록 조회
export async function getMyDiaries() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("diaries")
    .select("*")
    .eq("user_id", user.id)
    .order("diary_date", {
      ascending: false,
    });

  if (error) throw error;

  return data;
}

// 날짜별 조회
// 내 날짜별 일기 조회
export async function getDiaryByDate(diaryDate: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { data, error } = await supabase
    .from("diaries")
    .select(
      `
      *,
      diary_images (
        image_url
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("diary_date", diaryDate)
    .single();

  if (error) throw error;

  return data;
}

export async function getDiaryById(diaryId: string) {
  const { data, error } = await supabase
    .from("diaries")
    .select(
      `
      *,
      diary_images (
        image_url
      )
    `,
    )
    .eq("id", diaryId)
    .single();

  if (error) throw error;

  return data as Diary;
}

type UpdateDiaryPatch = Pick<Partial<Diary>, "title" | "content" | "is_public">;

// 일기 수정
export async function updateDiary(diaryId: string, patch: UpdateDiaryPatch): Promise<void> {
  const { error } = await supabase
    .from("diaries")
    .update({
      ...patch,
      updated_at: new Date().toISOString(),
    })
    .eq("id", diaryId);

  if (error) throw error;
}

// 일기 삭제
export async function deleteDiary(diaryId: string) {
  // Supabase should cascade diary_images by diary_id, or orphaned image rows can remain.
  // If there is no FK cascade in the DB, add it there instead of trying to fake a client transaction.
  const { error } = await supabase.from("diaries").delete().eq("id", diaryId);

  if (error) throw error;
}

// 이미지 업로드
export async function uploadDiaryImage(uri: string) {
  const fileName = `${Date.now()}.jpg`;

  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from("diary-images")
    .upload(fileName, blob);

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from("diary-images")
    .getPublicUrl(data.path);

  return publicUrl.publicUrl;
}
