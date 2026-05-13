import { create } from 'zustand';
import type { User } from '../types/user';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  setAuth: (payload: { user: User; session: Session | null }) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoggedIn: false,
  setAuth: ({ user, session }) =>
    set({ user, session, isLoggedIn: true }),
  clearAuth: () =>
    set({ user: null, session: null, isLoggedIn: false }),
}));
