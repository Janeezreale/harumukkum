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
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import type { Diary } from '../types/diary';

// TODO: replace with api/diary.getDiaryById(id)
function getMockDiary(id: string): Diary {
  return {
    id,
    user_id: 'user-001',
    diary_date: '2024-05-26',
    when_text: '오전',
    where_text: '카페, 성수동',
    who_text: '혼자',
    what_text: '커피 마시기, 산책',
    emotion: 'happy',
    why_text: '작은 설렘과 여러 일들이 겹쳐 예민해졌지만 버텨냈다',
    body: `오전의 나는 카페의 온기 속에서 작은 설렘을 발견했다. 라떼의 부드러운 거품처럼, 마음도 조금은 말랑해졌다.\n\n성수동 골목을 걷다 문득, 나도 모르게 미래의 나를 상상했다. 그 상상은 꽤 근사했다.\n\n하지만 오후가 되자 마음의 체력은 바닥났다. 여러 가지 일들이 겹치고, 꽤히 예민해지고, 쉽게 지쳤다.\n\n그래도 이상하게, 오늘의 나는 무너지지 않았다. 지친 하루를 안고서도, 나만의 방식으로 잘 버텨냈으니까.`,
    photo_url: null,
    is_public: false,
    created_at: '2024-05-26T09:00:00Z',
    updated_at: '2024-05-26T20:00:00Z',
  };
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
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}`;
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
          router.back();
        },
      },
    ]);
    setMenuVisible(false);
  }

  function handleApprove() {
    showToast('일기가 저장되었어요');
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
        {/* Subtitle */}
        <Text style={styles.subtitle}>복잡하지만, 나쁘지 않았던 하루</Text>

        {/* Date row */}
        <View style={styles.dateRow}>
          <View style={styles.dateBadge}>
            <View style={styles.dateDot} />
            <Text style={styles.dateText}>{formatDate(diary.diary_date)}</Text>
          </View>
          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push(`/diary/edit/${diaryId}`)}
          >
            <Ionicons name="pencil" size={14} color={colors.gray} />
            <Text style={styles.editLinkText}>수정</Text>
          </TouchableOpacity>
        </View>

        {/* Diary body */}
        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>{diary.body}</Text>
        </View>

        {/* Save prompt */}
        <Text style={styles.savePrompt}>이 일기로 저장할래요?</Text>

        {/* Action buttons */}
        <View style={styles.actionRow}>
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
            오늘의 당신은 감정의 변화가 컸지만 스스로를 다독이는 성숙한 태도를 보여주었습니다. 생활에서 "안녕"을 이어가는 서사가 매우 인상적이에요.
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
    backgroundColor: '#DDD6FE',
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
