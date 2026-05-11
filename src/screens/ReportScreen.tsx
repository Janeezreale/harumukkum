import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useState } from 'react';
import { LineChart } from 'react-native-gifted-charts';
import { colors } from '../constants/colors';
import type { ReportInsight } from '../types/report';

// TODO: replace with api/report.getWeeklyReport()
const mockReport = {
  vol: 23,
  date: '2024.05.26',
  highlight_text: '아침 운동을 했을 때, 만족도가 40% 더 높아요.',
  insights: [
    { type: 'increase' as const, title: '아침 운동', delta_percent: 40 },
    { type: 'increase' as const, title: '독서', delta_percent: 25 },
    { type: 'increase' as const, title: '카페', delta_percent: 5 },
    { type: 'decrease' as const, title: '야식', delta_percent: -22 },
  ] satisfies ReportInsight[],
  emotion_story: [
    { date: '2026-05-06', label: 'M', intensity: 30 },
    { date: '2026-05-07', label: 'T', intensity: 50 },
    { date: '2026-05-08', label: 'W', intensity: 40 },
    { date: '2026-05-09', label: 'T', intensity: 65 },
    { date: '2026-05-10', label: 'F', intensity: 85 },
    { date: '2026-05-11', label: 'S', intensity: 60 },
    { date: '2026-05-12', label: 'S', intensity: 45 },
  ],
  emotion_caption: 'Your mood peaked on Friday following a series of creative breakthroughs.',
  keywords: [
    { label: 'Growth', entries: 12 },
    { label: 'Challenge', entries: 8 },
    { label: 'Serenity', entries: 6 },
    { label: 'Focus', entries: 5 },
    { label: 'Gratitude', entries: 4 },
  ],
  narrative_quote: "This week's Alex is like the protagonist of a coming-of-age movie",
  reflection_tip:
    "You've mentioned \"Morning Coffee\" 5 times this week in relation to your highest mood scores. Perhaps it's not the caffeine, but the quiet moment of solitude?",
  ai_observation:
    "I've noticed your mood outdoors significantly on days with consistent sleep patterns. Consider adding a 'wind-down' reminder.",
};

const INSIGHT_COLORS: Record<string, string> = {
  '아침 운동': '#22C55E',
  '독서': '#A78BFA',
  '카페': '#F59E0B',
  '야식': '#EF4444',
};
const INSIGHT_ICONS: Record<string, string> = {
  '아침 운동': '🏃',
  '독서': '📚',
  '카페': '☕',
  '야식': '🍔',
};

const MAX_KEYWORD_ENTRIES = 12;

