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
  Image,
} from 'react-native';
import { useRef, useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import { emotions } from '../constants/emotions';
import { validateRequiredDiaryAnswers } from '../utils/validation';
import { useDiaryStore } from '../store/diaryStore';
import type { DiaryAnswer } from '../types/diary';
import { generateDiary } from '../api/diary';

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

const IMAGE_STEP_INDEX = STEPS.length;
const DONE_STEP_INDEX = STEPS.length + 1;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '알 수 없는 오류가 발생했어요.';
}

export default function DiaryCreateScreen() {
  const router = useRouter();

  const {
    draftAnswer,
    setDraftAnswer,
    draftPhotoUri,
    setDraftPhotoUri,
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
  const isImageStep = currentStep === IMAGE_STEP_INDEX;
  const isDoneStep = currentStep === DONE_STEP_INDEX;

  function getSavedValue(step: Step | undefined) {
    if (!step) {
      return '';
    }

    const value = draftAnswer[step.key];

    return typeof value === 'string' ? value : '';
  }

  function moveToStep(stepIndex: number) {
    const nextStep = STEPS[stepIndex];

    if (nextStep?.type === 'emotion') {
      const savedEmotion = draftAnswer.emotion;

      setSelectedEmotions(
        typeof savedEmotion === 'string' && savedEmotion.length > 0
          ? savedEmotion.split(',')
          : []
      );

      setTextInput('');
    } else if (nextStep?.type === 'text' || nextStep?.type === 'chips') {
      setTextInput(getSavedValue(nextStep));
    } else {
      setTextInput('');
    }

    setCurrentStep(stepIndex);

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    });
  }

  function handleBack() {
    if (isLoading) {
      return;
    }

    if (currentStep <= 0) {
      router.replace('/');
      return;
    }

    moveToStep(currentStep - 1);
  }

  function handleAnswer(key: StepKey, value: string) {
    setDraftAnswer({ [key]: value } as Partial<DiaryAnswer>);
    moveToStep(currentStep + 1);
  }

  function handleTextChange(value: string) {
    setTextInput(value);

    if (activeStep?.type === 'text' || activeStep?.type === 'chips') {
      setDraftAnswer({ [activeStep.key]: value } as Partial<DiaryAnswer>);
    }
  }

  function handleEmotionToggle(id: string) {
    setSelectedEmotions((prev) => {
      if (prev.includes(id)) {
        return prev.filter((emotionId) => emotionId !== id);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, id];
    });
  }

  function handleEmotionConfirm() {
    if (selectedEmotions.length === 0) {
      return;
    }

    handleAnswer('emotion', selectedEmotions.join(','));
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

  function handleImageStepNext() {
    moveToStep(DONE_STEP_INDEX);
  }

  async function handlePickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한 필요', '사진을 선택하려면 앨범 접근 권한이 필요해요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setDraftPhotoUri(result.assets[0].uri);
  }

  function handleRemoveImage() {
    setDraftPhotoUri(null);
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
    const imageUrls = draftPhotoUri ? [draftPhotoUri] : [];

    const created = await generateDiary({
      diaryDate: selectedDate,
      emotion: draftAnswer.emotion!,
      whatText: draftAnswer.what_text ?? '',
      withWhomText: draftAnswer.who_text ?? '',
      whenText: draftAnswer.when_text ?? '',
      whereText: draftAnswer.where_text ?? '',
      reasonText: draftAnswer.why_text ?? '',
      imageUrls,
    });

    setLastGeneratedDiary(created);

    // 중요:
    // 아직 DB에 저장되지 않은 일기이기 때문에 /diary/${created.id}로 보내면 안 됨
    // /diary/[id] 화면은 Supabase에서 id로 조회하기 때문에 PGRST116 오류가 발생함
    router.push('/diary/generated' as any);
  } catch (error) {
    console.error('Diary generation failed', error);
    Alert.alert('일기 생성 실패', getErrorMessage(error));
  } finally {
    setIsLoading(false);
  }
}

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} hitSlop={8}>
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
                    const isDisabled =
                      !isSelected && selectedEmotions.length >= 3;

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
                        <Text style={styles.emotionEmoji}>
                          {emotionOption.emoji}
                        </Text>

                        <Text
                          style={[
                            styles.emotionLabel,
                            isSelected && styles.emotionLabelSelected,
                          ]}
                        >
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
                  onChangeText={handleTextChange}
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
                      onChangeText={handleTextChange}
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

            {isImageStep && (
              <View style={styles.imageStepCard}>
                <Ionicons name="image-outline" size={44} color={colors.primary} />

                <Text style={styles.imageStepTitle}>오늘의 이미지를 추가할까요?</Text>

                <Text style={styles.imageStepSubtext}>
                  이미지는 선택사항이에요. 추가하지 않아도 일기를 생성할 수 있어요.
                </Text>

                <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
                  <Ionicons name="image-outline" size={20} color={colors.text} />
                  <Text style={styles.imageButtonText}>
                    {draftPhotoUri ? '이미지 변경하기' : '이미지 추가하기'}
                  </Text>
                </TouchableOpacity>

                {draftPhotoUri && (
                  <View style={styles.previewWrapper}>
                    <Image
                      source={{ uri: draftPhotoUri }}
                      style={styles.previewImage}
                    />

                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={handleRemoveImage}
                    >
                      <Ionicons name="close" size={18} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                )}

                {!draftPhotoUri && (
                  <Text style={styles.noImageText}>
                    선택된 이미지가 없습니다.
                  </Text>
                )}
              </View>
            )}

            {isDoneStep && (
              <View style={styles.doneCard}>
                <Ionicons
                  name="checkmark-circle"
                  size={52}
                  color={colors.primary}
                />

                <Text style={styles.doneText}>일기 생성 준비가 완료되었어요!</Text>

                <Text style={styles.doneSubtext}>
                  아래 버튼을 누르면 AI가 당신의 하루를 일기로 엮어드릴게요.
                </Text>

                {draftPhotoUri ? (
                  <View style={styles.doneImagePreviewBox}>
                    <Image
                      source={{ uri: draftPhotoUri }}
                      style={styles.donePreviewImage}
                    />
                    <Text style={styles.doneImageText}>
                      이미지가 함께 추가됩니다.
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.noImageText}>
                    이미지 없이 일기가 생성됩니다.
                  </Text>
                )}
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
            ) : activeStep?.type === 'chips' ? null : isImageStep ? (
              <TouchableOpacity
                style={styles.generateBtn}
                onPress={handleImageStepNext}
                activeOpacity={0.85}
              >
                <Text style={styles.generateBtnText}>
                  {draftPhotoUri ? '이 이미지로 계속하기' : '이미지 없이 계속하기'}
                </Text>
              </TouchableOpacity>
            ) : isDoneStep ? (
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
    </>
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
  chipBtnText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
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
  imageStepCard: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 32,
    width: '100%',
  },
  imageStepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  imageStepSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  imageButton: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.grayBorder,
  },
  imageButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  previewWrapper: {
    position: 'relative',
    width: '100%',
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    backgroundColor: colors.grayLight,
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
  },
  doneCard: {
    alignItems: 'center',
    gap: 14,
    paddingVertical: 32,
    width: '100%',
  },
  doneText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
    textAlign: 'center',
  },
  doneSubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  doneImagePreviewBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.grayBorder,
  },
  donePreviewImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: colors.grayLight,
  },
  doneImageText: {
    fontSize: 13,
    color: colors.gray,
    textAlign: 'center',
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
