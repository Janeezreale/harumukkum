import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { colors } from "../constants/colors";
import { emotions } from "../constants/emotions";
import { getMyDiaries } from "../api/diary";
import { getWeeklyReports, generateWeeklyReport } from "../api/report";
import { getWeekRange } from "../utils/date";
import type { WeeklyReport, ReportInsight } from "../types/report";
import type { Diary } from "../types/diary";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 100;

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function getEmotionEmoji(emotionId: string | null): string {
  if (!emotionId) return "";
  return emotions.find((e) => e.id === emotionId)?.emoji ?? "";
}

function getInsightColor(type: ReportInsight["type"]): string {
  if (type === "increase") return colors.positive;
  if (type === "decrease") return colors.negative;
  return colors.gray;
}

export default function ReportScreen() {
  const router = useRouter();
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [reportsData, diariesData] = await Promise.all([
        getWeeklyReports(),
        getMyDiaries(),
      ]);
      setDiaries(diariesData);
      if (reportsData.length > 0) {
        setReport(reportsData[0] as WeeklyReport);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function handleGenerate() {
    const { startDate, endDate } = getWeekRange();
    setIsGenerating(true);
    try {
      const newReport = await generateWeeklyReport(startDate, endDate);
      setReport(newReport as WeeklyReport);
    } catch (error) {
      Alert.alert("리포트 생성 실패", error instanceof Error ? error.message : "다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  }

  const hasDiaries = diaries.length > 0;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 22 }} />
          <Text style={styles.headerTitle}>Weekly Report</Text>
          <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
            <Ionicons name="person-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // No diaries at all
  if (!hasDiaries) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 22 }} />
          <Text style={styles.headerTitle}>Weekly Report</Text>
          <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
            <Ionicons name="person-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📔</Text>
          <Text style={styles.emptyTitle}>아직 남긴 일기가 없어요.</Text>
          <Text style={styles.emptyDesc}>
            일기를 작성하면{"\n"}나만의 리포트를 볼 수 있어요.
          </Text>
          <TouchableOpacity
            style={styles.writeBtn}
            onPress={() => router.push("/create")}
            activeOpacity={0.85}
          >
            <Text style={styles.writeBtnText}>일기 쓰기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Has diaries but no report yet
  if (!report) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={{ width: 22 }} />
          <Text style={styles.headerTitle}>Weekly Report</Text>
          <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
            <Ionicons name="person-outline" size={22} color={colors.black} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="sparkles" size={48} color={colors.primary} />
          <Text style={styles.emptyTitle}>리포트를 생성해보세요</Text>
          <Text style={styles.emptyDesc}>
            이번 주 일기 {diaries.length}개를 바탕으로{"\n"}AI가 분석 리포트를 만들어드려요.
          </Text>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={handleGenerate}
            disabled={isGenerating}
            activeOpacity={0.85}
          >
            {isGenerating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color={colors.white} />
                <Text style={styles.generateBtnText}>리포트 생성하기</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Has report - show full content
  const chartData = (report.emotion_story ?? []).map((p) => ({
    value: p.intensity,
  }));

  const insights = report.insights ?? [];
  const keywords = report.keywords ?? [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push("/mypage" as any)}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Badge */}
        <View style={styles.periodBadge}>
          <Text style={styles.periodText}>
            {report.week_start} ~ {report.week_end}
          </Text>
        </View>

        {/* Emotion Storyline */}
        {chartData.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Emotion Storyline</Text>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View style={styles.chartWrapper}>
              <LineChart
                data={chartData}
                width={CHART_WIDTH}
                height={120}
                hideDataPoints={false}
                color={colors.primaryLight}
                thickness={2.5}
                dataPointsColor={colors.primary}
                dataPointsRadius={4}
                startFillColor={colors.primaryLight}
                endFillColor="transparent"
                areaChart
                startOpacity={0.2}
                endOpacity={0}
                hideAxesAndRules
                curved
                isAnimated
              />
            </View>
            <View style={styles.chartXLabels}>
              {DAY_LABELS.slice(0, chartData.length).map((label, i) => (
                <Text key={i} style={styles.chartXLabel}>{label}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>MAIN INSIGHTS</Text>
            <View style={styles.insightList}>
              {insights.map((item, idx) => {
                const barColor = getInsightColor(item.type);
                const barWidth = `${Math.min(Math.abs(item.delta_percent) * 2, 100)}%` as `${number}%`;
                const isPositive = item.delta_percent > 0;
                return (
                  <View key={idx} style={styles.insightRow}>
                    <Text style={styles.insightLabel}>{item.title}</Text>
                    <View style={styles.insightBarBg}>
                      <View style={[styles.insightBarFill, { width: barWidth, backgroundColor: barColor }]} />
                    </View>
                    <Text style={[styles.insightDelta, { color: barColor }]}>
                      {isPositive ? "+" : ""}{item.delta_percent}%
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Keyword TOP 5 */}
        {keywords.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Keyword TOP 5</Text>
            <View style={styles.keywordList}>
              {keywords.slice(0, 5).map((kw, idx) => (
                <View key={idx} style={styles.keywordRow}>
                  <Text style={styles.keywordRank}>{idx + 1}</Text>
                  <Text style={styles.keywordLabel}>#{kw}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Reflection Tip */}
        {report.reflection_tip ? (
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.reflectionTitle}>Reflection Tip</Text>
            </View>
            <Text style={styles.reflectionBody}>{report.reflection_tip}</Text>
          </View>
        ) : null}

        {/* Regenerate */}
        <TouchableOpacity
          style={styles.regenerateBtn}
          onPress={handleGenerate}
          disabled={isGenerating}
          activeOpacity={0.85}
        >
          {isGenerating ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.regenerateText}>리포트 다시 생성하기</Text>
              <Ionicons name="refresh" size={16} color={colors.white} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
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

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 18, fontWeight: "600", color: colors.black, textAlign: "center" },
  emptyDesc: { fontSize: 14, color: colors.gray, textAlign: "center", lineHeight: 22 },
  writeBtn: {
    marginTop: 8,
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  writeBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },
  generateBtn: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generateBtnText: { fontSize: 15, fontWeight: "600", color: colors.white },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

  // Period
  periodBadge: {
    alignSelf: "center",
    backgroundColor: colors.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  periodText: { fontSize: 13, fontWeight: "600", color: colors.primary },

  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: colors.black },

  // Chart
  chartWrapper: { overflow: "hidden" },
  chartXLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  chartXLabel: { fontSize: 12, color: colors.gray, textAlign: "center" },

  // Insights
  insightList: { gap: 14 },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightLabel: { fontSize: 14, fontWeight: "600", color: colors.black, width: 80 },
  insightBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.grayLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  insightBarFill: { height: "100%", borderRadius: 3 },
  insightDelta: { fontSize: 13, fontWeight: "700", width: 50, textAlign: "right" },

  // Keywords
  keywordList: { gap: 10 },
  keywordRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  keywordRank: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    width: 20,
    textAlign: "center",
  },
  keywordLabel: { fontSize: 15, fontWeight: "600", color: colors.black },

  // Reflection
  reflectionCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  reflectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  reflectionTitle: { fontSize: 15, fontWeight: "700", color: colors.primaryDark },
  reflectionBody: { fontSize: 13, lineHeight: 21, color: colors.primary },

  // Regenerate
  regenerateBtn: {
    backgroundColor: colors.black,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  regenerateText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
