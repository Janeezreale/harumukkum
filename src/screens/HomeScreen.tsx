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
  title: '오늘의 감정 흐름 감지하였어요',
  summary: '"찡찡하지만, 나쁘지 않았던 하루"',
};

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>하루묶음</Text>
        <TouchableOpacity>
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 메인 카드 */}
        <View style={styles.mainCard}>
          <Text style={styles.mainSlogan}>
            오늘의 조각들을 질문으로 모아{'\n'}
            한 편의 이야기로 엮어볼까요?
          </Text>
          <Text style={styles.mainSubtitle}>
            당신의 오늘을 한 이야기로 정리해드려요.
          </Text>

          {/* 키워드 칩 */}
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

          {/* CTA 버튼 */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/create')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaButtonText}>일기 생성하기 ✦</Text>
          </TouchableOpacity>
        </View>

        {/* AI 조각 섹션 */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>AI가 수집한 오늘의 조각들</Text>
          {/* TODO: navigate to full fragments list */}
          <TouchableOpacity>
            <Text style={styles.sectionLink}>전체보기 &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.fragmentRow}>
          {todayFragments.map((fragment) => (
            // TODO: navigate to fragment detail
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

        {/* AI 감정 통찰 카드 */}
        {/* TODO: navigate to insight detail */}
        <TouchableOpacity style={styles.insightCard} activeOpacity={0.9}>
          <View style={styles.insightLeft}>
            <Text style={styles.insightIcon}>💜</Text>
          </View>
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>{emotionInsight.title}</Text>
            <Text style={styles.insightSummary}>{emotionInsight.summary}</Text>
          </View>
          <Text style={styles.insightArrow}>&gt;</Text>
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
    backgroundColor: colors.background,
  },
  menuIcon: {
    fontSize: 20,
    color: colors.black,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  bellIcon: {
    fontSize: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  // 메인 카드
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  mainSlogan: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    lineHeight: 24,
  },
  mainSubtitle: {
    fontSize: 13,
    color: colors.gray,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    color: colors.black,
  },
  chipAdd: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipAddText: {
    fontSize: 13,
    color: colors.gray,
  },
  ctaButton: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  // AI 조각 섹션
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.gray,
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
    height: 110,
    backgroundColor: '#E5E7EB',
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
    fontSize: 13,
    fontWeight: '500',
    color: colors.black,
  },
  // AI 감정 통찰 카드
  insightCard: {
    backgroundColor: '#F0EBFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightLeft: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DDD6FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightIcon: {
    fontSize: 16,
  },
  insightContent: {
    flex: 1,
    gap: 2,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5B21B6',
  },
  insightSummary: {
    fontSize: 12,
    color: '#7C3AED',
  },
  insightArrow: {
    fontSize: 14,
    color: '#7C3AED',
  },
});
