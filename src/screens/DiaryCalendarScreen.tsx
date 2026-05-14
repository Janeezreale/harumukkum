import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import type { ReportInsight } from "../types/report";

// TODO: replace with API call
const mockReport = {
  highlight_text: "아침 운동을 했을 때,\n만족도가 40% 더 높아요.",
  highlight_percent: 40,
  insights: [
    {
      type: "increase" as const,
      title: "아침 운동",
      delta_percent: 40,
      icon: "🏃",
      color: colors.positive,
    },
    {
      type: "increase" as const,
      title: "독서",
      delta_percent: 25,
      icon: "📚",
      color: colors.accent,
    },
    {
      type: "increase" as const,
      title: "카페",
      delta_percent: 15,
      icon: "☕",
      color: colors.warning,
    },
    {
      type: "decrease" as const,
      title: "야식",
      delta_percent: -22,
      icon: "🌙",
      color: colors.negativeLight,
    },
  ] satisfies (ReportInsight & { icon: string; color: string })[],
  ai_observation:
    "I've noticed your mood stabilizes significantly on days with consistent sleep patterns. Consider setting a 'wind-down' reminder.",
};

const TABS = ["Routine & Emotion", "Keyword Analysis"] as const;

export default function DiaryCalendarScreen() {
  const [activeTab, setActiveTab] =
    useState<(typeof TABS)[number]>("Routine & Emotion");

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>하루 보고서</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="help-circle-outline" size={22} color={colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === tab && styles.tabBtnTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Highlight Card */}
        <View style={styles.highlightCard}>
          <Text style={styles.highlightText}>
            아침 운동을 했을 때,{"\n"}만족도가{" "}
            <Text style={styles.highlightAccent}>40%</Text> 더 높아요.
          </Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: "40%" }]} />
          </View>
        </View>

        {/* MAIN INSIGHTS */}
        <Text style={styles.sectionTitle}>MAIN INSIGHTS</Text>

        <View style={styles.insightList}>
          {mockReport.insights.map((item) => {
            const barWidth =
              `${Math.min(Math.abs(item.delta_percent) * 2, 100)}%` as `${number}%`;
            const isPositive = item.delta_percent > 0;
            return (
              <View key={item.title} style={styles.insightRow}>
                <View
                  style={[
                    styles.insightIconCircle,
                    { backgroundColor: item.color + "1A" },
                  ]}
                >
                  <Text style={styles.insightEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.insightInfo}>
                  <View style={styles.insightLabelRow}>
                    <Text style={styles.insightLabel}>{item.title}</Text>
                    <Text
                      style={[
                        styles.insightDelta,
                        {
                          color: isPositive ? colors.positive : colors.negative,
                        },
                      ]}
                    >
                      {isPositive ? "+" : ""}
                      {item.delta_percent}%
                    </Text>
                  </View>
                  <View style={styles.insightBarBg}>
                    <View
                      style={[
                        styles.insightBarFill,
                        { width: barWidth, backgroundColor: item.color },
                      ]}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* See More */}
        <TouchableOpacity style={styles.seeMoreBtn} activeOpacity={0.8}>
          <Text style={styles.seeMoreText}>See More Insights</Text>
        </TouchableOpacity>

        {/* AI Observation */}
        <View style={styles.observationCard}>
          <View style={styles.observationHeader}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.observationTitle}>AI Observation</Text>
          </View>
          <Text style={styles.observationBody}>
            {mockReport.ai_observation}
          </Text>
        </View>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.black,
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
  },

  // Tabs
  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  tabBtn: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginRight: 24,
  },
  tabBtnActive: {
    borderBottomWidth: 2,
    borderBottomColor: colors.black,
  },
  tabBtnText: { fontSize: 14, color: colors.gray, fontWeight: "500" },
  tabBtnTextActive: { color: colors.black, fontWeight: "600" },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 16,
    gap: 16,
  },

  // Highlight
  highlightCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  highlightText: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.black,
    lineHeight: 26,
  },
  highlightAccent: {
    color: colors.primary,
    fontWeight: "700",
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.black,
    letterSpacing: 0.5,
    marginTop: 4,
  },

  // Insight rows
  insightList: { gap: 16 },
  insightRow: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  insightIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  insightEmoji: { fontSize: 20 },
  insightInfo: { flex: 1, gap: 8 },
  insightLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  insightLabel: { fontSize: 15, fontWeight: "600", color: colors.black },
  insightDelta: { fontSize: 14, fontWeight: "700" },
  insightBarBg: {
    height: 6,
    backgroundColor: colors.grayLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  insightBarFill: { height: "100%", borderRadius: 3 },

  // See more
  seeMoreBtn: {
    backgroundColor: colors.grayLight,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  seeMoreText: { fontSize: 14, fontWeight: "600", color: colors.black },

  // AI Observation
  observationCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  observationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  observationTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  observationBody: { fontSize: 13, lineHeight: 21, color: colors.primary },
});
