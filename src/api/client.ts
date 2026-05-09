const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function apiClient<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error("API 요청에 실패했습니다.");
  }

  return response.json();
}
