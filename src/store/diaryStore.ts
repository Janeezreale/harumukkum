import { create } from 'zustand';
import { getTodayDate } from '../utils/date';
import type { Diary, DiaryAnswer } from '../types/diary';

type DiaryState = {
  selectedDate: string;
  draftAnswer: Partial<DiaryAnswer>;
  draftPhotoUri: string | null;
  lastGeneratedDiary: Diary | null;

  setSelectedDate: (date: string) => void;
  setDraftAnswer: (patch: Partial<DiaryAnswer>) => void;
  setDraftPhotoUri: (uri: string | null) => void;
  setLastGeneratedDiary: (diary: Diary | null) => void;
  resetDraft: () => void;
};

export const useDiaryStore = create<DiaryState>((set) => ({
  selectedDate: getTodayDate(),
  draftAnswer: {},
  draftPhotoUri: null,
  lastGeneratedDiary: null,

  setSelectedDate: (date) => set({ selectedDate: date }),

  setDraftAnswer: (patch) =>
    set((state) => ({
      draftAnswer: {
        ...state.draftAnswer,
        ...patch,
      },
    })),

  setDraftPhotoUri: (uri) =>
    set({
      draftPhotoUri: uri,
    }),

  setLastGeneratedDiary: (diary) =>
    set({
      lastGeneratedDiary: diary,
    }),

  resetDraft: () =>
    set({
      draftAnswer: {},
      draftPhotoUri: null,
    }),
}));