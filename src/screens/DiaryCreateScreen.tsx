import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { EMOTION_OPTIONS } from '../constants/emotions';
import { validateDiaryAnswer } from '../utils/validation';
import { useDiaryStore } from '../store/diaryStore';
import type { DiaryAnswer, DiaryCreateInput } from '../types/diary';

// TODO: replace with api/diary.createDiary(input)
async function mockCreateDiary(input: DiaryCreateInput) {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    id: 'mock-' + Date.now(),
    ...input,
    body: 'AI가 생성한 본문: 오늘 하루도 수고했어요. 감정의 흐름을 따라가며 당신만의 이야기가 완성되었습니다.',
  };
}

type StepKey = keyof DiaryAnswer;

type Step =
  | { key: 'emotion'; question: string; type: 'emotion' }
  | { key: 'what_text'; question: string; type: 'text'; placeholder: string }
  | { key: 'who_text'; question: string; type: 'chips'; options: string[] }
  | { key: 'when_text'; question: string; type: 'text'; placeholder: string }
  | { key: 'where_text'; question: string; type: 'text'; placeholder: string }
  | { key: 'why_text'; question: string; type: 'text'; placeholder: string };

const STEPS: Step[] = [
  { key: 'emotion', question: '오늘 당신의 기분은 어땠나요?', type: 'emotion' },
  { key: 'what_text', question: '오늘 무슨 일들이 있었나요?', type: 'text', placeholder: '예: 카페에서 공부를 했어요' },
  { key: 'who_text', question: '누구와 함께 있었나요?', type: 'chips', options: ['친구', '가족', '연인', '혼자'] },
  { key: 'when_text', question: '언제였나요?', type: 'text', placeholder: '예: 오전, 저녁' },
  { key: 'where_text', question: '어디서였나요?', type: 'text', placeholder: '예: 카페, 집' },
  { key: 'why_text', question: '왜 그런 하루를 보냈나요?', type: 'text', placeholder: '예: 시험 준비가 필요했어요' },
];

function answerLabel(step: Step, draft: Partial<DiaryAnswer>): string {
  const value = draft[step.key];
  if (!value) return '';
  if (step.key === 'emotion') {
    const opt = EMOTION_OPTIONS.find((e) => e.value === value);
    return opt ? `${opt.emoji} ${opt.label}` : String(value);
  }
  return String(value);
}

