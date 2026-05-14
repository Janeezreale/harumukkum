import type { EmotionId } from '../constants/emotions';

export type DiaryEmotion =
  | EmotionId;

export type Diary = {
  id: string;
  user_id: string;
  diary_date: string;
  when_text?: string | null;
  where_text?: string | null;
  with_whom_text?: string | null;
  who_text?: string | null;
  what_text: string;
  emotion: DiaryEmotion;
  reason_text?: string | null;
  why_text?: string | null;
  title?: string | null;
  content?: string | null;
  body?: string | null;
  thumbnail_url?: string | null;
  photo_url?: string | null;
  is_public?: boolean;
  created_at: string;
  updated_at: string;
};
export type DiaryAnswer = {
  when_text?: string;
  where_text?: string;
  who_text: string;
  what_text: string;
  emotion: DiaryEmotion;
  why_text: string;
};
export type DiaryCreateInput = DiaryAnswer & {
  diary_date: string;
  photo_url?: string | null;
  is_public?: boolean;
};
