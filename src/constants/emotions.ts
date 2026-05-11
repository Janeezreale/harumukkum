import type { DiaryEmotion } from '../types/diary';

export type EmotionOption = {
  value: DiaryEmotion;
  emoji: string;
  label: string;
};

export const EMOTION_OPTIONS: EmotionOption[] = [
  { value: 'sad', emoji: '😢', label: '슬픔' },
  { value: 'tired', emoji: '😐', label: '피곤' },
  { value: 'calm', emoji: '🙂', label: '평온' },
  { value: 'happy', emoji: '😊', label: '행복' },
  { value: 'excited', emoji: '😍', label: '설렘' },
];
