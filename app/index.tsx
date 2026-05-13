import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Redirect } from "expo-router";
import { getCurrentUser } from "@/src/api/auth";
import { colors } from "@/src/constants/colors";
import { useAuthStore } from "@/src/store/authStore";

export default function Index() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [target, setTarget] = useState<"/(tabs)" | "/auth/login" | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkSession() {
      try {
        const auth = await getCurrentUser();

        if (!isMounted) return;

        if (auth) {
          setAuth(auth);
          setTarget("/(tabs)");
        } else {
          clearAuth();
          setTarget("/auth/login");
        }
      } catch {
        if (!isMounted) return;
        clearAuth();
        setTarget("/auth/login");
      }
    }

    checkSession();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuth]);

  if (target) {
    return <Redirect href={target} />;
  }

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
});
