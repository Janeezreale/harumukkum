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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { colors } from '../constants/colors';
import type { Diary } from '../types/diary';

// TODO: replace with api/diary.getDiaryById(id)
function getMockDiary(id: string): Diary {
  return {
    id,
    user_id: 'user-001',
    diary_date: '2026-05-26',
    when_text: '오전',
    where_text: '카페, 성수동',
    who_text: '혼자',
    what_text: '커피 마시기, 산책',
    emotion: 'happy',
    why_text: '작은 설렘과 여러 일들이 겹쳐 예민해졌지만 버텨냈다',
    body: `오전의 나는 카페의 온기 속에서 작은 설렘을 발견했다. 라테의 부드러운 거품처럼, 마음도 조금은 말랑해졌다.\n\n성수동 골목을 걷다 문득, 나도 모르게 미래의 나를 상상했다. 그 상상은 꽤 근사했다.\n\n하지만 오후가 되자 마음의 체력이 바닥났다. 여러 가지 일들이 겹치고, 꽤나 예민해지고, 쉽게 지쳤다.\n\n그래도 이상하게, 오늘의 나는 무너지지 않았다. 지친 하루를 안고서도, 나만의 방식으로 잘 버텨냈으니까.`,
    photo_url: null,
    is_public: false,
    created_at: '2026-05-26T09:00:00Z',
    updated_at: '2026-05-26T20:00:00Z',
  };
}

// TODO: replace with api/diary.deleteDiary(id)
async function mockDeleteDiary(_id: string): Promise<void> {
  return Promise.resolve();
}

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const diaryId = Array.isArray(id) ? id[0] : id ?? '';

  const diary = getMockDiary(diaryId);
  const [menuVisible, setMenuVisible] = useState(false);

  function handleDelete() {
    Alert.alert('일기 삭제', '이 일기를 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          // TODO: replace with api/diary.deleteDiary(diaryId)
          await mockDeleteDiary(diaryId);
          router.back();
        },
      },
    ]);
    setMenuVisible(false);
  }

  function handleApprove() {
    // TODO: replace with api/diary.approveDiary(diaryId)
    showToast('일기가 저장되었어요');
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.headerBack}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>오늘의 하루 묶음</Text>
        <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} hitSlop={8}>
          <Text style={styles.headerMenu}>···</Text>
        </TouchableOpacity>
      </View>

      {/* ... 드롭다운 메뉴 */}
      {menuVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity style={styles.dropdownItem} onPress={handleDelete}>
            <Text style={styles.dropdownDelete}>삭제하기</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 날짜 + 수정 아이콘 */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{formatDate(diary.diary_date)}</Text>
          <TouchableOpacity onPress={() => router.push(`/diary/edit/${diaryId}`)}>
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* 서브타이틀 */}
        <Text style={styles.subtitle}>화창하지만, 나쁘지 않은 하루</Text>

        {/* 일기 본문 */}
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{diary.body}</Text>
        </View>

        {/* AI 통찰 카드 */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightIcon}>💜</Text>
            <Text style={styles.insightTitle}>AI의 통찰</Text>
          </View>
          {/* TODO: replace with api/diary.getInsight(diaryId) */}
          <Text style={styles.insightBody}>
            오늘 하루 동안 감정의 기복이 있었지만, 끝에는 스스로를 위로하고 버텨낸 모습이 보여요.
            카페에서 느낀 작은 설렘이 하루를 이어가는 힘이 됐을지도 몰라요.
          </Text>
          <Text style={styles.insightObsLabel}>AI Observation</Text>
          <Text style={styles.insightObsBody}>
            You tend to find comfort in quiet moments. Consider adding small joys to your daily routine.
          </Text>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/diary/edit/${diaryId}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.editButtonText}>수정하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.approveButton}
          onPress={handleApprove}
          activeOpacity={0.85}
        >
          <Text style={styles.approveButtonText}>승인하고 저장 ✓</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  headerBack: {
    fontSize: 20,
    color: colors.black,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
  },
  headerMenu: {
    fontSize: 20,
    color: colors.black,
    letterSpacing: 2,
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
    color: '#EF4444',
  },
  // Scroll
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  // Date row
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: colors.gray,
  },
  editIcon: {
    fontSize: 16,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray,
    marginTop: -8,
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
  // AI 통찰 카드
  insightCard: {
    backgroundColor: '#F0EBFF',
    borderRadius: 16,
    padding: 18,
    gap: 8,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  insightIcon: {
    fontSize: 16,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
  },
  insightBody: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6D28D9',
  },
  insightObsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C3AED',
    marginTop: 4,
  },
  insightObsBody: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7C3AED',
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  editButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
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
    alignItems: 'center',
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
});
