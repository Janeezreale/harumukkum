import { Redirect } from "expo-router";

// export default function Index() {
//   return <Redirect href="/auth/login" />;
// }

import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function Index() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>하루묶음</Text>
      <Text style={styles.subtitle}>앱 시작 화면입니다.</Text>

      <Link href="/auth/login" style={styles.link}>
        로그인 화면으로 가기
      </Link>

      <Link href="/(tabs)" style={styles.link}>
        메인 탭 화면으로 가기
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    color: "#666666",
  },
  link: {
    fontSize: 18,
    marginBottom: 16,
    color: "#7C121C",
    fontWeight: "600",
  },
});