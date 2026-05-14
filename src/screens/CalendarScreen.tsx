import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Image,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getMyDiaries } from "../api/diary";
import type { Diary } from "../types/diary";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CELL_SIZE = (SCREEN_WIDTH - 40 - 6 * 4) / 7;

const DAYS_OF_WEEK = ["일", "월", "화", "수", "목", "금", "토"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function getDiaryImage(diary: Diary): string | null {
  // diary_images 관계에서 가져오거나, thumbnail_url, photo_url 순서로 확인
  const images = (diary as any).diary_images;
  if (Array.isArray(images) && images.length > 0 && images[0].image_url) {
    return images[0].image_url;
  }
  return diary.thumbnail_url ?? diary.photo_url ?? null;
}

export default function CalendarScreen() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [diaryMap, setDiaryMap] = useState<Record<string, Diary>>({});
  const [isLoading, setIsLoading] = useState(true);

  const loadDiaries = useCallback(async () => {
    try {
      const diaries = await getMyDiaries();
      const map: Record<string, Diary> = {};
      diaries.forEach((d: Diary) => {
        map[d.diary_date] = d;
      });
      setDiaryMap(map);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  function goToPrevMonth() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goToNextMonth() {
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const gridCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

  const monthLabel = `${year}년 ${month + 1}월`;
  const todayDate = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>한 달 묶음</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Month Navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={goToPrevMonth} hitSlop={8}>
              <Ionicons name="chevron-back" size={22} color={colors.black} />
            </TouchableOpacity>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <TouchableOpacity onPress={goToNextMonth} hitSlop={8}>
              <Ionicons name="chevron-forward" size={22} color={colors.black} />
            </TouchableOpacity>
          </View>

          {/* Day of week headers */}
          <View style={styles.weekHeader}>
            {DAYS_OF_WEEK.map((d, i) => (
              <Text
                key={d}
                style={[
                  styles.weekDay,
                  i === 0 && styles.weekDaySun,
                  i === 6 && styles.weekDaySat,
                ]}
              >
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {gridCells.map((day, index) => {
              if (day === null) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const diary = diaryMap[dateStr];
              const isToday = isCurrentMonth && day === todayDate;
              const imageUrl = diary ? getDiaryImage(diary) : null;

              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCell, diary && styles.dayCellWithDiary]}
                  activeOpacity={diary ? 0.7 : 1}
                  onPress={() => {
                    if (diary) router.push(`/diary/${diary.id}` as any);
                  }}
                >
                  {imageUrl ? (
                    <>
                      <Image source={{ uri: imageUrl }} style={styles.dayImage} />
                      <View style={styles.dayImageOverlay} />
                      <Text style={[styles.dayNumber, styles.dayNumberOnImage]}>
                        {day}
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={[
                          styles.dayNumber,
                          isToday && styles.dayNumberToday,
                          diary && styles.dayNumberWithDiary,
                        ]}
                      >
                        {day}
                      </Text>
                      {diary && <View style={styles.diaryDot} />}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/create")}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>오늘의 하루 묶기</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: "700", color: colors.black },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  // Month navigation
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
  },

  // Week header
  weekHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekDay: {
    width: CELL_SIZE,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "500",
    color: colors.gray,
    marginHorizontal: 2,
    paddingVertical: 8,
  },
  weekDaySun: { color: colors.negative },
  weekDaySat: { color: colors.primary },

  // Calendar grid
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.grayLight,
    overflow: "hidden",
  },
  dayCellWithDiary: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  dayImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  dayImageOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: 10,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
    zIndex: 1,
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: "800",
  },
  dayNumberWithDiary: {
    color: colors.primary,
  },
  dayNumberOnImage: {
    color: colors.white,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  diaryDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.primary,
    marginTop: 2,
  },

  // CTA
  ctaButton: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 24,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
