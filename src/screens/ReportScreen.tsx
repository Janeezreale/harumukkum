import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { getMyDiaries } from "../api/diary";

export default function ReportScreen() {
  const router = useRouter();
  const [hasDiaries, setHasDiaries] = useState<boolean | null>(null);

  useEffect(() => {
    getMyDiaries()
      .then((data) => setHasDiaries(data.length > 0))
      .catch(() => setHasDiaries(false));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 22 }} />
        <Text style={styles.headerTitle}>Weekly Report</Text>
        <TouchableOpacity hitSlop={8} onPress={() => router.push('/mypage' as any)}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {hasDiaries === null ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !hasDiaries ? (
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
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Magazine Header Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DAILY REPORT</Text>
            <View style={styles.emptyBox} />
          </View>

          {/* Emotion Storyline */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Emotion Storyline</Text>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
            </View>
            <View style={styles.emptyBox} />
          </View>

          {/* Keyword TOP 5 */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Keyword TOP 5</Text>
            <View style={styles.skeletonList}>
              {[1, 2, 3, 4, 5].map((i) => (
                <View key={i} style={styles.skeletonBar} />
              ))}
            </View>
          </View>

          {/* Reflection Tip */}
          <View style={styles.reflectionCard}>
            <View style={styles.reflectionHeader}>
              <Ionicons name="sparkles" size={16} color={colors.primary} />
              <Text style={styles.reflectionTitle}>Reflection Tip</Text>
            </View>
            <View style={[styles.emptyBox, { height: 60 }]} />
          </View>

          {/* View Full Report */}
          <TouchableOpacity
            style={[styles.fullReportBtn, styles.fullReportBtnDisabled]}
            disabled
            activeOpacity={0.85}
          >
            <Text style={styles.fullReportText}>View Full Report</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.black,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    textAlign: "center",
  },
  emptyDesc: {
    fontSize: 14,
    color: colors.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  writeBtn: {
    marginTop: 8,
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 36,
  },
  writeBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.white,
  },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

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
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.black,
  },

  emptyBox: {
    height: 120,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
  },

  skeletonList: { gap: 12 },
  skeletonBar: {
    height: 16,
    backgroundColor: colors.grayLight,
    borderRadius: 8,
  },

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

  fullReportBtn: {
    backgroundColor: colors.black,
    borderRadius: 28,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  fullReportBtnDisabled: {
    opacity: 0.3,
  },
  fullReportText: { fontSize: 15, fontWeight: "600", color: colors.white },
});
