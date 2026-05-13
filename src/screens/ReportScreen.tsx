import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-gifted-charts';
import { colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// TODO: replace with api/report.getWeeklyReport()
const mockReport = {
  vol: 23,
  date: '2024.05.26',
  narrative_quote: "This week's Alex is like the protagonist of a coming-of-age movie",
  emotion_story: [
    { label: 'M', intensity: 30 },
    { label: 'T', intensity: 50 },
    { label: 'W', intensity: 40 },
    { label: 'T', intensity: 65 },
    { label: 'F', intensity: 85 },
    { label: 'S', intensity: 60 },
    { label: 'S', intensity: 45 },
  ],
  emotion_caption: 'Your mood peaked on Friday following a series of creative breakthroughs.',
  keywords: [
    { label: 'Growth', entries: 12 },
    { label: 'Challenge', entries: 8 },
    { label: 'Serenity', entries: 6 },
    { label: 'Focus', entries: 5 },
    { label: 'Gratitude', entries: 4 },
  ],
  reflection_tip:
    'You\'ve mentioned "Morning Coffee" 5 times this week in relation to your highest mood scores. Perhaps it\'s not the caffeine, but the quiet moment of solitude?',
};

const MAX_ENTRIES = 12;

export default function ReportScreen() {
  const chartData = mockReport.emotion_story.map((p) => ({ value: p.intensity }));
  const chartWidth = SCREEN_WIDTH - 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="menu" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Magazine Header Card */}
        <View style={styles.magazineCard}>
          <View style={styles.magazineTop}>
            <Text style={styles.volText}>VOL. {mockReport.vol}</Text>
            <Text style={styles.dateText}>{mockReport.date}</Text>
          </View>
          <Text style={styles.dailyTitle}>DAILY{'\n'}REPORT</Text>

          {/* Hero Image */}
          <View style={styles.heroImageWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay}>
              <Text style={styles.heroQuote}>"{mockReport.narrative_quote}"</Text>
              <Text style={styles.heroLabel}>AI NARRATIVE INSIGHT</Text>
            </View>
          </View>
        </View>

        {/* Emotion Storyline */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Emotion Storyline</Text>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <View style={styles.chartWrapper}>
            <LineChart
              data={chartData}
              width={chartWidth}
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
            {mockReport.emotion_story.map((p, i) => (
              <Text key={i} style={styles.chartXLabel}>{p.label}</Text>
            ))}
          </View>
          <Text style={styles.chartCaption}>{mockReport.emotion_caption}</Text>
        </View>

        {/* Keyword TOP 5 */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Keyword TOP 5</Text>
          <View style={styles.keywordList}>
            {mockReport.keywords.map((kw) => (
              <View key={kw.label} style={styles.keywordRow}>
                <Text style={styles.keywordLabel}>#{kw.label}</Text>
                <Text style={[styles.keywordEntries, kw.entries === MAX_ENTRIES && styles.keywordEntriesHighlight]}>
                  {kw.entries} entries
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Reflection Tip */}
        <View style={styles.reflectionCard}>
          <View style={styles.reflectionHeader}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.reflectionTitle}>Reflection Tip</Text>
          </View>
          <Text style={styles.reflectionBody}>{mockReport.reflection_tip}</Text>
        </View>

        {/* View Full Report */}
        <TouchableOpacity style={styles.fullReportBtn} activeOpacity={0.85}>
          <Text style={styles.fullReportText}>View Full Report</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.white} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.black },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

  // Magazine card
  magazineCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  magazineTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  volText: { fontSize: 12, fontWeight: '600', color: colors.gray, letterSpacing: 0.5 },
  dateText: { fontSize: 12, color: colors.gray },
  dailyTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.black,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  heroImageWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 200,
    marginTop: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.blackDeep,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 4,
  },
  heroQuote: {
    fontSize: 14,
    color: colors.primaryPalest,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  heroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLighter,
    letterSpacing: 1,
  },

  // Generic card
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },

  // Chart
  chartWrapper: {
    overflow: 'hidden',
  },
  chartXLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  chartXLabel: { fontSize: 12, color: colors.gray, textAlign: 'center' },
  chartCaption: { fontSize: 12, color: colors.gray, lineHeight: 18, marginTop: 4 },

  // Keywords
  keywordList: { gap: 12 },
  keywordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  keywordLabel: { fontSize: 15, fontWeight: '600', color: colors.black },
  keywordEntries: { fontSize: 13, color: colors.gray },
  keywordEntriesHighlight: { color: colors.negative, fontWeight: '600' },

  // Reflection
  reflectionCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reflectionTitle: { fontSize: 15, fontWeight: '700', color: colors.primaryDark },
  reflectionBody: { fontSize: 13, lineHeight: 21, color: colors.primary },

  // Full report button
  fullReportBtn: {
    backgroundColor: colors.black,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullReportText: { fontSize: 15, fontWeight: '600', color: colors.white },
});
