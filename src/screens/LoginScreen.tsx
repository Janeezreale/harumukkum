import { StyleSheet, Text, View } from "react-native";
import Button from "@/src/components/Button";
import { colors } from "@/src/constants/colors";
import { useAuthStore } from "@/src/store/authStore";
import { router } from "expo-router";

export default function LoginScreen() {
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    login({
      id: "1",
      name: "사용자",
      email: "user@example.com",
    });

    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Diary</Text>
      <Text style={styles.subtitle}>하루를 기록하고 감정을 분석하세요.</Text>
      <Button title="시작하기" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
    gap: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    color: colors.black,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray500,
    marginBottom: 24,
  },
});
