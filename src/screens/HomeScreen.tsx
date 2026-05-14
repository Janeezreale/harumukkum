import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useCallback, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getMyDiaries } from "../api/diary";
import type { Diary } from "../types/diary";

function getLocalDateString() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function HomeScreen() {
  const router = useRouter();
  const [todayDiary, setTodayDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTodayDiary = useCallback(async () => {
    try {
      setIsLoading(true);

      const today = getLocalDateString();
      const diaries = await getMyDiaries();

      const found = diaries.find((d: Diary) => d.diary_date === today);
      setTodayDiary(found ?? null);
    } catch (error) {
      console.log("Home diary load failed", error);
      setTodayDiary(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTodayDiary();
    }, [loadTodayDiary])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>하루묶음</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            오늘의 조각들을 질문으로 모아{"\n"}한 편의 이야기로 엮어볼까요?
          </Text>
          <Text style={styles.heroSubtitle}>
            당신의 오늘을 한 페이지로 정리해드릴게요.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() =>
              router.push({
                pathname: "/create",
                params: {
                  diaryDate: getLocalDateString(),
                },
              } as any)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>일기 생성하기</Text>
            <Ionicons name="sparkles" size={16} color={colors.white} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : todayDiary ? (
          <TouchableOpacity
            style={styles.diaryCard}
            activeOpacity={0.85}
            onPress={() => router.push(`/diary/${todayDiary.id}` as any)}
          >
            <View style={styles.diaryCardHeader}>
              <Ionicons name="document-text" size={18} color={colors.primary} />
              <Text style={styles.diaryCardTitle}>오늘의 일기</Text>
            </View>

            <Text style={styles.diaryCardBody} numberOfLines={3}>
              {todayDiary.body ?? todayDiary.content ?? ""}
            </Text>

            <View style={styles.diaryCardFooter}>
              <Text style={styles.diaryCardDate}>{todayDiary.diary_date}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.gray} />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="create-outline" size={32} color={colors.grayBorder} />
            <Text style={styles.emptyText}>아직 오늘의 일기가 없어요.</Text>
            <Text style={styles.emptySubtext}>위 버튼을 눌러 하루를 기록해보세요.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  heroSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "400",
    color: colors.text,
    lineHeight: 27,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.gray,
    textAlign: "center",
  },
  ctaButton: {
    flexDirection: "row",
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",
    marginTop: 4,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  diaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 18,
    gap: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  diaryCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  diaryCardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  diaryCardBody: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.text,
  },
  diaryCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  diaryCardDate: {
    fontSize: 12,
    color: colors.gray,
  },
  emptyCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 32,
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.gray,
  },
});