import type { DiaryAnswer } from '../types/diary';

export function validateDiaryAnswer(draft: Partial<DiaryAnswer>): string | null {
  if (!draft.emotion) return '오늘 감정을 선택해주세요.';
  if (!draft.what_text?.trim()) return '무슨 일이 있었는지 입력해주세요.';
  if (!draft.who_text?.trim()) return '누구와 있었는지 입력해주세요.';
  if (!draft.when_text?.trim()) return '언제였는지 입력해주세요.';
  if (!draft.where_text?.trim()) return '어디서였는지 입력해주세요.';
  if (!draft.why_text?.trim()) return '왜 그랬는지 입력해주세요.';
  return null;
}
