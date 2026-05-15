import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { getDiaryById, updateDiary } from '../api/diary';
import { useDiaryStore } from '../store/diaryStore';
import type { Diary } from '../types/diary';
import { getDiaryTitle, getDiaryContent } from '../utils/diary';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.';
}

export default function DiaryEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const diaryId = Array.isArray(id) ? id[0] : id ?? '';

  const {
    lastGeneratedDiary,
    setLastGeneratedDiary,
    resetDraft,
  } = useDiaryStore();

  const [diary, setDiary] = useState<Diary | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadDiary() {
      if (!diaryId) {
        setIsLoading(false);
        return;
      }

      try {
        const data =
          lastGeneratedDiary?.id === diaryId
            ? lastGeneratedDiary
            : await getDiaryById(diaryId);

        if (!mounted) return;

        setDiary(data);

        if (data) {
          setTitle(getDiaryTitle(data));
          setContent(getDiaryContent(data));
          setIsPublic(data.is_public ?? true);
        }
      } catch (error) {
        console.error('Diary edit load failed', error);

        if (mounted) {
          Alert.alert('오류', '수정할 일기를 불러오지 못했어요.');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadDiary();

    return () => {
      mounted = false;
    };
  }, [diaryId, lastGeneratedDiary]);

  async function handleSave() {
    if (!diary || isSaving) return;

    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle || !nextContent) {
      Alert.alert('입력 확인', '제목과 본문을 모두 입력해 주세요.');
      return;
    }

    setIsSaving(true);

    try {
      await updateDiary(diary.id, {
        title: nextTitle,
        content: nextContent,
        is_public: isPublic,
      });

      setLastGeneratedDiary(null);
      resetDraft();

      Alert.alert('저장되었습니다.', '', [
        {
          text: '확인',
          onPress: () => {
            router.replace('/(tabs)' as any);
          },
        },
      ]);
    } catch (error) {
      console.error('Diary update failed', error);
      Alert.alert('저장 실패', getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  const isSaveDisabled = isSaving || !title.trim() || !content.trim();

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

          <Text style={styles.headerTitle}>일기 수정</Text>

          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.centerState}>
          <Text style={styles.emptyText}>수정할 일기를 찾을 수 없어요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>일기 수정</Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaveDisabled}
            hitSlop={8}
            style={styles.headerAction}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={[styles.saveText, isSaveDisabled && styles.saveTextDisabled]}>
                저장
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.label}>제목</Text>

          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="제목을 입력해 주세요"
            placeholderTextColor={colors.gray}
            maxLength={80}
          />

          <Text style={styles.label}>본문</Text>

          <TextInput
            style={styles.bodyInput}
            value={content}
            onChangeText={setContent}
            placeholder="본문을 입력해 주세요"
            placeholderTextColor={colors.gray}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Ionicons
                name={isPublic ? 'globe-outline' : 'lock-closed-outline'}
                size={16}
                color={isPublic ? colors.primary : colors.gray}
              />

              <View style={styles.toggleTextGroup}>
                <Text style={styles.toggleLabel}>공개 설정</Text>

                <Text style={styles.toggleSub}>
                  {isPublic ? '친구들이 이 일기를 볼 수 있어요' : '나만 볼 수 있어요'}
                </Text>
              </View>
            </View>

            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{
                false: colors.grayBorder,
                true: colors.primaryLight,
              }}
              thumbColor={colors.white}
            />
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveButton, isSaveDisabled && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaveDisabled}
            activeOpacity={0.85}
          >
            {isSaving ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.saveButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
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
    width: 44,
  },
  headerAction: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  saveTextDisabled: {
    color: colors.gray,
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray,
    marginTop: 8,
  },
  titleInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    fontWeight: '700',
    color: colors.black,
  },
  bodyInput: {
    minHeight: 320,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.grayBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 15,
    lineHeight: 24,
    color: colors.black,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTextGroup: {
    gap: 2,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  toggleSub: {
    fontSize: 12,
    color: colors.gray,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: colors.background,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});