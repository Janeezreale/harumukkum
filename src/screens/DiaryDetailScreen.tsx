import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import type { Diary } from '../types/diary';
import { deleteDiary, getDiaryByDate, getDiaryById } from '../api/diary';
import { useDiaryStore } from '../store/diaryStore';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`;
}

function getDiaryTitle(diary: Diary) {
  return diary.title || '오늘의 일기';
}

function getDiaryContent(diary: Diary) {
  return diary.content || diary.body || '생성된 일기 본문이 비어 있어요.';
}

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();
  const diaryId = Array.isArray(id) ? id[0] : id ?? '';
  const diaryDate = Array.isArray(date) ? date[0] : date ?? '';
  const routeDiaryKey = diaryId || diaryDate;
  const { lastGeneratedDiary, setLastGeneratedDiary } = useDiaryStore();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDiary() {
      if (!routeDiaryKey) {
        setIsLoading(false);
        return;
      }

      if (lastGeneratedDiary?.id === routeDiaryKey || lastGeneratedDiary?.diary_date === routeDiaryKey) {
        setDiary(lastGeneratedDiary);
        setIsLoading(false);
        return;
      }

      try {
        const isDateRoute = /^\d{4}-\d{2}-\d{2}$/.test(routeDiaryKey);
        const data = isDateRoute
          ? await getDiaryByDate(routeDiaryKey)
          : await getDiaryById(routeDiaryKey);
        if (mounted) setDiary(data);
      } catch (error) {
        console.error('Diary detail load failed', error);
        if (mounted) {
          Alert.alert('오류', '일기를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDiary();

    return () => {
      mounted = false;
    };
  }, [lastGeneratedDiary, routeDiaryKey]);

  function handleDelete() {
    if (!diary || isDeleting) return;
    setMenuVisible(false);

    Alert.alert('일기 삭제', '이 일기를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteDiary(diary.id);
            if (lastGeneratedDiary?.id === diary.id) {
              setLastGeneratedDiary(null);
            }
            showToast('일기가 삭제되었어요');
            router.replace('/(tabs)/diary');
          } catch (error) {
            console.error('Diary delete failed', error);
            const message = error instanceof Error ? error.message : '일기 삭제에 실패했어요.';
            Alert.alert('삭제 실패', message);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }

  function handleApprove() {
    showToast('일기가 저장되었어요');
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!diary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 하루 묶음</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.centerState}>
          <Text style={styles.emptyText}>일기를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 하루 묶음</Text>
        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={22} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Dropdown menu */}
      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            <Text style={styles.dropdownDelete}>
              {isDeleting ? '삭제 중...' : '삭제하기'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Subtitle */}
        <Text style={styles.subtitle}>{getDiaryTitle(diary)}</Text>

        {/* Date row */}
        <View style={styles.dateRow}>
          <View style={styles.dateBadge}>
            <View style={styles.dateDot} />
            <Text style={styles.dateText}>{formatDate(diary.diary_date)}</Text>
          </View>
          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push(`/diary/edit/${diary.id}` as any)}
          >
            <Ionicons name="pencil" size={14} color={colors.gray} />
            <Text style={styles.editLinkText}>수정</Text>
          </TouchableOpacity>
        </View>

        {/* Diary body */}
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{getDiaryContent(diary)}</Text>
        </View>

        {/* Save prompt */}
        <Text style={styles.savePrompt}>이 일기로 저장할래요?</Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push(`/diary/edit/${diary.id}` as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>수정하기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.approveButton}
            onPress={handleApprove}
            activeOpacity={0.85}
          >
            <Text style={styles.approveButtonText}>승인하고 저장</Text>
            <Ionicons name="checkmark" size={16} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* AI Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconBg}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>
            <Text style={styles.insightTitle}>AI의 통찰</Text>
          </View>
          <Text style={styles.insightBody}>
            오늘의 당신은 감정의 변화가 컸지만 스스로를 다독이는 성숙한 태도를 보여주었습니다. 생활에서 안녕을 이어가는 서사가 매우 인상적이에요.
          </Text>
        </View>
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
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },
  headerSpacer: {
    width: 22,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.gray,
  },
  // Dropdown
  dropdown: {
    position: 'absolute',
    top: 56,
    right: 16,
    backgroundColor: colors.white,
    borderRadius: 10,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    zIndex: 100,
    minWidth: 120,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownDelete: {
    fontSize: 14,
    color: colors.negative,
  },
  // Content
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 14,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray,
    marginTop: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  dateText: {
    fontSize: 13,
    color: colors.gray,
  },
  editLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editLinkText: {
    fontSize: 13,
    color: colors.gray,
  },
  // Body
  bodyCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 26,
    color: colors.black,
  },
  // Save
  savePrompt: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.grayBorder,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  editButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.black,
  },
  approveButton: {
    flex: 1.4,
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  // AI Insight
  insightCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 16,
    padding: 18,
    gap: 10,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryPale,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  insightBody: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.primary,
  },
});
