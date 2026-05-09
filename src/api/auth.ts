import { apiClient } from "./client";
import { User } from "@/src/types/user";

export async function login(email: string, password: string) {
  return apiClient<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
