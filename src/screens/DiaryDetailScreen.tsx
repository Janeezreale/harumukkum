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
import { deleteDiary, getDiaryByDate, getDiaryById, updateDiary } from '../api/diary';
import { useDiaryStore } from '../store/diaryStore';
import { supabase } from '../api/supabase';
import { formatDiaryDate } from '../utils/date';
import { getDiaryTitle, getDiaryContent } from '../utils/diary';

function showToast(message: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('', message);
  }
}

export default function DiaryDetailScreen() {
  const router = useRouter();
  const { id, date } = useLocalSearchParams<{ id?: string; date?: string }>();

  const diaryId = Array.isArray(id) ? id[0] : id ?? '';
  const diaryDate = Array.isArray(date) ? date[0] : date ?? '';
  const routeDiaryKey = diaryId || diaryDate;

  const { lastGeneratedDiary, setLastGeneratedDiary, resetDraft } =
    useDiaryStore();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const isGeneratedPreview =
    !!diary &&
    !!lastGeneratedDiary &&
    (routeDiaryKey === 'generated' ||
      lastGeneratedDiary.id === diary.id ||
      lastGeneratedDiary.diary_date === diary.diary_date);

  const moveToEdit = () => {
    if (!diary) return;

    router.push({
      pathname: '/diary/edit/[id]',
      params: {
        id: diary.id,
        returnTo: isGeneratedPreview ? 'home' : 'detail',
        isGeneratedPreview: isGeneratedPreview ? 'true' : 'false',
      },
    } as any);
  };

  useEffect(() => {
    let mounted = true;

    async function loadDiary() {
      if (!routeDiaryKey) {
        setIsLoading(false);
        return;
      }

      if (routeDiaryKey === 'generated') {
        if (mounted) {
          setDiary(lastGeneratedDiary ?? null);
          setIsPublic(lastGeneratedDiary?.is_public ?? true);
          setIsLoading(false);
        }
        return;
      }

      if (
        lastGeneratedDiary?.id === routeDiaryKey ||
        lastGeneratedDiary?.diary_date === routeDiaryKey
      ) {
        if (mounted) {
          setDiary(lastGeneratedDiary);
          setIsPublic(lastGeneratedDiary?.is_public ?? true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const isDateRoute = /^\d{4}-\d{2}-\d{2}$/.test(routeDiaryKey);

        const data = isDateRoute
          ? await getDiaryByDate(routeDiaryKey)
          : await getDiaryById(routeDiaryKey);

        if (mounted) {
          if (Array.isArray(data)) {
            setDiary(data[0] ?? null);
            setIsPublic(data[0]?.is_public ?? true);
          } else {
            setDiary(data);
            setIsPublic(data?.is_public ?? true);
          }
        }
      } catch (error) {
        console.error('Diary detail load failed', error);

        if (mounted) {
          Alert.alert('오류', '일기를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadDiary();

    return () => {
      mounted = false;
    };
  }, [lastGeneratedDiary, routeDiaryKey]);

  async function handleToggleVisibility() {
    if (!diary) return;

    setMenuVisible(false);

    const next = !isPublic;

    try {
      await updateDiary(diary.id, { is_public: next });
      setIsPublic(next);
      showToast(next ? '공개로 변경되었어요' : '비공개로 변경되었어요');
    } catch (error) {
      Alert.alert('오류', error instanceof Error ? error.message : '변경에 실패했어요.');
    }
  }

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
            router.replace('/(tabs)' as any);
          } catch (error) {
            console.error('Diary delete failed', error);

            const message =
              error instanceof Error
                ? error.message
                : '일기 삭제에 실패했어요.';

            Alert.alert('삭제 실패', message);
          } finally {
            setIsDeleting(false);
          }
        },
      },
    ]);
  }

  async function handleApprove() {
    if (!diary || isSaving) return;

    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('로그인이 필요합니다.');
      }

      const { error } = await supabase
        .from('diaries')
        .upsert(
          {
            user_id: user.id,
            diary_date: diary.diary_date,
            title: diary.title ?? '오늘의 일기',
            content: diary.content ?? diary.body ?? '',
            emotion: diary.emotion ?? null,
            is_public: isPublic,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,diary_date',
          }
        );

      if (error) {
        throw error;
      }

      Alert.alert('저장 완료', '일기가 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => {
            router.replace('/(tabs)' as any);

            setTimeout(() => {
              setLastGeneratedDiary(null);
              resetDraft();
            }, 300);
          },
        },
      ]);
    } catch (error) {
      console.error('Diary save failed', error);

      const message =
        error instanceof Error ? error.message : '일기 저장에 실패했어요.';

      Alert.alert('저장 실패', message);
    } finally {
      setIsSaving(false);
    }
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
          <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)} hitSlop={8}>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.black} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>오늘의 하루 묶음</Text>

        {!isGeneratedPreview ? (
          <TouchableOpacity onPress={() => setMenuVisible((v) => !v)} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={22} color={colors.black} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {menuVisible && !isGeneratedPreview && (
        <View style={styles.dropdown}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={handleToggleVisibility}
          >
            <Ionicons
              name={isPublic ? 'lock-closed-outline' : 'globe-outline'}
              size={14}
              color={colors.black}
              style={{ marginRight: 6 }}
            />

            <Text style={styles.dropdownText}>
              {isPublic ? '비공개로 변경' : '공개로 변경'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dropdownDivider} />

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
        <Text style={styles.subtitle}>{getDiaryTitle(diary)}</Text>

        <View style={styles.dateRow}>
          <View style={styles.dateBadge}>
            <View style={styles.dateDot} />
            <Text style={styles.dateText}>{formatDiaryDate(diary.diary_date)}</Text>
          </View>

          {!isGeneratedPreview && (
            <TouchableOpacity
              style={styles.editLink}
              onPress={moveToEdit}
            >
              <Ionicons name="pencil" size={14} color={colors.gray} />
              <Text style={styles.editLinkText}>수정</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isGeneratedPreview && (
          <View style={[styles.visibilityBadge, !isPublic && styles.visibilityBadgePrivate]}>
            <Ionicons
              name={isPublic ? 'globe-outline' : 'lock-closed-outline'}
              size={11}
              color={isPublic ? colors.primary : colors.gray}
            />

            <Text style={[styles.visibilityText, !isPublic && styles.visibilityTextPrivate]}>
              {isPublic ? '친구들에게 공개' : '나만 보기'}
            </Text>
          </View>
        )}

        <View style={styles.bodyCard}>
          <Text style={styles.bodyText}>
            {getDiaryContent(diary, '생성된 일기 본문이 비어 있어요.')}
          </Text>
        </View>

        {isGeneratedPreview && (
          <>
            <Text style={styles.savePrompt}>이 일기로 저장할래요?</Text>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={moveToEdit}
                activeOpacity={0.8}
                disabled={isSaving}
              >
                <Text style={styles.editButtonText}>수정하기</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.approveButton,
                  isSaving && styles.approveButtonDisabled,
                ]}
                onPress={handleApprove}
                activeOpacity={0.85}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.approveButtonText}>승인하고 저장</Text>
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <View style={styles.insightIconBg}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
            </View>

            <Text style={styles.insightTitle}>AI의 통찰</Text>
          </View>

          <Text style={styles.insightBody}>
            오늘의 당신은 감정의 변화가 컸지만 스스로를 다독이는 성숙한 태도를
            보여주었습니다. 생활에서 안녕을 이어가는 서사가 매우 인상적이에요.
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.grayBorder,
    marginHorizontal: 8,
  },
  dropdownText: {
    fontSize: 14,
    color: colors.black,
  },
  dropdownDelete: {
    fontSize: 14,
    color: colors.negative,
  },
  visibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.primaryBg,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  visibilityBadgePrivate: {
    backgroundColor: colors.grayLight,
  },
  visibilityText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  visibilityTextPrivate: {
    color: colors.gray,
  },
  scroll: {
    flex: 1,
  },
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
  approveButtonDisabled: {
    opacity: 0.5,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
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