// ─── Tab 1: Routine & Emotion ───────────────────────────────────────────────
function RoutineTab() {
  return (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={styles.tabScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* 하이라이트 카드 */}
      <View style={styles.highlightCard}>
        <Text style={styles.highlightText}>{mockReport.highlight_text}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: '40%' }]} />
        </View>
      </View>

      {/* MAIN INSIGHTS */}
      <Text style={styles.sectionTitle}>MAIN INSIGHTS</Text>
      <View style={styles.insightList}>
        {mockReport.insights.map((item) => {
          const barColor = INSIGHT_COLORS[item.title] ?? colors.primary;
          const isIncrease = item.type === 'increase';
          const barWidth = `${Math.min(Math.abs(item.delta_percent) * 2, 100)}%` as `${number}%`;
          return (
            <View key={item.title} style={styles.insightRow}>
              <View style={[styles.insightIconCircle, { backgroundColor: barColor + '22' }]}>
                <Text>{INSIGHT_ICONS[item.title] ?? '•'}</Text>
              </View>
              <Text style={styles.insightLabel}>{item.title}</Text>
              <View style={styles.insightBarBg}>
                <View style={[styles.insightBarFill, { width: barWidth, backgroundColor: barColor }]} />
              </View>
              <View style={[styles.insightBadge, { backgroundColor: barColor + '22' }]}>
                <Text style={[styles.insightBadgeText, { color: barColor }]}>
                  {isIncrease ? '+' : ''}{item.delta_percent}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* See More Insights */}
      <TouchableOpacity style={styles.seeMoreBtn} activeOpacity={0.8}>
        {/* TODO: expand full insights list */}
        <Text style={styles.seeMoreText}>See More Insights</Text>
      </TouchableOpacity>

      {/* AI Observation */}
      <View style={styles.observationCard}>
        <View style={styles.observationHeader}>
          <Text style={styles.observationIcon}>💜</Text>
          <Text style={styles.observationTitle}>AI Observation</Text>
        </View>
        <Text style={styles.observationBody}>{mockReport.ai_observation}</Text>
      </View>
    </ScrollView>
  );
}

// ─── Tab 2: Keyword Analysis ─────────────────────────────────────────────────
function KeywordTab() {
  const chartData = mockReport.emotion_story.map((p) => ({ value: p.intensity }));

  return (
    <ScrollView
      style={styles.tabScroll}
      contentContainerStyle={styles.tabScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Daily Report 헤더 */}
      <View style={styles.dailyHeader}>
        <Text style={styles.volText}>VOL. {mockReport.vol}</Text>
        <Text style={styles.dailyDate}>{mockReport.date}</Text>
      </View>
      <Text style={styles.dailyTitle}>DAILY{'\n'}REPORT</Text>

      {/* 내러티브 이미지 카드 */}
      <View style={styles.narrativeCard}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' }}
          style={styles.narrativeImage}
        />
        <View style={styles.narrativeOverlay}>
          <Text style={styles.narrativeQuote}>"{mockReport.narrative_quote}"</Text>
          <Text style={styles.narrativeLabel}>AI NARRATIVE INSIGHT</Text>
        </View>
      </View>

      {/* Emotion Storyline */}
      <Text style={styles.sectionTitle}>Emotion Storyline</Text>
      <View style={styles.chartCard}>
        <LineChart
          data={chartData}
          width={280}
          height={120}
          hideDataPoints={false}
          color="#A78BFA"
          thickness={2.5}
          dataPointsColor="#7C3AED"
          dataPointsRadius={4}
          startFillColor="#A78BFA"
          endFillColor="transparent"
          areaChart
          startOpacity={0.2}
          endOpacity={0}
          hideAxesAndRules
          curved
          isAnimated
        />
        {/* X축 레이블 */}
        <View style={styles.chartXLabels}>
          {mockReport.emotion_story.map((p) => (
            <Text key={p.date} style={styles.chartXLabel}>{p.label}</Text>
          ))}
        </View>
        <Text style={styles.chartCaption}>{mockReport.emotion_caption}</Text>
      </View>

      {/* Keyword TOP 5 */}
      <Text style={styles.sectionTitle}>Keyword TOP 5</Text>
      <View style={styles.keywordList}>
        {mockReport.keywords.map((kw) => (
          <View key={kw.label} style={styles.keywordRow}>
            <Text style={styles.keywordLabel}>#{kw.label}</Text>
            <View style={styles.keywordBarBg}>
              <View
                style={[
                  styles.keywordBarFill,
                  { width: `${(kw.entries / MAX_KEYWORD_ENTRIES) * 100}%` as `${number}%` },
                ]}
              />
            </View>
            <Text style={styles.keywordEntries}>{kw.entries} entries</Text>
          </View>
        ))}
      </View>

      {/* Reflection Tip */}
      <View style={styles.reflectionCard}>
        <View style={styles.reflectionHeader}>
          <Text style={styles.reflectionIcon}>💜</Text>
          <Text style={styles.reflectionTitle}>Reflection Tip</Text>
        </View>
        <Text style={styles.reflectionBody}>{mockReport.reflection_tip}</Text>
      </View>

      {/* View Full Report */}
      <TouchableOpacity style={styles.fullReportBtn} activeOpacity={0.85}>
        {/* TODO: navigate to full report detail */}
        <Text style={styles.fullReportText}>View Full Report →</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
type Tab = 'routine' | 'keyword';

export default function ReportScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('routine');

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.headerMenu}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>하루 보고서</Text>
        {/* TODO: show report info modal */}
        <TouchableOpacity hitSlop={8}>
          <Text style={styles.headerInfo}>ℹ</Text>
        </TouchableOpacity>
      </View>

      {/* 탭 */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'routine' && styles.tabBtnActive]}
          onPress={() => setActiveTab('routine')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'routine' && styles.tabBtnTextActive]}>
            Routine & Emotion
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'keyword' && styles.tabBtnActive]}
          onPress={() => setActiveTab('keyword')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'keyword' && styles.tabBtnTextActive]}>
            Keyword Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'routine' ? <RoutineTab /> : <KeywordTab />}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerMenu: { fontSize: 20, color: colors.black },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.black },
  headerInfo: { fontSize: 18, color: colors.gray },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabBtnActive: { backgroundColor: colors.white },
  tabBtnText: { fontSize: 13, color: colors.gray, fontWeight: '500' },
  tabBtnTextActive: { color: colors.black, fontWeight: '600' },

  // Scroll
  tabScroll: { flex: 1 },
  tabScrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  // ── Tab 1 ──
  highlightCard: {
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
  highlightText: { fontSize: 15, fontWeight: '600', color: colors.black, lineHeight: 22 },
  progressBg: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },

  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.gray, letterSpacing: 0.5 },

  insightList: { gap: 12 },
  insightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  insightIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightLabel: { fontSize: 14, color: colors.black, width: 60 },
  insightBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  insightBarFill: { height: '100%', borderRadius: 3 },
  insightBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  insightBadgeText: { fontSize: 12, fontWeight: '700' },

  seeMoreBtn: {
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  seeMoreText: { fontSize: 14, fontWeight: '600', color: colors.black },

  observationCard: {
    backgroundColor: '#F0EBFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  observationHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  observationIcon: { fontSize: 16 },
  observationTitle: { fontSize: 14, fontWeight: '600', color: '#5B21B6' },
  observationBody: { fontSize: 13, lineHeight: 20, color: '#6D28D9' },

  // ── Tab 2 ──
  dailyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  volText: { fontSize: 13, color: colors.gray, fontWeight: '600' },
  dailyDate: { fontSize: 13, color: colors.gray },
  dailyTitle: { fontSize: 32, fontWeight: '900', color: colors.black, lineHeight: 38 },

  narrativeCard: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 200,
  },
  narrativeImage: { width: '100%', height: '100%', backgroundColor: '#1F2937' },
  narrativeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.45)',
    gap: 4,
  },
  narrativeQuote: { fontSize: 13, color: '#E9D5FF', fontStyle: 'italic', lineHeight: 18 },
  narrativeLabel: { fontSize: 10, fontWeight: '700', color: '#C4B5FD', letterSpacing: 1 },

  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  chartXLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  chartXLabel: { fontSize: 11, color: colors.gray, width: 20, textAlign: 'center' },
  chartCaption: { fontSize: 12, color: colors.gray, lineHeight: 18, marginTop: 4 },

  keywordList: { gap: 10 },
  keywordRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  keywordLabel: { fontSize: 14, fontWeight: '600', color: colors.black, width: 90 },
  keywordBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  keywordBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
  keywordEntries: { fontSize: 12, color: colors.gray, width: 58, textAlign: 'right' },

  reflectionCard: {
    backgroundColor: '#F0EBFF',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  reflectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  reflectionIcon: { fontSize: 16 },
  reflectionTitle: { fontSize: 14, fontWeight: '600', color: '#5B21B6' },
  reflectionBody: { fontSize: 13, lineHeight: 20, color: '#6D28D9' },

  fullReportBtn: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  fullReportText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
