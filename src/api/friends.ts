import { supabase } from "./supabase";

type FriendProfile = {
  id: string;
  username: string;
  nickname: string;
  profile_image_url: string | null;
};

type FriendshipRow = {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  created_at: string;
  requester: FriendProfile | FriendProfile[] | null;
  receiver: FriendProfile | FriendProfile[] | null;
};

export type FriendRequest = {
  id: string;
  requester: FriendProfile;
  created_at: string;
};

export type FriendListItem = {
  friendship_id: string;
  friend: FriendProfile;
  created_at: string;
};

function normalizeRelation<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value;
}

async function getAuthenticatedUserId() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("로그인이 필요합니다.");
  }

  return user.id;
}

function getKoreaTodayString() {
  return new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
}

// 유저 검색
export async function searchUsers(keyword: string) {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("users")
    .select("id, username, nickname, profile_image_url")
    .ilike("username", `%${keyword}%`)
    .neq("id", userId)
    .limit(20);

  if (error) throw error;

  return data ?? [];
}

// 받은 친구 요청 목록
export async function getReceivedFriendRequests(): Promise<FriendRequest[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      created_at,
      requester:requester_id (
        id,
        username,
        nickname,
        profile_image_url
      )
    `
    )
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FriendshipRow[])
    .map((request) => {
      const requester = normalizeRelation(request.requester);

      if (!requester) return null;

      return {
        id: request.id,
        requester,
        created_at: request.created_at,
      };
    })
    .filter((request): request is FriendRequest => request !== null);
}

// 친구 요청 수락
export async function acceptFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}

// 친구 요청 거절
export async function rejectFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", requestId)
    .eq("receiver_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}

// 친구 요청
export async function sendFriendRequest(receiverId: string) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase.from("friendships").insert({
    requester_id: userId,
    receiver_id: receiverId,
    status: "pending",
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("이미 친구 요청을 보냈거나 친구 관계입니다.");
    }

    throw error;
  }
}

// 보낸 친구 요청 목록
export type SentFriendRequest = {
  id: string;
  receiver: FriendProfile;
  created_at: string;
};

export async function getSentFriendRequests(): Promise<SentFriendRequest[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      id,
      created_at,
      receiver:receiver_id (
        id,
        username,
        nickname,
        profile_image_url
      )
    `
    )
    .eq("requester_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FriendshipRow[])
    .map((row) => {
      const receiver = normalizeRelation(row.receiver);

      if (!receiver) return null;

      return {
        id: row.id,
        receiver,
        created_at: row.created_at,
      };
    })
    .filter((request): request is SentFriendRequest => request !== null);
}

// 보낸 친구 요청 취소
export async function cancelFriendRequest(requestId: string) {
  const userId = await getAuthenticatedUserId();

  const { error } = await supabase
    .from("friendships")
    .delete()
    .eq("id", requestId)
    .eq("requester_id", userId)
    .eq("status", "pending");

  if (error) throw error;
}

// 친구 목록
export async function getFriends(): Promise<FriendListItem[]> {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      requester:requester_id (
        id,
        username,
        nickname,
        profile_image_url
      ),
      receiver:receiver_id (
        id,
        username,
        nickname,
        profile_image_url
      )
    `
    )
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return ((data ?? []) as FriendshipRow[])
    .map((friendship) => {
      const requester = normalizeRelation(friendship.requester);
      const receiver = normalizeRelation(friendship.receiver);
      const friend = friendship.requester_id === userId ? receiver : requester;

      if (!friend) return null;

      return {
        friendship_id: friendship.id,
        friend,
        created_at: friendship.created_at,
      };
    })
    .filter((friend): friend is FriendListItem => friend !== null);
}

// 친구 일기 피드
export type FriendDiaryItem = {
  id: string;
  diary_date: string;
  title: string | null;
  content: string | null;
  emotion: string | null;
  thumbnail_url: string | null;
  created_at: string;
  author: {
    id: string;
    nickname: string;
    username: string;
    profile_image_url: string | null;
  };
};

export async function getFriendDiaries(): Promise<FriendDiaryItem[]> {
  const userId = await getAuthenticatedUserId();

  const { data: friendships, error: friendsError } = await supabase
    .from("friendships")
    .select("requester_id, receiver_id")
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
    .eq("status", "accepted");

  if (friendsError) throw friendsError;

  if (!friendships || friendships.length === 0) {
    return [];
  }

  const friendIds = friendships.map((friendship) =>
    friendship.requester_id === userId
      ? friendship.receiver_id
      : friendship.requester_id
  );

  const { data, error } = await supabase
    .from("diaries")
    .select(
      `
      id,
      diary_date,
      title,
      content,
      emotion,
      thumbnail_url,
      created_at,
      author:user_id (
        id,
        nickname,
        username,
        profile_image_url
      )
    `
    )
    .in("user_id", friendIds)
    .eq("is_public", true)
    .order("diary_date", { ascending: false })
    .limit(50);

  if (error) throw error;

  return ((data ?? []) as any[]).map((item) => ({
    ...item,
    author: Array.isArray(item.author) ? item.author[0] : item.author,
  })) as FriendDiaryItem[];
}

// 오늘 찌른 친구 ID 목록
export async function getTodayPokedFriendIds(): Promise<string[]> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/poke-friend`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const responseText = await response.text();
  const result: { error?: string; pokedFriendIds?: string[] } = responseText
    ? JSON.parse(responseText)
    : {};

  if (!response.ok) {
    throw new Error(result.error ?? "오늘 찌른 친구 목록을 불러오지 못했습니다.");
  }

  return result.pokedFriendIds ?? [];
}

// 찌르기
export async function pokeFriend(receiverId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("로그인이 필요합니다.");
  }

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/poke-friend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
      }),
    }
  );

  const responseText = await response.text();
  const result: { error?: string; receiverId?: string } = responseText
    ? JSON.parse(responseText)
    : {};

  if (!response.ok) {
    throw new Error(result.error ?? "친구 찌르기에 실패했습니다.");
  }

  return {
    ...result,
    receiverId,
  };
}