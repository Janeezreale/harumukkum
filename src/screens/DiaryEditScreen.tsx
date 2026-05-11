import { Link } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

type DiaryEditScreenProps = {
  id: string;
};

export default function DiaryEditScreen({ id }: DiaryEditScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>일기 수정 화면</Text>
      <Text style={styles.subtitle}>수정할 일기 ID: {id}</Text>

      <Link href={`/diary/${id}`} style={styles.link}>
        상세 화면으로 돌아가기
      </Link>

      <Link href="/(tabs)/diary" style={styles.backLink}>
        일기 목록으로 돌아가기
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
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    color: "#666666",
  },
});
