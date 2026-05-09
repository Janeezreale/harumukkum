export const routes = {
  home: "/(tabs)",
  create: "/(tabs)/create",
  library: "/(tabs)/library",
  report: "/(tabs)/report",
  login: "/auth/login",
  diaryDetail: (id: string) => `/diary/${id}`,
};
