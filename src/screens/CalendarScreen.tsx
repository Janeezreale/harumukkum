import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CELL_SIZE = (SCREEN_WIDTH - 40 - 6 * 4) / 7; // 7 columns, 4px gaps

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

// Mock calendar data - days with AI-generated images
type CalendarDay = {
  day: number;
  hasDiary: boolean;
  imageUri?: string;
};

function generateMockDays(): CalendarDay[] {
  const days: CalendarDay[] = [];
  // Previous month overflow (29, 30)
  // Current month: 1-30
  for (let i = 1; i <= 30; i++) {
    const hasDiary = i <= 28 && Math.random() > 0.15;
    days.push({
      day: i,
      hasDiary,
      imageUri: hasDiary
        ? `https://picsum.photos/seed/day${i}/200/200`
        : undefined,
    });
  }
  return days;
}

const MOCK_DAYS = generateMockDays();

// Calculate first day offset (for May 2024, starts on Wednesday = 3)
const FIRST_DAY_OFFSET = 3;

export default function CalendarScreen() {
  const router = useRouter();

  // Build grid including offset
  const gridCells: (CalendarDay | null)[] = [];
  for (let i = 0; i < FIRST_DAY_OFFSET; i++) {
    gridCells.push(null); // empty cells for offset
  }
  MOCK_DAYS.forEach((d) => gridCells.push(d));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>한 달 묶음</Text>
        <TouchableOpacity hitSlop={8}>
          <Ionicons name="person-outline" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
          {gridCells.map((cell, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dayCell}
              activeOpacity={cell?.hasDiary ? 0.7 : 1}
              onPress={() => {
                if (cell?.hasDiary) {
                  router.push(`/diary/${cell.day}`);
                }
              }}
            >
              {cell ? (
                <>
                  {cell.imageUri ? (
                    <Image source={{ uri: cell.imageUri }} style={styles.dayImage} />
                  ) : (
                    <View style={styles.dayEmpty} />
                  )}
                  <Text style={[
                    styles.dayNumber,
                    cell.imageUri && styles.dayNumberOnImage,
                  ]}>
                    {cell.day}
                  </Text>
                </>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/create')}
          activeOpacity={0.85}
        >
          <Text style={styles.ctaText}>오늘의 하루 묶기</Text>
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
  scrollContent: { paddingHorizontal: 20, paddingBottom: 32 },

  // Week header
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '500',
    color: colors.gray,
    marginHorizontal: 2,
    paddingVertical: 8,
  },
  weekDaySun: { color: colors.negative },
  weekDaySat: { color: colors.primary },

  // Calendar grid
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  dayEmpty: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: colors.grayLight,
    borderRadius: 8,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    zIndex: 1,
  },
  dayNumberOnImage: {
    color: colors.white,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // CTA
  ctaButton: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  ctaText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
