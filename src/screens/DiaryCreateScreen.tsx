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
  ActivityIndicator,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { emotions } from '../constants/emotions';
import { validateRequiredDiaryAnswers } from '../utils/validation';
import { useDiaryStore } from '../store/diaryStore';
import type { DiaryAnswer, DiaryCreateInput } from '../types/diary';

// TODO: replace with api/diary.createDiary(input)
async function mockCreateDiary(input: DiaryCreateInput) {
  await new Promise((r) => setTimeout(r, 1000));
  return {
    id: 'mock-' + Date.now(),
    ...input,
    body: 'AI가 생성한 본문: 오늘 하루도 수고했어요.',
  };
}

type StepKey = keyof DiaryAnswer;

type Step =
  | { key: 'emotion'; question: string; type: 'emotion' }
  | { key: 'what_text'; question: string; type: 'text'; placeholder: string; example: string }
  | { key: 'who_text'; question: string; type: 'chips'; options: string[] }
  | { key: 'why_text'; question: string; type: 'text'; placeholder: string; example: string };

const STEPS: Step[] = [
  { key: 'emotion', question: '오늘 당신의 기분은 어땠나요?', type: 'emotion' },
  {
    key: 'what_text',
    question: '어떤 일들이 있었어요?',
    type: 'text',
    placeholder: '입력해주세요.',
    example: '예시: 카페에서 공부를 했어요. 한강에서 피크닉을 했어요.',
  },
  {
    key: 'who_text',
    question: '누구와 함께 하루를 보냈나요?',
    type: 'chips',
    options: ['친구', '가족', '연인', '혼자', '기타'],
  },
  {
    key: 'why_text',
    question: '남기고 싶은 오늘의 생각은 무엇인가요?',
    type: 'text',
    placeholder: '입력해주세요.',
    example: '예시: 날씨가 좋아서 행복했던 하루. 파스타가 맛있었다.',
  },
];

export default function DiaryCreateScreen() {
  const router = useRouter();
  const { draftAnswer, setDraftAnswer, draftPhotoUri, resetDraft, selectedDate } =
    useDiaryStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const activeStep = STEPS[currentStep] as Step | undefined;
  const isAllDone = currentStep >= STEPS.length;

  function handleAnswer(key: StepKey, value: string) {
    setDraftAnswer({ [key]: value } as Partial<DiaryAnswer>);
    setTextInput('');
    setCurrentStep((s) => s + 1);
  }

  function handleTextSubmit() {
    if (!activeStep || activeStep.type !== 'text') return;
    const val = textInput.trim();
    if (!val) return;
    handleAnswer(activeStep.key, val);
  }

  async function handleGenerate() {
    const result = validateRequiredDiaryAnswers({
      when: draftAnswer.when_text,
      where: draftAnswer.where_text,
      withWhom: draftAnswer.who_text,
      what: draftAnswer.what_text,
      emotion: draftAnswer.emotion,
      emotionReason: draftAnswer.why_text,
    });
    if (!result.isValid) {
      Alert.alert('입력 확인', result.errors[0]);
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
      router.replace(`/diary/${created.id}` as any);
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
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>오늘의 하루 조각</Text>
          <TouchableOpacity hitSlop={8}>
            <Ionicons name="diamond-outline" size={20} color={colors.black} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Slogan */}
          <Text style={styles.slogan}>
            간단한 질문에 답해주시면{'\n'}AI가 당신의 하루를 정리해드려요.
          </Text>

          {/* Question Card */}
          {activeStep && (
            <View style={styles.questionCard}>
              <View style={styles.questionInner}>
                <Text style={styles.questionText}>{activeStep.question}</Text>
              </View>
            </View>
          )}

          {/* Emotion Selection */}
          {activeStep?.type === 'emotion' && (
            <View style={styles.emotionRow}>
              {emotions.slice(0, 5).map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  onPress={() => handleAnswer('emotion', opt.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emotionEmoji}>{opt.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Text Input Area */}
          {activeStep?.type === 'text' && (
            <View style={styles.textArea}>
              <TextInput
                style={styles.textInput}
                placeholder={activeStep.placeholder}
                placeholderTextColor={colors.gray}
                value={textInput}
                onChangeText={setTextInput}
                returnKeyType="done"
                multiline
              />
              <Text style={styles.exampleText}>{activeStep.example}</Text>
            </View>
          )}

          {/* Chip Selection */}
          {activeStep?.type === 'chips' && (
            <View style={styles.chipArea}>
              <View style={styles.chipRow}>
                {activeStep.options.map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.chipBtn}
                    onPress={() => {
                      if (opt === '기타') return;
                      handleAnswer(activeStep.key, opt);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipBtnText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {activeStep.options.includes('기타') && (
                <View style={styles.chipInputRow}>
                  <View style={styles.chipBtn}>
                    <Text style={styles.chipBtnText}>기타</Text>
                  </View>
                  <TextInput
                    style={styles.chipTextInput}
                    placeholder="입력해주세요"
                    placeholderTextColor={colors.gray}
                    value={textInput}
                    onChangeText={setTextInput}
                    onSubmitEditing={() => {
                      if (textInput.trim()) handleAnswer(activeStep.key, textInput.trim());
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {/* All done state */}
          {isAllDone && (
            <View style={styles.doneCard}>
              <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
              <Text style={styles.doneText}>모든 질문에 답해주셨어요!</Text>
              <Text style={styles.doneSubtext}>AI가 당신의 하루를 엮어드릴게요.</Text>
            </View>
          )}
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          {activeStep?.type === 'text' ? (
            <TouchableOpacity
              style={[styles.generateBtn, !textInput.trim() && styles.generateBtnDisabled]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.generateBtnText}>다음</Text>
            </TouchableOpacity>
          ) : isAllDone ? (
            <TouchableOpacity
              style={[styles.generateBtn, isLoading && styles.generateBtnDisabled]}
              onPress={handleGenerate}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.generateBtnText}>AI 일기 생성하기  ✦</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.black },

  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },

  slogan: {
    fontSize: 15,
    color: colors.gray,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },

  // Question card (matches design's centered card style)
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  questionInner: {
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    textAlign: 'center',
  },

  // Emotion row
  emotionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 4,
  },
  emotionEmoji: { fontSize: 32 },

  // Text input area
  textArea: {
    gap: 8,
  },
  textInput: {
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.black,
    minHeight: 48,
  },
  exampleText: {
    fontSize: 13,
    color: colors.gray,
    paddingHorizontal: 4,
  },

  // Chips
  chipArea: {
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chipBtn: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.grayBorder,
  },
  chipBtnText: { fontSize: 15, color: colors.black, fontWeight: '500' },
  chipInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipTextInput: {
    flex: 1,
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
  },

  // Done state
  doneCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 32,
  },
  doneText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.black,
  },
  doneSubtext: {
    fontSize: 14,
    color: colors.gray,
  },

  // Bottom bar
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.background,
  },
  generateBtn: {
    backgroundColor: colors.black,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  generateBtnDisabled: { opacity: 0.4 },
  generateBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
});
