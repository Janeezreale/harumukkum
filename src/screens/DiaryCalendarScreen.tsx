import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

export default function DiaryCalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>내 일기 목록</Text>
      <Text style={styles.subtitle}>라우팅 테스트용 일기입니다.</Text>

      <Link href="/diary/1" style={styles.link}>
        1번 일기 상세 보기
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
    color: "#666666",
    marginBottom: 32,
  },
  link: {
    fontSize: 18,
    color: "#7C121C",
    fontWeight: "600",
  },
});
