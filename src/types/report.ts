import type { DiaryEmotion } from './diary';
export type ReportInsight = {
  type: 'increase' | 'decrease' | 'neutral';
  title: string;
  delta_percent: number;
};
export type EmotionStoryPoint = {
  date: string;
  emotion: DiaryEmotion;
  intensity: number;
};
export type WeeklyReport = {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  insights: ReportInsight[];
  emotion_story: EmotionStoryPoint[];
  keywords: string[];
  poster_url: string | null;
  reflection_tip: string;
  created_at: string;
};
