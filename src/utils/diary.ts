import type { Diary } from '../types/diary';

export function getDiaryTitle(diary: Diary): string {
  return diary.title || '오늘의 일기';
}

export function getDiaryContent(diary: Diary, fallback = ''): string {
  return diary.content || diary.body || fallback;
}
