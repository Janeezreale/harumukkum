export type MoodType = "happy" | "sad" | "calm" | "angry" | "tired" | "neutral";

export type Diary = {
  id: string;
  date: string;
  title: string;
  content: string;
  keywords: string[];
  mood: MoodType;
  moodScore: number;
  createdAt: string;
};
