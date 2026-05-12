import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from "react-native";
import { colors } from "../constants/colors";

// React Native 전용 Props 설정
interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: "primary" | "black" | "outline";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  leftIcon,
  rightIcon,
  fullWidth = true,
  isLoading = false,
  style, // 외부에서 전달받는 커스텀 스타일
  ...props
}: ButtonProps) {
  // 버튼 전체 스타일 결정 로직
  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      width: fullWidth ? "100%" : "auto",
      opacity: props.disabled || isLoading ? 0.5 : 1,
    };

    return [baseStyle, styles[variant], style as ViewStyle].filter(Boolean);
  };

  // 텍스트 스타일 결정 로직
  const getTextStyle = (): TextStyle => {
    if (variant === "outline") return { ...styles.text, color: colors.primary }; // 포인트 컬러 텍스트
    return styles.text;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={getButtonStyle()}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        // 웹의 animate-spin 대신 RN의 내장 로딩 인디케이터 사용
        <ActivityIndicator
          color={variant === "outline" ? colors.primary : "#FFFFFF"}
        />
      ) : (
        <View style={styles.content}>
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

          <Text style={getTextStyle()}>{children}</Text>

          {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 26, // h-[52px]의 절반인 rounded-full
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginVertical: 4,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  // 1. Primary: 핑크 배경 + 그림자
  primary: {
    backgroundColor: "#FF6B9D",
    // iOS 그림자
    shadowColor: "#e4cfd6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    // Android 그림자
    elevation: 5,
  },
  // 2. Black: 검정 배경
  black: {
    backgroundColor: "#1A1A1A",
  },
  // 3. Outline: 테두리만
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#FF6B9D",
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  iconContainer: {
    marginHorizontal: 4,
  },
});
