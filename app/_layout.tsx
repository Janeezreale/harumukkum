import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/signup" />
      <Stack.Screen name="diary/[id]" />
      <Stack.Screen name="diary/edit/[id]" />
      <Stack.Screen name="diary/calendar" />
    </Stack>
  );
}
