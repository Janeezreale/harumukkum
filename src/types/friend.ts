import type { Diary } from './diary';
export type FriendshipStatus = 'pending' | 'accepted' | 'blocked';
export type Friend = {
  id: string;
  user_id: string;
  friend_id: string;
  friend_nickname: string;
  friend_profile_image_url: string | null;
  status: FriendshipStatus;
  created_at: string;
};
export type FriendDiary = {
  diary: Diary;
  author: {
    id: string;
    nickname: string;
    profile_image_url: string | null;
  };
};
export type Poke = {
  id: string;
  from_user_id: string;
  to_user_id: string;
  poke_date: string;
  created_at: string;
};
export type PokeStatus = {
  friend_id: string;
  can_poke_today: boolean;
  last_poked_at: string | null;
};
