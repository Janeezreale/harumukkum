import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="diary/[date]" />
      <Stack.Screen name="diary/edit/[id]" />
    </Stack>
  );
}

// <Stack.Screen name="auth/login" />
