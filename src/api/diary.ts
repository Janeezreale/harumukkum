import { apiClient } from "./client";
import { Diary } from "@/src/types/diary";

export async function generateDiary(keywords: string[]) {
  return apiClient<Diary>("/diaries/generate", {
    method: "POST",
    body: JSON.stringify({ keywords }),
  });
}

export async function getDiaries() {
  return apiClient<Diary[]>("/diaries");
}

export async function getDiary(id: string) {
  return apiClient<Diary>(`/diaries/${id}`);
}
