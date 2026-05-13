import { supabase } from "./supabase";

// 유저 검색
export async function searchUsers(keyword: string) {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      id,
      username,
      nickname,
      profile_image_url
    `,
    )
    .ilike("username", `%${keyword}%`)
    .limit(20);

  if (error) throw error;

  return data;
}

// 친구 요청
export async function sendFriendRequest(receiverId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  const { error } = await supabase.from("friendships").insert({
    requester_id: user.id,
    receiver_id: receiverId,
    status: "pending",
  });

  if (error) throw error;
}

// 친구 목록
export async function getFriends() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("friendships")
    .select(
      `
      *,
      receiver:receiver_id (
        id,
        username,
        nickname,
        profile_image_url
      )
    `,
    )
    .eq("requester_id", user.id)
    .eq("status", "accepted");

  if (error) throw error;

  return data;
}

// 찌르기
export async function pokeFriend(receiverId: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const response = await fetch(
    `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/poke-friend`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receiverId,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error);
  }

  return result;
}
