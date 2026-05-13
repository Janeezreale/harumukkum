import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";

// TODO: replace with actual diary count check
const hasDiaries = false;

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {hasDiaries ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 구조 자리 - 일기 데이터 쌓이면 활성화 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Emotion Storyline</Text>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>차트 영역</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Keyword TOP 5</Text>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>키워드 영역</Text>
            </View>
          </View>

          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.reflectionTitle}>Reflection Tip</Text>
            </View>
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>AI 팁 영역</Text>
            </View>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={colors.grayBorder} />
          <Text style={styles.emptyTitle}>아직 리포트가 없어요</Text>
          <Text style={styles.emptySubtitle}>
            일기를 작성하면 AI가 주간 리포트를{'\n'}자동으로 생성해드려요.
          </Text>
        </View>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.black,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

  // Cards (structure preview)
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },
  placeholder: {
    height: 80,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 13,
    color: colors.gray,
  },

  // Reflection
  reflectionCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  reflectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reflectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    paddingBottom: 80,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
});
