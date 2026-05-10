import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="diary" options={{ title: "일기" }} />
      <Tabs.Screen name="create" options={{ title: "작성" }} />
      <Tabs.Screen name="report" options={{ title: "리포트" }} />
      <Tabs.Screen name="friends" options={{ title: "친구" }} />
    </Tabs>
  );
}
