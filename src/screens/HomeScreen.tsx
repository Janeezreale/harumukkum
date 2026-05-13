import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// TODO: replace with api/diary.getTodayDiary
const todayDiary = {
  keywords: ['카페', '설렘', '지친 하루'],
};

// TODO: replace with api/diary.getTodayFragments
const todayFragments = [
  {
    id: '1',
    time: '09:21',
    location: '카페 이로운',
    imageUri: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300',
  },
  {
    id: '2',
    time: '13:47',
    location: '성수동 근처',
    imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
  },
];

// TODO: replace with api/diary.getEmotionInsight
const emotionInsight = {
  title: '오늘의 감정 톤을 감지했어요',
  summary: '"복잡하지만, 나쁘지 않았던 하루"',
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="menu" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>하루묶음</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainSlogan}>
            오늘의 조각들을 질문으로 모아{'\n'}
            한 편의 이야기로 엮어볼까요?
          </Text>
          <Text style={styles.mainSubtitle}>
            당신의 오늘을 한 페이지로 정리해드릴게요.
          </Text>

          {/* Keyword chips */}
          <View style={styles.chipRow}>
            {todayDiary.keywords.map((kw) => (
              <View key={kw} style={styles.chip}>
                <Text style={styles.chipText}>#{kw}</Text>
              </View>
            ))}
            <View style={styles.chipAdd}>
              <Text style={styles.chipAddText}>+</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/create')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>일기 생성하기  ✦</Text>
          </TouchableOpacity>
        </View>

        {/* AI Fragments Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI가 수집한 오늘의 조각들</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>전체보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fragmentRow}>
          {todayFragments.map((fragment) => (
            <TouchableOpacity key={fragment.id} style={styles.fragmentCard} activeOpacity={0.9}>
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
        </View>

        {/* Emotion Insight Banner */}
        <TouchableOpacity style={styles.insightCard} activeOpacity={0.9}>
          <View style={styles.insightLeft}>
            <Text style={styles.insightIcon}>😊</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  // Main card
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  mainSlogan: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 28,
    textAlign: 'center',
  },
  mainSubtitle: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.grayLight,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  chipAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.grayBorder,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipAddText: {
    fontSize: 16,
    color: colors.gray,
  },
  ctaButton: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // AI Fragments
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  fragmentRow: {
    flexDirection: 'row',
    gap: 12,
  },
  fragmentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  fragmentImage: {
    width: '100%',
    height: 120,
    backgroundColor: colors.grayLight,
  },
  fragmentLabel: {
    padding: 10,
    gap: 2,
  },
  fragmentTime: {
    fontSize: 12,
    color: colors.gray,
  },
  fragmentLocation: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  // Emotion Insight
  insightCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DDD6FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 18,
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  insightSummary: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
});
