import { supabase } from "./supabase";

type SignUpParams = {
  email: string;
  password: string;
  username: string;
  nickname: string;
};

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

  return data;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
