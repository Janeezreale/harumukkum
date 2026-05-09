import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import Header from "@/src/components/Header";
import Card from "@/src/components/Card";
import MoodBadge from "@/src/components/MoodBadge";
import KeywordChip from "@/src/components/KeywordChip";
import { colors } from "@/src/constants/colors";
import { useDiaryStore } from "@/src/store/diaryStore";

export default function DiaryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const diary = useDiaryStore((state) =>
    state.diaries.find((item) => item.id === id),
  );

  if (!diary) {
    return (
      <View style={styles.center}>
        <Text>일기를 찾을 수 없습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title={diary.title} subtitle={diary.date} />

      <Card style={styles.card}>
        <MoodBadge mood={diary.mood} />

        <Text style={styles.contentText}>{diary.content}</Text>

        <View style={styles.chipWrap}>
          {diary.keywords.map((keyword) => (
            <KeywordChip key={keyword} label={keyword} />
          ))}
        </View>
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
  },
  card: {
    gap: 18,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 26,
    color: colors.gray700,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
