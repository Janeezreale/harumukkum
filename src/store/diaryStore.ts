import { create } from 'zustand';
import { getTodayDate } from '../utils/date';
import type { DiaryAnswer } from '../types/diary';

type DiaryState = {
  selectedDate: string;
  draftAnswer: Partial<DiaryAnswer>;
  draftPhotoUri: string | null;
  setSelectedDate: (date: string) => void;
  setDraftAnswer: (patch: Partial<DiaryAnswer>) => void;
  setDraftPhoto: (uri: string | null) => void;
  resetDraft: () => void;
};

export const useDiaryStore = create<DiaryState>((set) => ({
  selectedDate: getTodayDate(),
  draftAnswer: {},
  draftPhotoUri: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  setDraftAnswer: (patch) =>
    set((state) => ({ draftAnswer: { ...state.draftAnswer, ...patch } })),
  setDraftPhoto: (uri) => set({ draftPhotoUri: uri }),
  resetDraft: () => set({ draftAnswer: {}, draftPhotoUri: null }),
}));
