export const routes = {
  home: "/(tabs)",
  diary: "/(tabs)/diary",
  create: "/(tabs)/create",
  report: "/(tabs)/report",
  friends: "/(tabs)/friends",
  login: "/auth/login",
  diaryDetail: (date: string) => `/diary/${date}`,
  diaryEdit: (id: string) => `/diary/edit/${id}`,
} as const;
