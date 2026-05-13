export type DiaryEmotion =
  | 'happy'
  | 'sad'
  | 'calm'
  | 'tired'
  | 'angry'
  | 'excited'
  | 'anxious'
  | 'grateful';
export type Diary = {
  id: string;
  user_id: string;
  diary_date: string;
  when_text: string;
  where_text: string;
  who_text: string;
  what_text: string;
  emotion: DiaryEmotion;
  why_text: string;
  body: string;
  photo_url: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};
export type DiaryAnswer = {
  when_text: string;
  where_text: string;
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
