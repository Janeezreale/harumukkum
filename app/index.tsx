import { Redirect } from "expo-router";

export default function Index() {
  // TODO: check auth state, redirect to login if not authenticated
  return <Redirect href="/(tabs)" />;
}
