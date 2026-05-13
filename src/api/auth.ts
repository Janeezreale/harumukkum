import { supabase } from "./supabase";
import type { User } from "../types/user";

type SignUpParams = {
  email: string;
  password: string;
  username: string;
  nickname: string;
};

export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, username, nickname, profile_image_url, created_at")
    .eq("id", userId)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    email: data.email,
    username: data.username,
    nickname: data.nickname,
    profile_image_url: data.profile_image_url ?? null,
    created_at: data.created_at ?? null,
  };
}

export async function signUp(params: SignUpParams) {
  const { email, password, username, nickname } = params;

  // 1. username 중복 확인
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingUser) {
    throw new Error("이미 사용 중인 아이디입니다.");
  }

  // 2. auth 회원가입
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  const userId = data.user?.id;

  if (!userId) {
    throw new Error("회원가입 실패");
  }

  // 3. users insert
  const { error: profileError } = await supabase.from("users").insert({
    id: userId,
    email,
    username,
    nickname,
  });

  if (profileError) throw profileError;

  const profile = await getUserProfile(userId);

  return {
    user: profile,
    session: data.session,
  };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  if (!data.user) {
    throw new Error("로그인 실패");
  }

  const profile = await getUserProfile(data.user.id);

  return {
    user: profile,
    session: data.session,
  };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return null;
  }

  const user = await getUserProfile(session.user.id);

  return {
    user,
    session,
  };
}
