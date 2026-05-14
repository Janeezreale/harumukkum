import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
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

export default function CalendarScreen() {
  const router = useRouter();
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth());
  const [diaryMap, setDiaryMap] = useState<Record<string, Diary>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyDiaries()
      .then((diaries) => {
        const map: Record<string, Diary> = {};
        diaries.forEach((d: Diary) => {
          map[d.diary_date] = d;
        });
        setDiaryMap(map);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const gridCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) gridCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) gridCells.push(d);

  const monthLabel = `${year}년 ${month + 1}월`;
  const today = now.getDate();

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
          <Text style={styles.monthLabel}>{monthLabel}</Text>

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
              const isToday = day === today;

              return (
                <TouchableOpacity
                  key={day}
                  style={[styles.dayCell, diary && styles.dayCellWithDiary]}
                  activeOpacity={diary ? 0.7 : 1}
                  onPress={() => {
                    if (diary) router.push(`/diary/${diary.id}` as any);
                  }}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && styles.dayNumberToday,
                      diary && styles.dayNumberWithDiary,
                    ]}
                  >
                    {day}
                  </Text>
                  {diary && (
                    <View style={styles.diaryDot} />
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

  monthLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.black,
    textAlign: "center",
    marginBottom: 16,
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
  },
  dayCellWithDiary: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  dayNumberToday: {
    color: colors.primary,
    fontWeight: "800",
  },
  dayNumberWithDiary: {
    color: colors.primary,
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
