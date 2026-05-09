import { ScrollView, StyleSheet, Text } from "react-native";
import { router } from "expo-router";
import Header from "@/src/components/Header";
import DiaryCard from "@/src/components/DiaryCard";
import Card from "@/src/components/Card";
import { colors } from "@/src/constants/colors";
import { routes } from "@/src/constants/routes";
import { useDiaryStore } from "@/src/store/diaryStore";

export default function LibraryScreen() {
  const diaries = useDiaryStore((state) => state.diaries);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header
        title="나의 서재"
        subtitle="내가 작성한 일기를 모아볼 수 있어요."
      />

      {diaries.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>저장된 일기가 없습니다.</Text>
        </Card>
      ) : (
        diaries.map((diary) => (
          <DiaryCard
            key={diary.id}
            diary={diary}
            onPress={() => router.push(routes.diaryDetail(diary.id))}
          />
        ))
      )}
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
  emptyText: {
    color: colors.gray500,
  },
});
