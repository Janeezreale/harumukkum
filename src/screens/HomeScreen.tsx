import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

// TODO: replace with api/diary.getTodayFragments
const todayFragments = [
  {
    id: "1",
    time: "09:21",
    location: "카페 이로운",
    imageUri:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300",
  },
  {
    id: "2",
    time: "13:47",
    location: "성수동 근처",
    imageUri:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300",
  },
  {
    id: "3",
    time: "18:32",
    location: "메모 3개",
    imageUri:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300",
  },
];

// TODO: replace with api/diary.getKeywordChips
const keywordChips = ["#카페", "#설렘", "#지친 하루"];

// TODO: replace with api/diary.getEmotionInsight
const emotionInsight = {
  title: "오늘의 감정 톤을 감지했어요",
  summary: '"복잡하지만, 나쁘지 않았던 하루"',
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 36 }} />
        <Text style={styles.headerTitle}>하루묶음</Text>
        <TouchableOpacity hitSlop={8} style={styles.headerIconBtn} onPress={() => router.push('/mypage' as any)}>
          <Ionicons name="person-outline" size={20} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            오늘의 조각들을 질문으로 모아{"\n"}한 편의 이야기로 엮어볼까요?
          </Text>
          <Text style={styles.heroSubtitle}>
            당신의 오늘을 한 페이지로 정리해드릴게요.
          </Text>

          {/* Keyword Chips */}
          <View style={styles.chipsRow}>
            {keywordChips.map((chip) => (
              <View key={chip} style={styles.chip}>
                <Text style={styles.chipText}>{chip}</Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/create")}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>일기 생성하기</Text>
            <Ionicons name="sparkles" size={16} color={colors.white} style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>

        {/* AI Fragments Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI가 수집한 오늘의 조각들</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>전체보기</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.fragmentScroll}
        >
          {todayFragments.map((fragment) => (
            <TouchableOpacity
              key={fragment.id}
              style={styles.fragmentCard}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: fragment.imageUri }}
                style={styles.fragmentImage}
              />
              <View style={styles.fragmentLabel}>
                <Text style={styles.fragmentTime}>{fragment.time}</Text>
                <Text style={styles.fragmentLocation}>{fragment.location}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Emotion Insight Banner */}
        <TouchableOpacity style={styles.insightCard} activeOpacity={0.9}>
          <View style={styles.insightIconWrap}>
            <View style={styles.insightIconCircle} />
            <Text style={styles.insightIconEmoji}>😊</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{emotionInsight.title}</Text>
            <Text style={styles.insightSummary}>{emotionInsight.summary}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "500",
    color: colors.black,
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },

  // Hero Section
  heroSection: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
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
    letterSpacing: 0.2,
  },

  // Keyword Chips
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    marginBottom: 4,
  },
  chip: {
    backgroundColor: colors.white,
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 1,
  },
  chipText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "400",
  },
  // CTA Button
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },

  // AI Fragments
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  sectionLink: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: "500",
  },
  fragmentScroll: {
    gap: 12,
    paddingRight: 4,
  },
  fragmentCard: {
    width: 140,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 2,
  },
  fragmentImage: {
    width: "100%",
    height: 100,
    backgroundColor: colors.grayLight,
  },
  fragmentLabel: {
    padding: 10,
    gap: 3,
  },
  fragmentTime: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: "400",
  },
  fragmentLocation: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text,
  },

  // Emotion Insight Banner
  insightCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
  },
  insightIconWrap: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  insightIconCircle: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(97, 75, 190, 0.1)",
  },
  insightIconEmoji: {
    fontSize: 20,
  },
  insightContent: {
    flex: 1,
    gap: 3,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray,
  },
  insightSummary: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: "500",
  },
});