export default function DiaryCreateScreen() {
  const router = useRouter();
  const { draftAnswer, setDraftAnswer, draftPhotoUri, setDraftPhoto, resetDraft, selectedDate } =
    useDiaryStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const completedSteps = STEPS.slice(0, currentStep);
  const activeStep = STEPS[currentStep] as Step | undefined;
  const isAllDone = currentStep >= STEPS.length;

  function scrollToBottom() {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }

  function handleAnswer(key: StepKey, value: string) {
    setDraftAnswer({ [key]: value } as Partial<DiaryAnswer>);
    setTextInput('');
    setCurrentStep((s) => s + 1);
    scrollToBottom();
  }

  function handleTextSubmit() {
    if (!activeStep || activeStep.type !== 'text') return;
    const val = textInput.trim();
    if (!val) return;
    handleAnswer(activeStep.key, val);
  }

  async function handlePickPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setDraftPhoto(result.assets[0].uri);
    }
  }

  async function handleGenerate() {
    const error = validateDiaryAnswer(draftAnswer);
    if (error) {
      Alert.alert('입력 확인', error);
      return;
    }
    setIsLoading(true);
    try {
      const input: DiaryCreateInput = {
        diary_date: selectedDate,
        emotion: draftAnswer.emotion!,
        what_text: draftAnswer.what_text ?? '',
        who_text: draftAnswer.who_text ?? '',
        when_text: draftAnswer.when_text ?? '',
        where_text: draftAnswer.where_text ?? '',
        why_text: draftAnswer.why_text ?? '',
        photo_url: draftPhotoUri ?? null,
        is_public: false,
      };
      const created = await mockCreateDiary(input);
      resetDraft();
      router.replace(`/diary/${created.id}` as never);
    } catch {
      Alert.alert('오류', '일기 생성에 실패했어요. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 하루 조각</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Chat scroll */}
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 슬로건 */}
          <Text style={styles.slogan}>
            간단한 질문에 답해주시면{'\n'}AI가 당신의 하루를 정리해드려요.
          </Text>

          {/* 완료된 Q&A 말풍선 */}
          {completedSteps.map((step) => {
            const answered = answerLabel(step, draftAnswer);
            return (
              <View key={step.key}>
                {/* 질문 (왼쪽) */}
                <View style={styles.bubbleRowLeft}>
                  <View style={styles.aiBubble}>
                    <Text style={styles.aiBubbleText}>{step.question}</Text>
                  </View>
                </View>
                {/* 답변 (오른쪽) */}
                <View style={styles.bubbleRowRight}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userBubbleText}>{answered}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* 현재 질문 */}
          {activeStep && (
            <View style={styles.bubbleRowLeft}>
              <View style={styles.aiBubble}>
                <Text style={styles.aiBubbleText}>{activeStep.question}</Text>
              </View>
            </View>
          )}

          {/* 감정 이모지 선택 (Q1) */}
          {activeStep?.type === 'emotion' && (
            <View style={styles.emotionRow}>
              {EMOTION_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={styles.emotionBtn}
                  onPress={() => handleAnswer('emotion', opt.value)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emotionEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 칩 선택 (Q3: 누구와) */}
          {activeStep?.type === 'chips' && (
            <View style={styles.chipRow}>
              {activeStep.options.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={styles.chipBtn}
                  onPress={() => handleAnswer(activeStep.key, opt)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.chipBtnText}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 모든 단계 완료 → 사진 업로드 */}
          {isAllDone && (
            <View style={styles.photoSection}>
              <TouchableOpacity style={styles.photoPickBtn} onPress={handlePickPhoto} activeOpacity={0.8}>
                {draftPhotoUri ? (
                  <Image source={{ uri: draftPhotoUri }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Text style={styles.photoPickIcon}>📷</Text>
                    <Text style={styles.photoPickText}>사진 추가 (선택)</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* 텍스트 입력바 (text 단계일 때) */}
        {activeStep?.type === 'text' && (
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder={activeStep.placeholder}
              placeholderTextColor={colors.gray}
              value={textInput}
              onChangeText={setTextInput}
              onSubmitEditing={handleTextSubmit}
              returnKeyType="send"
              multiline
            />
            <TouchableOpacity
              style={[styles.sendBtn, !textInput.trim() && styles.sendBtnDisabled]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim()}
            >
              <Text style={styles.sendBtnIcon}>↑</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 하단 고정: AI 일기 생성 버튼 */}
        {isAllDone && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.generateBtn, isLoading && styles.generateBtnLoading]}
              onPress={handleGenerate}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.generateBtnText}>AI 일기 생성하기 ✦</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerBack: { fontSize: 20, color: colors.black },
  headerTitle: { fontSize: 16, fontWeight: '600', color: colors.black },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },

  slogan: {
    fontSize: 13,
    color: colors.gray,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 4,
  },

  // Chat bubbles
  bubbleRowLeft: { flexDirection: 'row', justifyContent: 'flex-start' },
  bubbleRowRight: { flexDirection: 'row', justifyContent: 'flex-end' },
  aiBubble: {
    backgroundColor: colors.white,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  aiBubbleText: { fontSize: 14, color: colors.black, lineHeight: 20 },
  userBubble: {
    backgroundColor: colors.black,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxWidth: '80%',
  },
  userBubbleText: { fontSize: 14, color: colors.white, lineHeight: 20 },

  // Emotion row
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  emotionBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emotionEmoji: { fontSize: 26 },

  // Chip row
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chipBtn: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  chipBtnText: { fontSize: 14, color: colors.black },

  // Photo section
  photoSection: { marginTop: 8 },
  photoPickBtn: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPickIcon: { fontSize: 28 },
  photoPickText: { fontSize: 13, color: colors.gray, marginTop: 4 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: colors.white,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#D1D5DB' },
  sendBtnIcon: { color: colors.white, fontSize: 18, fontWeight: '700' },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: colors.background,
  },
  generateBtn: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  generateBtnLoading: { opacity: 0.7 },
  generateBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
