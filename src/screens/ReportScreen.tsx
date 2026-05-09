import { ScrollView, StyleSheet, Text } from "react-native";
import Header from "@/src/components/Header";
import Card from "@/src/components/Card";
import { colors } from "@/src/constants/colors";
import { useDiaryStore } from "@/src/store/diaryStore";

export default function ReportScreen() {
  const diaries = useDiaryStore((state) => state.diaries);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="주간 리포트"
        subtitle="이번 주 감정과 키워드를 확인해보세요."
      />

      <Card style={styles.card}>
        <Text style={styles.label}>작성한 일기</Text>
        <Text style={styles.value}>{diaries.length}개</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>주요 감정</Text>
        <Text style={styles.value}>보통</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.label}>AI 인사이트</Text>
        <Text style={styles.description}>
          아직 데이터가 부족합니다. 일기를 더 작성하면 감정 흐름을 분석할 수
          있습니다.
        </Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 64,
    gap: 14,
  },
  card: {
    gap: 8,
  },
  label: {
    color: colors.gray500,
    fontWeight: "700",
  },
  value: {
    color: colors.black,
    fontSize: 28,
    fontWeight: "900",
  },
  description: {
    color: colors.gray700,
    lineHeight: 22,
  },
});
