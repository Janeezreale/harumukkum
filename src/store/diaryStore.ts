import { create } from "zustand";
import { Diary, MoodType } from "@/src/types/diary";
import { getTodayText } from "@/src/utils/date";

type CreateDiaryInput = {
  title: string;
  content: string;
  keywords: string[];
  mood: MoodType;
  moodScore: number;
};

type DiaryState = {
  diaries: Diary[];
  addDiary: (input: CreateDiaryInput) => Diary;
};

export const useDiaryStore = create<DiaryState>((set, get) => ({
  diaries: [],

  addDiary: (input) => {
    const diary: Diary = {
      id: Date.now().toString(),
      date: getTodayText(),
      title: input.title,
      content: input.content,
      keywords: input.keywords,
      mood: input.mood,
      moodScore: input.moodScore,
      createdAt: new Date().toISOString(),
    };

    set({
      diaries: [diary, ...get().diaries],
    });

    return diary;
  },
}));
