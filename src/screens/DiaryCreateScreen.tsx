import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import Header from "@/src/components/Header";
import Input from "@/src/components/Input";
import Button from "@/src/components/Button";
import KeywordChip from "@/src/components/KeywordChip";
import Card from "@/src/components/Card";
import { colors } from "@/src/constants/colors";
import { useDiaryStore } from "@/src/store/diaryStore";

export default function DiaryCreateScreen() {
  const [keyword, setKeyword] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const addDiary = useDiaryStore((state) => state.addDiary);

  const addKeyword = () => {
    const trimmed = keyword.trim();

    if (!trimmed) return;
    if (keywords.includes(trimmed)) return;

    setKeywords((prev) => [...prev, trimmed]);
    setKeyword("");
  };

  const createDiary = () => {
    const diary = addDiary({
      title: "AI가 만든 오늘의 일기",
      content: `오늘은 ${keywords.join(", ")}이 기억에 남는 하루였다. 작은 순간들이 모여 나만의 하루가 되었다.`,
      keywords,
      mood: "neutral",
      moodScore: 60,
    });

    router.push(`/diary/${diary.id}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Header title="AI 일기 작성" subtitle="오늘의 키워드를 입력해주세요." />

      <Card style={styles.card}>
        <Text style={styles.label}>오늘의 키워드</Text>

        <View style={styles.inputRow}>
          <Input
            value={keyword}
            onChangeText={setKeyword}
            placeholder="예: 카페, 산책, 피곤함"
            onSubmitEditing={addKeyword}
          />
          <Button title="추가" onPress={addKeyword} />
        </View>

        <View style={styles.chipWrap}>
          {keywords.map((item) => (
            <KeywordChip
              key={item}
              label={item}
              onPress={() =>
                setKeywords((prev) => prev.filter((v) => v !== item))
              }
            />
          ))}
        </View>
      </Card>

      <Button
        title="일기 생성하기"
        disabled={keywords.length === 0}
        onPress={createDiary}
      />
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
    gap: 20,
  },
  card: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.black,
  },
  inputRow: {
    gap: 10,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
});
