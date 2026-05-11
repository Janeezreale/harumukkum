import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import { colors } from "../constants/colors";

interface PokeButtonProps {
  canPokeToday: boolean;
  onPress: () => void;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PokeButton = ({
  canPokeToday,
  onPress,
  isLoading = false,
  style,
}: PokeButtonProps) => {
  const disabled = !canPokeToday || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        disabled && styles.disabledButton,
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={
        canPokeToday ? "친구 찌르기" : "오늘은 이미 찔렀습니다"
      }
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            disabled && styles.disabledButtonText,
          ]}
        >
          {canPokeToday ? "찌르기" : "찌름 완료"}
        </Text>
      )}
    </Pressable>
  );
};

export default PokeButton;

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary || "#7C121C",
    borderRadius: 999,
  },
  disabledButton: {
    backgroundColor: colors.gray || "#E2E2E2",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.white || "#FFFFFF",
  },
  disabledButtonText: {
    color: colors.black || "#777777",
  },
});