export type DiaryValidationInput = {
  when?: string;
  where?: string;
  withWhom?: string;
  what?: string;
  emotion?: string;
  emotionReason?: string;
};

export type PhotoValidationInput = {
  uri: string;
  name?: string;
  type?: string;
  size?: number;
};

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

export const DEFAULT_MAX_PHOTO_COUNT = 3;
export const DEFAULT_MAX_PHOTO_SIZE = 5 * 1024 * 1024;

function isBlank(value?: string) {
  return !value || value.trim().length === 0;
}

function createResult(errors: string[]): ValidationResult {
  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function validateRequiredDiaryAnswers(input: DiaryValidationInput): ValidationResult {
  const errors: string[] = [];

  if (isBlank(input.when)) {
    errors.push("언제를 입력해 주세요.");
  }

  if (isBlank(input.where)) {
    errors.push("어디서를 입력해 주세요.");
  }

  if (isBlank(input.withWhom)) {
    errors.push("누구와를 입력해 주세요.");
  }

  if (isBlank(input.what)) {
    errors.push("무엇을 했는지 입력해 주세요.");
  }

  if (isBlank(input.emotion)) {
    errors.push("감정을 선택해 주세요.");
  }

  if (isBlank(input.emotionReason)) {
    errors.push("감정의 이유를 입력해 주세요.");
  }

  return createResult(errors);
}

export function validatePhotos(
  photos: PhotoValidationInput[] = [],
  maxCount = DEFAULT_MAX_PHOTO_COUNT,
  maxSize = DEFAULT_MAX_PHOTO_SIZE,
): ValidationResult {
  const errors: string[] = [];

  if (photos.length > maxCount) {
    errors.push(`사진은 최대 ${maxCount}장까지 첨부할 수 있습니다.`);
  }

  photos.forEach((photo, index) => {
    if (isBlank(photo.uri)) {
      errors.push(`${index + 1}번째 사진 파일을 확인해 주세요.`);
    }

    if (photo.size !== undefined && photo.size > maxSize) {
      errors.push(`${index + 1}번째 사진은 ${Math.floor(maxSize / 1024 / 1024)}MB 이하만 첨부할 수 있습니다.`);
    }
  });

  return createResult(errors);
}

export function validateDiaryCreateInput(
  input: DiaryValidationInput,
  photos: PhotoValidationInput[] = [],
): ValidationResult {
  const answerResult = validateRequiredDiaryAnswers(input);
  const photoResult = validatePhotos(photos);

  return createResult([...answerResult.errors, ...photoResult.errors]);
}
