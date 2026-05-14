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
import { generateDiary } from '../api/diary';
import type { DiaryAnswer } from '../types/diary';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.';
}

type StepKey = keyof DiaryAnswer;

type Step =
  | { key: 'emotion'; question: string; type: 'emotion' }
  | {
      key: 'when_text';
      question: string;
      type: 'text';
      placeholder: string;
      example: string;
    }
  | {
      key: 'where_text';
      question: string;
      type: 'text';
      placeholder: string;
      example: string;
    }
  | {
      key: 'what_text';
      question: string;
      type: 'text';
      placeholder: string;
      example: string;
    }
  | {
      key: 'who_text';
      question: string;
      type: 'chips';
      options: string[];
    }
  | {
      key: 'why_text';
      question: string;
      type: 'text';
      placeholder: string;
      example: string;
    };

const STEPS: Step[] = [
  {
    key: 'emotion',
    question: '오늘 당신의 기분은 어땠나요?',
    type: 'emotion',
  },
  {
    key: 'when_text',
    question: '언제 일어난 일인가요?',
    type: 'text',
    placeholder: '입력해주세요.',
    example: '예시: 오늘 오후, 어제 저녁, 5월 13일 점심시간',
  },
  {
    key: 'where_text',
    question: '어디에서 있었던 일인가요?',
    type: 'text',
    placeholder: '입력해주세요.',
    example: '예시: 학교, 카페, 집, 회의실, 한강',
  },
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
  const {
    draftAnswer,
    setDraftAnswer,
    resetDraft,
    selectedDate,
    setLastGeneratedDiary,
  } = useDiaryStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);

  const scrollRef = useRef<ScrollView>(null);

  const activeStep = STEPS[currentStep] as Step | undefined;
  const isAllDone = currentStep >= STEPS.length;

  function handleAnswer(key: StepKey, value: string) {
    setDraftAnswer({ [key]: value } as Partial<DiaryAnswer>);
    setTextInput('');
    setCurrentStep((step) => step + 1);
  }

  function handleEmotionToggle(id: string) {
    setSelectedEmotions((prev) => {
      if (prev.includes(id)) return prev.filter((e) => e !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  function handleEmotionConfirm() {
    if (selectedEmotions.length === 0) return;
    handleAnswer('emotion', selectedEmotions.join(','));
    setSelectedEmotions([]);
  }

  function handleTextSubmit() {
    if (!activeStep || activeStep.type !== 'text') {
      return;
    }

    const value = textInput.trim();

    if (!value) {
      return;
    }

    handleAnswer(activeStep.key, value);
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
      const created = await generateDiary({
        diaryDate: selectedDate,
        emotion: draftAnswer.emotion!,
        whatText: draftAnswer.what_text ?? '',
        withWhomText: draftAnswer.who_text ?? '',
        whenText: draftAnswer.when_text ?? '',
        whereText: draftAnswer.where_text ?? '',
        reasonText: draftAnswer.why_text ?? '',
      });
      setLastGeneratedDiary(created);
      resetDraft();
      router.replace(`/diary/${created.id}` as any);
    } catch (error) {
      console.error('Diary generation failed', error);
      Alert.alert('일기 생성 실패', getErrorMessage(error));
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
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={22} color={colors.black} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>오늘의 하루 조각</Text>

          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.slogan}>
            간단한 질문에 답해주시면{'\n'}AI가 당신의 하루를 정리해드려요.
          </Text>

          {activeStep && (
            <View style={styles.questionCard}>
              <View style={styles.questionInner}>
                <Text style={styles.questionText}>{activeStep.question}</Text>
              </View>
            </View>
          )}

          {activeStep?.type === 'emotion' && (
            <>
              <Text style={styles.emotionHint}>
                최대 3개까지 고를 수 있어요 ({selectedEmotions.length}/3)
              </Text>
              <View style={styles.emotionGrid}>
                {emotions.map((emotionOption) => {
                  const isSelected = selectedEmotions.includes(emotionOption.id);
                  const isDisabled = !isSelected && selectedEmotions.length >= 3;
                  return (
                    <TouchableOpacity
                      key={emotionOption.id}
                      style={[
                        styles.emotionItem,
                        isSelected && styles.emotionItemSelected,
                        isDisabled && styles.emotionItemDisabled,
                      ]}
                      onPress={() => handleEmotionToggle(emotionOption.id)}
                      activeOpacity={0.7}
                      disabled={isDisabled}
                    >
                      <Text style={styles.emotionEmoji}>{emotionOption.emoji}</Text>
                      <Text style={[styles.emotionLabel, isSelected && styles.emotionLabelSelected]}>
                        {emotionOption.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

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

          {activeStep?.type === 'chips' && (
            <View style={styles.chipArea}>
              <View style={styles.chipRow}>
                {activeStep.options.map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={styles.chipBtn}
                    onPress={() => {
                      if (option === '기타') {
                        return;
                      }

                      handleAnswer(activeStep.key, option);
                    }}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.chipBtnText}>{option}</Text>
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
                      if (textInput.trim()) {
                        handleAnswer(activeStep.key, textInput.trim());
                      }
                    }}
                  />
                </View>
              )}
            </View>
          )}

          {isAllDone && (
            <View style={styles.doneCard}>
              <Ionicons
                name="checkmark-circle"
                size={48}
                color={colors.primary}
              />

              <Text style={styles.doneText}>모든 질문에 답해주셨어요!</Text>

              <Text style={styles.doneSubtext}>
                AI가 당신의 하루를 엮어드릴게요.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.bottomBar}>
          {activeStep?.type === 'emotion' ? (
            <TouchableOpacity
              style={[
                styles.generateBtn,
                selectedEmotions.length === 0 && styles.generateBtnDisabled,
              ]}
              onPress={handleEmotionConfirm}
              disabled={selectedEmotions.length === 0}
              activeOpacity={0.85}
            >
              <Text style={styles.generateBtnText}>선택 완료</Text>
            </TouchableOpacity>
          ) : activeStep?.type === 'text' ? (
            <TouchableOpacity
              style={[
                styles.generateBtn,
                !textInput.trim() && styles.generateBtnDisabled,
              ]}
              onPress={handleTextSubmit}
              disabled={!textInput.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.generateBtnText}>다음</Text>
            </TouchableOpacity>
          ) : isAllDone ? (
            <TouchableOpacity
              style={[
                styles.generateBtn,
                isLoading && styles.generateBtnDisabled,
              ]}
              onPress={handleGenerate}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.generateBtnText}>
                  AI 일기 생성하기 ✦
                </Text>
              )}
            </TouchableOpacity>
          ) : null}
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 20,
  },
  slogan: {
    fontSize: 16,
    color: colors.gray,
    lineHeight: 26,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  questionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 4,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  questionInner: {
    backgroundColor: 'rgba(97, 75, 190, 0.06)',
    borderRadius: 12,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
  },
  emotionHint: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 4,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
    paddingVertical: 8,
  },
  emotionItem: {
    alignItems: 'center',
    gap: 4,
    width: 56,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emotionItemSelected: {
    backgroundColor: 'rgba(97, 75, 190, 0.08)',
    borderColor: colors.primary,
  },
  emotionItemDisabled: {
    opacity: 0.3,
  },
  emotionEmoji: {
    fontSize: 32,
  },
  emotionLabel: {
    fontSize: 11,
    color: colors.gray,
    textAlign: 'center',
  },
  emotionLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  textArea: {
    gap: 8,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.text,
    minHeight: 54,
    borderWidth: 1,
    borderColor: 'rgba(196, 199, 199, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 20,
    elevation: 1,
  },
  exampleText: {
    fontSize: 13,
    color: colors.placeholder,
    paddingHorizontal: 4,
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  chipBtnText: { fontSize: 15, color: colors.text, fontWeight: '500' },
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
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    paddingBottom: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.grayBorder,
  },
  generateBtn: {
    backgroundColor: colors.black,
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  generateBtnDisabled: {
    opacity: 0.4,
  },
  generateBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
