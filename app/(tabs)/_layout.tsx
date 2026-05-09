import { Tabs } from "expo-router";
import { colors } from "@/src/constants/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray500,
        tabBarStyle: {
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "홈" }} />
      <Tabs.Screen name="create" options={{ title: "작성" }} />
      <Tabs.Screen name="library" options={{ title: "서재" }} />
      <Tabs.Screen name="report" options={{ title: "리포트" }} />
    </Tabs>
  );
}
