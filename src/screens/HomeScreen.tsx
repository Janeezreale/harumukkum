import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Header from "@/src/components/Header";
import Card from "@/src/components/Card";
import Button from "@/src/components/Button";
import DiaryCard from "@/src/components/DiaryCard";
import { colors } from "@/src/constants/colors";
import { routes } from "@/src/constants/routes";
import { useDiaryStore } from "@/src/store/diaryStore";

export default function HomeScreen() {
  const diaries = useDiaryStore((state) => state.diaries);
  const latestDiary = diaries[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="오늘의 하루"
        subtitle="키워드로 오늘의 일기를 만들어보세요."
      />

      <Card style={styles.heroCard}>
        <Text style={styles.heroTitle}>오늘 있었던 일을 적어볼까요?</Text>
        <Text style={styles.heroText}>
          짧은 키워드만 입력해도 AI가 일기 초안을 만들어줍니다.
        </Text>
        <Button
          title="AI 일기 만들기"
          onPress={() => router.push(routes.create)}
        />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>최근 일기</Text>
        {latestDiary ? (
          <DiaryCard
            diary={latestDiary}
            onPress={() => router.push(routes.diaryDetail(latestDiary.id))}
          />
        ) : (
          <Card>
            <Text style={styles.emptyText}>아직 작성한 일기가 없습니다.</Text>
          </Card>
        )}
      </View>
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
    gap: 24,
  },
  heroCard: {
    gap: 14,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.black,
  },
  heroText: {
    fontSize: 15,
    color: colors.gray500,
    lineHeight: 22,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.black,
  },
  emptyText: {
    color: colors.gray500,
  },
});
