import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle
} from 'react-native';
import { colors } from '../constants/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  // TextInput 자체에 적용될 스타일 타입을 명시적으로 추가
  style?: TextStyle | TextStyle[]; 
}

export const Input = ({
  label,
  error,
  containerStyle,
  style, // TextInput에 직접 적용될 커스텀 스타일
  ...props
}: InputProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {/* 1. 라벨 영역 */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* 2. 입력창 본체 */}
      <TextInput
        {...props}
        style={[
          styles.input,
          props.multiline && styles.multilineInput,
          error ? styles.inputError : null,
          style, // 사용자가 외부에서 전달한 style을 가장 마지막에 두어 우선순위를 부여함
        ]}
        placeholderTextColor={colors.gray}
        accessibilityLabel={label || props.placeholder}
        accessibilityHint={error}
      />

      {/* 3. 에러 메시지 영역 */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray,
    fontSize: 16,
    color: colors.black,
    // 그림자 설정
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  multilineInput: {
    height: 120, // 기본 높이 설정
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  // 1. 에러 색상 상수화 적용
  inputError: {
    borderColor: "#EF4444", 
  },
  errorText: {
    marginTop: 4,
    marginLeft: 4,
    fontSize: 12,
    color: "#EF4444", 
  },
});